import os
import logging
import asyncio
from fastapi import APIRouter, Request, Response, Form
from twilio.twiml.voice_response import VoiceResponse, Gather
from core.config import get_settings
from google import genai
from google.genai import types

# Initialize router
router = APIRouter(prefix="/api/v1/twilio", tags=["twilio"])
logger = logging.getLogger(__name__)

# In-memory session storage
# Structure: { call_sid: { "history": [ ... ] } }
sessions = {}

async def get_gemini_client():
    settings = get_settings()
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY not set")
    return genai.Client(api_key=settings.gemini_api_key, http_options={"api_version": "v1alpha"})

# --- Tool Definitions ---

async def search_knowledge_base(query: str):
    """Search the IT knowledge base for solutions."""
    logger.info(f"Tool Call: search_knowledge_base('{query}')")
    try:
        from main import get_knowledge_service
        knowledge_service = await get_knowledge_service()
        results = await knowledge_service.search(query, limit=3)
        if not results:
            return "No relevant information found in the knowledge base."
        
        response_text = "Here is what I found:\n"
        for res in results:
            response_text += f"- {res.get('title')}: {res.get('content_snippet')}\n"
        return response_text
    except Exception as e:
        logger.error(f"Error in search_knowledge_base: {e}")
        return "I encountered an error searching the knowledge base."

async def create_ticket(title: str, description: str, category: str = "General Support"):
    """Create a new IT support ticket."""
    logger.info(f"Tool Call: create_ticket('{title}')")
    try:
        from main import get_database
        db = get_database()
        
        ticket_data = {
            "title": title,
            "description": description,
            "category": category,
            "status": "new",
            "priority": "Medium",
            "requester_name": "Voice Caller",
            "source": "phone"
        }
        ticket_id = db.create_ticket(ticket_data)
        return f"Ticket created successfully. Ticket ID is {ticket_id}."
    except Exception as e:
        logger.error(f"Error in create_ticket: {e}")
        return "I encountered an error creating the ticket."

# Gemini Tool Schema
tools_def = [types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="search_knowledge_base",
        description="Search the IT knowledge base for solutions to user problems.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "query": types.Schema(type=types.Type.STRING, description="The search query based on user's problem")
            },
            required=["query"]
        )
    ),
    types.FunctionDeclaration(
        name="create_ticket",
        description="Create a new IT support ticket when the problem cannot be solved.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "title": types.Schema(type=types.Type.STRING, description="Brief title of the issue"),
                "description": types.Schema(type=types.Type.STRING, description="Detailed description of the issue"),
                "category": types.Schema(type=types.Type.STRING, description="Category of the issue (e.g., Hardware, Software, Network)")
            },
            required=["title", "description"]
        )
    )
])]

# --- Endpoints ---

@router.post("/voice")
async def voice_webhook(request: Request):
    """
    Handle incoming Twilio voice calls.
    Initiates the conversation and returns TwiML with <Gather>.
    """
    form = await request.form()
    call_sid = form.get("CallSid")
    
    logger.info(f"New call received: {call_sid}")
    
    # Initialize session with system instruction in history (or just rely on config)
    # We'll use history to keep context.
    sessions[call_sid] = {
        "history": []
    }
    
    response = VoiceResponse()
    # Use a nice voice
    response.say("Hello! I am your IT support assistant. How can I help you today?", voice="Polly.Joanna")
    
    gather = Gather(input="speech", action="/api/v1/twilio/process_speech", speechTimeout="auto")
    response.append(gather)
    
    # If no input, redirect to self to loop (or say goodbye)
    response.redirect("/api/v1/twilio/voice")
    
    return Response(content=str(response), media_type="application/xml")

@router.post("/process_speech")
async def process_speech(request: Request):
    """
    Process speech input from Twilio <Gather>.
    Interacts with Gemini and returns TwiML with response.
    """
    form = await request.form()
    call_sid = form.get("CallSid")
    speech_result = form.get("SpeechResult")
    
    logger.info(f"Processing speech for {call_sid}: {speech_result}")
    
    if not call_sid or call_sid not in sessions:
        # Session lost or invalid, restart
        logger.warning(f"Session not found for {call_sid}, restarting.")
        response = VoiceResponse()
        response.say("I lost our connection. Let's start over.", voice="Polly.Joanna")
        response.redirect("/api/v1/twilio/voice")
        return Response(content=str(response), media_type="application/xml")
        
    session = sessions[call_sid]
    
    if not speech_result:
        # No speech detected
        response = VoiceResponse()
        response.say("I didn't catch that. Could you please repeat?", voice="Polly.Joanna")
        gather = Gather(input="speech", action="/api/v1/twilio/process_speech", speechTimeout="auto")
        response.append(gather)
        return Response(content=str(response), media_type="application/xml")
        
    # Call Gemini
    try:
        client = await get_gemini_client()
        
        # Create chat session with history
        chat = client.aio.chats.create(
            model="models/gemini-2.5-flash",
            config=types.GenerateContentConfig(
                tools=tools_def,
                system_instruction="You are a helpful IT Support AI. Keep your answers concise (1-2 sentences) and conversational suitable for voice. If the user says goodbye, say goodbye and end the conversation."
            ),
            history=session["history"]
        )
        
        # Send user message
        response_content = await chat.send_message(speech_result)
        
        # Handle Tool Calls Loop
        current_response = response_content
        model_response_text = ""
        
        while True:
            # Check if we have candidates
            if not current_response.candidates:
                break
                
            # Check for function calls in the first part (or any part)
            # We iterate through parts to find function calls
            parts = current_response.candidates[0].content.parts
            function_calls = [p.function_call for p in parts if p.function_call]
            
            if function_calls:
                # Execute function calls
                function_responses = []
                for fc in function_calls:
                    name = fc.name
                    args = fc.args
                    logger.info(f"Executing Tool: {name} with args: {args}")
                    
                    result = None
                    if name == "search_knowledge_base":
                        result = await search_knowledge_base(args["query"])
                    elif name == "create_ticket":
                        result = await create_ticket(args["title"], args["description"], args.get("category", "General Support"))
                    
                    logger.info(f"Tool Result: {result}")
                    
                    function_responses.append(types.Part(
                        function_response=types.FunctionResponse(
                            name=name,
                            id=fc.id, # Important to include ID if present, or else it might fail? SDK usually handles it.
                            response={"result": result}
                        )
                    ))
                
                # Send function responses back to Gemini
                current_response = await chat.send_message(function_responses)
            else:
                # No function calls, extract text
                model_response_text = "".join([p.text for p in parts if p.text])
                break
        
        # Update session history
        # AsyncChat uses _curated_history for the list of contents
        session["history"] = chat._curated_history
        
        logger.info(f"Gemini Response: {model_response_text}")
        
        response = VoiceResponse()
        response.say(model_response_text, voice="Polly.Joanna")
        
        # Check if conversation should end
        if "goodbye" in speech_result.lower() or "bye" in speech_result.lower():
             response.hangup()
        else:
            gather = Gather(input="speech", action="/api/v1/twilio/process_speech", speechTimeout="auto")
            response.append(gather)
        
        return Response(content=str(response), media_type="application/xml")
        
    except Exception as e:
        logger.error(f"Error in process_speech: {e}", exc_info=True)
        response = VoiceResponse()
        response.say("I'm sorry, I encountered an error. Please try again.", voice="Polly.Joanna")
        gather = Gather(input="speech", action="/api/v1/twilio/process_speech", speechTimeout="auto")
        response.append(gather)
        return Response(content=str(response), media_type="application/xml")