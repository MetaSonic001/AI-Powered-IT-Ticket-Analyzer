"""
Model Service for managing different AI/ML models
Supports Ollama, Hugging Face, Groq, Gemini with fallbacks
"""

import aiohttp
from typing import Dict, List, Any, Union
import numpy as np

# ML Libraries
try:
    from transformers import (
        AutoTokenizer, AutoModel, AutoModelForSequenceClassification,
        pipeline, TextClassificationPipeline
    )
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

# API Clients
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

from core.config import Settings
from utils.logger import setup_logger

logger = setup_logger(__name__)

class ModelService:
    """Unified model service supporting multiple providers"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.models = {}
        self.embedders = {}
        self.classifiers = {}
        self.clients = {}
        self.initialized = False
        
    async def initialize(self):
        """Initialize all available models"""
        try:
            logger.info("🤖 Initializing Model Service...")
            
            # Initialize providers based on enabled flags
            await self._init_external_apis()
            await self._init_ollama()
            await self._init_huggingface()
            
            # Load default models
            await self._load_default_models()
            
            self.initialized = True
            logger.info("✅ Model Service initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Model Service initialization failed: {str(e)}")
            raise
    
    async def _init_ollama(self):
        """Initialize Ollama client if enabled"""
        if not self.settings.use_ollama:
            logger.info("⏭️  Ollama disabled in configuration")
            return
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.settings.ollama_host}/api/tags") as response:
                    if response.status == 200:
                        models = await response.json()
                        available_models = [m['name'] for m in models.get('models', [])]
                        
                        self.clients['ollama'] = {
                            'host': self.settings.ollama_host,
                            'available_models': available_models
                        }
                        
                        logger.info(f"✅ Ollama connected: {len(available_models)} models available")
                    else:
                        logger.warning("❌ Ollama not available")
                        
        except Exception as e:
            logger.warning(f"Ollama initialization failed: {str(e)}")
    
    async def _init_huggingface(self):
        """Initialize Hugging Face models if enabled"""
        if not self.settings.use_huggingface:
            logger.info("⏭️  HuggingFace disabled in configuration")
            return
            
        if not TRANSFORMERS_AVAILABLE:
            logger.warning("⚠️  HuggingFace transformers not available (library not installed)")
            return
            
        try:
            # Initialize embedding model
            if SENTENCE_TRANSFORMERS_AVAILABLE:
                embedding_model = self.settings.hf_models['embedding']
                self.embedders['huggingface'] = SentenceTransformer(embedding_model)
                logger.info(f"✅ HuggingFace embedder loaded: {embedding_model}")
            
            # Initialize classification pipeline
            classification_model = self.settings.hf_models['classification']
            if torch.cuda.is_available():
                device = 0
                logger.info("🚀 Using CUDA for HuggingFace models")
            else:
                device = -1
                logger.info("💻 Using CPU for HuggingFace models")
            
            self.classifiers['huggingface'] = pipeline(
                "text-classification",
                model=classification_model,
                device=device,
                return_all_scores=True
            )
            
            self.clients['huggingface'] = {
                'token': self.settings.hf_token,
                'models': self.settings.hf_models
            }
            
            logger.info("✅ HuggingFace models initialized")
            
        except Exception as e:
            logger.error(f"HuggingFace initialization failed: {str(e)}")
    
    async def _init_external_apis(self):
        """Initialize external API clients based on enabled flags"""
        
        # Groq
        if self.settings.use_groq and self.settings.groq_api_key and GROQ_AVAILABLE:
            try:
                self.clients['groq'] = Groq(api_key=self.settings.groq_api_key)
                logger.info("✅ Groq client initialized")
            except Exception as e:
                logger.warning(f"Groq initialization failed: {str(e)}")
        elif self.settings.use_groq and not self.settings.groq_api_key:
            logger.warning("⚠️  Groq enabled but no API key provided")
        elif not self.settings.use_groq:
            logger.info("⏭️  Groq disabled in configuration")
        
        # Gemini
        if self.settings.use_gemini and self.settings.gemini_api_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=self.settings.gemini_api_key)
                self.clients['gemini'] = genai.GenerativeModel(self.settings.gemini_model)
                logger.info("✅ Gemini client initialized")
            except Exception as e:
                logger.warning(f"Gemini initialization failed: {str(e)}")
        elif self.settings.use_gemini and not self.settings.gemini_api_key:
            logger.warning("⚠️  Gemini enabled but no API key provided")
        elif not self.settings.use_gemini:
            logger.info("⏭️  Gemini disabled in configuration")

    # -------- Prompt/token optimization helpers --------
    def _truncate(self, text: str, max_chars: int) -> str:
        if len(text) <= max_chars:
            return text
        head = text[: max_chars // 2]
        tail = text[-(max_chars // 2) :]
        return head + "\n...\n" + tail

    def _condense_text_for_llm(self, text: str, max_chars: int = 2000) -> str:
        """Condense text for external LLMs to reduce token usage without losing key context."""
        # Simple heuristics: collapse whitespace and keep head+tail sections
        compact = " ".join(text.split())
        # Prefer to keep within ~max_chars characters
        compact = self._truncate(compact, max_chars)
        return compact
    
    async def _load_default_models(self):
        """Load default models for immediate use"""
        # This would load any cached or pre-downloaded models
        pass
    
    async def generate_embeddings(self, texts: Union[str, List[str]]) -> np.ndarray:
        """Generate embeddings using the best available model"""
        
        if isinstance(texts, str):
            texts = [texts]
        
        # Prefer external/HF over Ollama when available
        
        # Try HuggingFace
        if 'huggingface' in self.embedders:
            try:
                embedder = self.embedders['huggingface']
                embeddings = embedder.encode(texts, convert_to_numpy=True)
                return embeddings
            except Exception as e:
                logger.warning(f"HuggingFace embedding failed: {str(e)}")

        # Try Ollama
        if 'ollama' in self.clients:
            try:
                return await self._generate_ollama_embeddings(texts)
            except Exception as e:
                logger.warning(f"Ollama embedding failed: {str(e)}")
        
        # Fallback to simple word embeddings
        logger.warning("Using fallback embedding method")
        return self._fallback_embeddings(texts)
    
    async def _generate_ollama_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings using Ollama"""
        embeddings = []
        
        async with aiohttp.ClientSession() as session:
            for text in texts:
                payload = {
                    "model": self.settings.ollama_models['embedding'],
                    "prompt": text
                }
                
                async with session.post(
                    f"{self.settings.ollama_host}/api/embeddings",
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        embeddings.append(result['embedding'])
                    else:
                        raise Exception(f"Ollama API error: {response.status}")
        
        return np.array(embeddings)
    
    def _fallback_embeddings(self, texts: List[str]) -> np.ndarray:
        """Simple fallback embedding using basic text features"""
        embeddings = []
        
        for text in texts:
            # Simple features: length, word count, character frequencies
            features = [
                len(text),
                len(text.split()),
                text.count(' '),
                text.count('.'),
                text.count('!'),
                text.count('?'),
                sum(1 for c in text if c.isupper()),
                sum(1 for c in text if c.islower()),
                sum(1 for c in text if c.isdigit())
            ]
            
            # Normalize to fixed dimension (384 to match sentence-transformers)
            while len(features) < 384:
                features.extend(features[:min(384-len(features), len(features))])
            
            embeddings.append(features[:384])
        
        return np.array(embeddings, dtype=np.float32)
    
    async def classify_text(self, text: str, categories: List[str], prompt: str = None, few_shot: list = None) -> Dict[str, Any]:
        """Classify text into given categories, with optional prompt and few-shot"""
        if 'groq' in self.clients:
            try:
                return await self._classify_groq(text, categories, prompt, few_shot)
            except Exception as e:
                logger.warning(f"Groq classification failed: {str(e)}")
        if 'gemini' in self.clients:
            try:
                return await self._classify_gemini(text, categories, prompt, few_shot)
            except Exception as e:
                logger.warning(f"Gemini classification failed: {str(e)}")
        if 'ollama' in self.clients:
            try:
                return await self._classify_ollama(text, categories, prompt, few_shot)
            except Exception as e:
                logger.warning(f"Ollama classification failed: {str(e)}")
        if 'huggingface' in self.classifiers:
            try:
                return await self._classify_huggingface(text, categories, prompt, few_shot)
            except Exception as e:
                logger.warning(f"HuggingFace classification failed: {str(e)}")
        return self._fallback_classification(text, categories)
    
    async def _classify_ollama(self, text: str, categories: List[str], prompt: str = None, few_shot: list = None) -> Dict[str, Any]:
        """Classify using Ollama"""
        
        if prompt:
            ollama_prompt = prompt
        else:
            ollama_prompt = f"""
            Classify the following IT support ticket into one of these categories:
            Categories: {', '.join(categories)}
            
            Ticket: {text}
            
            Respond with only the category name that best matches this ticket.
            """
        
        async with aiohttp.ClientSession() as session:
            payload = {
                "model": self.settings.ollama_models['llm'],
                "prompt": ollama_prompt,
                "stream": False
            }
            
            async with session.post(
                f"{self.settings.ollama_host}/api/generate",
                json=payload
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    predicted_category = result['response'].strip()
                    
                    # Find best matching category
                    for category in categories:
                        if category.lower() in predicted_category.lower():
                            return {
                                "category": category,
                                "confidence": 0.8,
                                "reasoning": f"Ollama classification: {predicted_category} (matched {category})"
                            }
                    
                    # Default to first category if no match
                    return {
                        "category": categories[0] if categories else "General Support",
                        "confidence": 0.5,
                        "reasoning": f"Ollama fallback: {predicted_category}"
                    }
                else:
                    raise Exception(f"Ollama API error: {response.status}")
    
    async def _classify_groq(self, text: str, categories: List[str], prompt: str = None, few_shot: list = None) -> Dict[str, Any]:
        """Classify using Groq"""
        
        client = self.clients['groq']
        
        condensed = self._condense_text_for_llm(text, max_chars=1800)
        if prompt:
            groq_prompt = prompt
        else:
            groq_prompt = f"""
            Classify this IT support ticket into one of these categories:
            Categories: {', '.join(categories)}
            
            Ticket: {condensed}
            
            Return only the most appropriate category name.
            """
        
        try:
            response = client.chat.completions.create(
                model=self.settings.groq_model,
                messages=[{"role": "user", "content": groq_prompt}],
                max_tokens=48,
                temperature=0.1
            )
            
            predicted_category = response.choices[0].message.content.strip()
            
            # Find best matching category
            for category in categories:
                if category.lower() in predicted_category.lower():
                    return {
                        "category": category,
                        "confidence": 0.9,
                        "reasoning": f"Groq classification: {predicted_category} (matched {category})"
                    }
            
            return {
                "category": categories[0] if categories else "General Support",
                "confidence": 0.6,
                "reasoning": f"Groq fallback: {predicted_category}"
            }
            
        except Exception as e:
            raise Exception(f"Groq classification error: {str(e)}")
    
    async def _classify_gemini(self, text: str, categories: List[str], prompt: str = None, few_shot: list = None) -> Dict[str, Any]:
        """Classify using Gemini"""
        
        model = self.clients['gemini']
        
        condensed = self._condense_text_for_llm(text, max_chars=1800)
        if prompt:
            gemini_prompt = prompt
        else:
            gemini_prompt = f"""
            Classify this IT support ticket into one of these categories:
            Categories: {', '.join(categories)}
            
            Ticket: {condensed}
            
            Return only the most appropriate category name.
            """
        
        try:
            response = model.generate_content(gemini_prompt)
            predicted_category = response.text.strip()
            
            # Find best matching category
            for category in categories:
                if category.lower() in predicted_category.lower():
                    return {
                        "category": category,
                        "confidence": 0.9,
                        "reasoning": f"Gemini classification: {predicted_category} (matched {category})"
                    }
            
            return {
                "category": categories[0] if categories else "General Support",
                "confidence": 0.6,
                "reasoning": f"Gemini fallback: {predicted_category}"
            }
            
        except Exception as e:
            raise Exception(f"Gemini classification error: {str(e)}")
    
    async def _classify_huggingface(self, text: str, categories: List[str], prompt: str = None, few_shot: list = None) -> Dict[str, Any]:
        """Classify using HuggingFace pipeline"""
        classifier = self.classifiers['huggingface']
        # Since most HF classification models are trained on specific datasets,
        # we'll use a keyword-based approach combined with the model's output
        results = classifier(text)
        # Simple keyword matching for IT categories
        text_lower = text.lower()
        category_keywords = {
            "Network Issues": ["network", "internet", "wifi", "connection", "ip", "dns"],
            "Software Problems": ["software", "application", "app", "program", "install"],
            "Hardware Failures": ["hardware", "computer", "laptop", "monitor", "keyboard"],
            "Email Issues": ["email", "outlook", "mail", "smtp", "inbox"],
            "Printer Problems": ["printer", "print", "paper", "toner", "scan"],
            "Security Incidents": ["security", "virus", "malware", "password", "hack"],
            "System Performance": ["slow", "performance", "memory", "cpu", "disk"]
        }
        best_category = "General Support"
        best_score = 0.0
        for category, keywords in category_keywords.items():
            if category in categories:
                score = sum(1 for keyword in keywords if keyword in text_lower)
                if score > best_score:
                    best_score = score
                    best_category = category
        confidence = min(0.9, 0.5 + (best_score * 0.1))
        return {
            "category": best_category,
            "confidence": confidence,
            "reasoning": f"Keyword-based classification with HF model support: matched {best_category} with {best_score} keywords"
        }
    
    def _fallback_classification(self, text: str, categories: List[str]) -> Dict[str, Any]:
        """Simple keyword-based classification fallback"""
        
        text_lower = text.lower()
        
        # Keyword mapping for IT categories
        category_keywords = {
            "Network Issues": ["network", "internet", "wifi", "connection", "router", "switch", "ip", "dns", "vpn"],
            "Software Problems": ["software", "application", "app", "program", "install", "update", "bug", "crash"],
            "Hardware Failures": ["hardware", "computer", "laptop", "desktop", "monitor", "keyboard", "mouse", "hard drive"],
            "Security Incidents": ["security", "virus", "malware", "password", "hack", "breach", "suspicious"],
            "Account Access": ["account", "login", "password", "access", "locked", "username", "authentication"],
            "Email Issues": ["email", "outlook", "mail", "smtp", "inbox", "attachment", "send", "receive"],
            "Printer Problems": ["printer", "print", "paper", "toner", "scan", "fax", "queue"],
            "Application Errors": ["error", "exception", "crash", "freeze", "hang", "not responding"],
            "System Performance": ["slow", "performance", "memory", "cpu", "disk", "space", "lag"],
            "Mobile Device Support": ["mobile", "phone", "tablet", "ios", "android", "sync"],
            "Database Issues": ["database", "sql", "query", "data", "backup", "restore"],
            "General Support": ["help", "question", "how to", "support", "assistance"]
        }
        
        # Score each category
        category_scores = {}
        for category in categories:
            if category in category_keywords:
                keywords = category_keywords[category]
                score = sum(1 for keyword in keywords if keyword in text_lower)
                category_scores[category] = score
        # Find best category
        if category_scores:
            best_category = max(category_scores.items(), key=lambda x: x[1])
            if best_category[1] > 0:
                confidence = min(0.8, 0.4 + (best_category[1] * 0.1))
                return {
                    "category": best_category[0],
                    "confidence": confidence,
                    "reasoning": f"Keyword-based fallback classification: matched {best_category[0]} with {best_category[1]} keywords"
                }
        # Default to first category
        return {
            "category": categories[0] if categories else "General Support",
            "confidence": 0.3,
            "reasoning": "Default fallback classification"
        }
    
    async def generate_text(self, prompt: str, max_tokens: int = 150) -> str:
        """Generate text using the best available LLM"""
        condensed_prompt = self._condense_text_for_llm(prompt, max_chars=3000)

        # Prefer external APIs first
        if 'groq' in self.clients:
            try:
                return await self._generate_groq_text(condensed_prompt, min(max_tokens, 256))
            except Exception as e:
                logger.warning(f"Groq text generation failed: {str(e)}")
        
        if 'gemini' in self.clients:
            try:
                return await self._generate_gemini_text(condensed_prompt, min(max_tokens, 256))
            except Exception as e:
                logger.warning(f"Gemini text generation failed: {str(e)}")
        
        # Try Ollama next
        if 'ollama' in self.clients:
            try:
                return await self._generate_ollama_text(condensed_prompt, max_tokens)
            except Exception as e:
                logger.warning(f"Ollama text generation failed: {str(e)}")

        # Fallback
        return "Unable to generate response with available models."
    
    async def _generate_ollama_text(self, prompt: str, max_tokens: int) -> str:
        """Generate text using Ollama"""
        
        async with aiohttp.ClientSession() as session:
            payload = {
                "model": self.settings.ollama_models['llm'],
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,
                    "temperature": 0.7
                }
            }
            
            async with session.post(
                f"{self.settings.ollama_host}/api/generate",
                json=payload
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return result['response']
                else:
                    raise Exception(f"Ollama API error: {response.status}")
    
    async def _generate_groq_text(self, prompt: str, max_tokens: int) -> str:
        """Generate text using Groq"""
        
        client = self.clients['groq']
        
        try:
            response = client.chat.completions.create(
                model=self.settings.groq_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Groq text generation error: {str(e)}")
    
    async def _generate_gemini_text(self, prompt: str, max_tokens: int) -> str:
        """Generate text using Gemini"""
        
        model = self.clients['gemini']
        
        try:
            response = model.generate_content(
                prompt,
                generation_config={
                    'max_output_tokens': max_tokens,
                    'temperature': 0.7
                }
            )
            
            return response.text
            
        except Exception as e:
            raise Exception(f"Gemini text generation error: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check if model service is healthy"""
        try:
            # Test basic functionality
            test_text = "Test connection issue with network"
            categories = ["Network Issues", "General Support"]
            
            result = await self.classify_text(test_text, categories)
            return result is not None and 'category' in result
            
        except Exception as e:
            logger.error(f"Model service health check failed: {str(e)}")
            return False
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        status = {
            "initialized": self.initialized,
            "providers": {}
        }
        
        # Check each provider
        for provider in ['ollama', 'huggingface', 'groq', 'gemini']:
            if provider in self.clients:
                status["providers"][provider] = {
                    "available": True,
                    "models": self.clients[provider].get('available_models', [])
                }
            else:
                status["providers"][provider] = {"available": False}
        
        return status
    
    async def reload_models(self):
        """Reload all models"""
        logger.info("Reloading models...")
        self.models.clear()
        self.embedders.clear()
        self.classifiers.clear()
        await self.initialize()
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up model service...")
        
        # Clear models from memory
        self.models.clear()
        self.embedders.clear()
        self.classifiers.clear()
        self.clients.clear()
        
        # Clear CUDA cache if available
        try:
            if TRANSFORMERS_AVAILABLE and torch.cuda.is_available():
                torch.cuda.empty_cache()
        except:
            pass
