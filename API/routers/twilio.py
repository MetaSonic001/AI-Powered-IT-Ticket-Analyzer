import os
import logging
import asyncio
from fastapi import APIRouter, Request, Response, BackgroundTasks
from twilio.twiml.voice_response import VoiceResponse, Gather
from core.config import get_settings
from google import genai
from google.genai import types

# Initialize router
router = APIRouter(prefix="/api/v1/twilio", tags=["twilio"])
logger = logging.getLogger(__name__)

# In-memory session storage
sessions = {}

# Reusable Gemini client (connection pooling)
_gemini_client = None

async def get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        settings = get_settings()
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not set")
        _gemini_client = genai.Client(
            api_key=settings.gemini_api_key, 
            http_options={"api_version": "v1alpha"}
        )
    return _gemini_client

# --- Tool Definitions (with timeouts) ---

async def search_knowledge_base(query: str):
    """Search the IT knowledge base for solutions."""
    logger.info(f"Tool Call: search_knowledge_base('{query}')")
    try:
        # Add timeout to prevent hanging
        async with asyncio.timeout(3):  # 3 second timeout
            from main import get_knowledge_service
            knowledge_service = await get_knowledge_service()
            results = await knowledge_service.search(query, limit=2)  # Reduced to 2 results
            if not results:
                return "No relevant information found."
            
            # Shortened response format
            response_text = ""
            for res in results[:2]:  # Only first 2
                response_text += f"{res.get('title')}: {res.get('content_snippet', '')[:100]}... "
            return response_text.strip()
    except asyncio.TimeoutError:
        logger.error("search_knowledge_base timed out")
        return "Search timed out. Please try again."
    except Exception as e:
        logger.error(f"Error in search_knowledge_base: {e}")
        return "Search error occurred."

async def create_ticket(title: str, description: str, category: str = "General Support"):
    """Create a new IT support ticket."""
    logger.info(f"Tool Call: create_ticket('{title}')")
    try:
        async with asyncio.timeout(2):  # 2 second timeout
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
            return f"Ticket {ticket_id} created."
    except asyncio.TimeoutError:
        logger.error("create_ticket timed out")
        return "Ticket creation timed out."
    except Exception as e:
        logger.error(f"Error in create_ticket: {e}")
        return "Ticket creation failed."

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
                "category": types.Schema(type=types.Type.STRING, description="Category of the issue")
            },
            required=["title", "description"]
        )
    )
])]

# --- Endpoints ---

@router.post("/voice")
async def voice_webhook(request: Request):
    """Handle incoming Twilio voice calls."""
    form = await request.form()
    call_sid = form.get("CallSid")
    
    logger.info(f"New call received: {call_sid}")
    
    # Initialize session
    sessions[call_sid] = {"history": []}
    
    response = VoiceResponse()
    response.say("Hello! I'm your IT support assistant. How can I help?", voice="Polly.Joanna", language="en-US")
    
    gather = Gather(
        input="speech", 
        action="/api/v1/twilio/process_speech", 
        speechTimeout="auto",
        speechModel="phone_call",
        enhanced=True,
        language="en-US"
    )
    response.append(gather)
    
    response.redirect("/api/v1/twilio/voice")
    
    return Response(content=str(response), media_type="application/xml")

@router.post("/process_speech")
async def process_speech(request: Request, background_tasks: BackgroundTasks):
    """Process speech input from Twilio <Gather>."""
    form = await request.form()
    call_sid = form.get("CallSid")
    speech_result = form.get("SpeechResult")
    
    logger.info(f"Processing speech for {call_sid}: {speech_result}")
    
    # Quick validation
    if not call_sid or call_sid not in sessions:
        response = VoiceResponse()
        response.say("Session error. Let's start over.", voice="Polly.Joanna", language="en-US")
        response.redirect("/api/v1/twilio/voice")
        return Response(content=str(response), media_type="application/xml")
    
    session = sessions[call_sid]
    
    if not speech_result:
        response = VoiceResponse()
        response.say("I didn't catch that. Please repeat.", voice="Polly.Joanna", language="en-US")
        gather = Gather(
            input="speech", 
            action="/api/v1/twilio/process_speech", 
            speechTimeout="auto",
            speechModel="phone_call",
            enhanced=True,
            language="en-US"
        )
        response.append(gather)
        return Response(content=str(response), media_type="application/xml")
    
    # Check for goodbye immediately (skip AI processing)
    if any(word in speech_result.lower() for word in ["goodbye", "bye", "thank you thanks", "that's all", "done"]):
        response = VoiceResponse()
        response.say("Thank you for contacting IT support. Goodbye!", voice="Polly.Joanna", language="en-US")
        response.hangup()
        # Clean up session in background
        background_tasks.add_task(lambda: sessions.pop(call_sid, None))
        return Response(content=str(response), media_type="application/xml")
    
    # Call Gemini with overall timeout
    try:
        async with asyncio.timeout(8):  # 8 second total timeout
            client = await get_gemini_client()
            
            # Optimized config: lower max_tokens, higher temperature for faster responses
            chat = client.aio.chats.create(
                model="models/gemini-2.5-flash-lite",  # Faster model
                config=types.GenerateContentConfig(
                    tools=tools_def,
                    system_instruction="You are an IT Support AI. Respond in 1-2 short sentences suitable for voice. Be direct and helpful. Use tools only when absolutely necessary.",
                    temperature=0.5,  # Slightly higher for faster generation
                    max_output_tokens=150,  # Reduced token limit
                    candidate_count=1
                ),
                history=session.get("history", [])
            )
            
            # Send user message
            response_content = await chat.send_message(speech_result)
            
            # Handle Tool Calls (with limit)
            current_response = response_content
            model_response_text = ""
            tool_call_count = 0
            max_tool_calls = 2  # Limit tool calls to prevent long chains
            
            while tool_call_count < max_tool_calls:
                if not current_response.candidates:
                    break
                
                parts = current_response.candidates[0].content.parts
                function_calls = [p.function_call for p in parts if p.function_call]
                
                if function_calls:
                    tool_call_count += 1
                    
                    # Execute tools in parallel for speed
                    async def execute_tool(fc):
                        name = fc.name
                        args = fc.args
                        logger.info(f"Executing Tool: {name}")
                        
                        result = None
                        if name == "search_knowledge_base":
                            result = await search_knowledge_base(args.get("query", ""))
                        elif name == "create_ticket":
                            result = await create_ticket(
                                args.get("title", ""), 
                                args.get("description", ""), 
                                args.get("category", "General Support")
                            )
                        
                        return types.Part(
                            function_response=types.FunctionResponse(
                                name=name,
                                id=fc.id,
                                response={"result": result}
                            )
                        )
                    
                    # Run all tool calls in parallel
                    function_responses = await asyncio.gather(
                        *[execute_tool(fc) for fc in function_calls],
                        return_exceptions=True
                    )
                    
                    # Filter out exceptions
                    valid_responses = [r for r in function_responses if not isinstance(r, Exception)]
                    
                    if valid_responses:
                        current_response = await chat.send_message(valid_responses)
                    else:
                        model_response_text = "I encountered an error processing your request."
                        break
                else:
                    # No function calls, extract text
                    model_response_text = "".join([p.text for p in parts if p.text]).strip()
                    break
            
            # Update session history in background
            background_tasks.add_task(lambda: session.update({"history": chat._curated_history}))
            
            # Fallback response
            if not model_response_text:
                model_response_text = "I'm not sure. Could you rephrase that?"
            
            logger.info(f"Response: {model_response_text}")
            
            response = VoiceResponse()
            response.say(model_response_text, voice="Polly.Joanna", language="en-US")
            
            # Continue conversation
            gather = Gather(
                input="speech", 
                action="/api/v1/twilio/process_speech", 
                speechTimeout="auto",
                speechModel="phone_call",
                enhanced=True,
                language="en-US"
            )
            response.append(gather)
            
            # Timeout fallback
            response.say("Anything else?", voice="Polly.Joanna", language="en-US")
            
            return Response(content=str(response), media_type="application/xml")
    
    except asyncio.TimeoutError:
        logger.error(f"Overall timeout for {call_sid}")
        response = VoiceResponse()
        response.say("Sorry, that's taking too long. Please try a simpler question.", voice="Polly.Joanna", language="en-US")
        gather = Gather(
            input="speech", 
            action="/api/v1/twilio/process_speech", 
            speechTimeout="auto",
            speechModel="phone_call",
            enhanced=True,
            language="en-US"
        )
        response.append(gather)
        return Response(content=str(response), media_type="application/xml")
        
    except Exception as e:
        logger.error(f"Error in process_speech: {e}", exc_info=True)
        response = VoiceResponse()
        response.say("I encountered an error. Please try again.", voice="Polly.Joanna", language="en-US")
        gather = Gather(
            input="speech", 
            action="/api/v1/twilio/process_speech", 
            speechTimeout="auto",
            speechModel="phone_call",
            enhanced=True,
            language="en-US"
        )
        response.append(gather)
        return Response(content=str(response), media_type="application/xml")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    settings = get_settings()
    return {
        "status": "healthy",
        "active_sessions": len(sessions),
        "gemini_configured": bool(settings.gemini_api_key)
    }