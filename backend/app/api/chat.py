from fastapi import APIRouter
from ..schemas.all_schemas import ChatRequest, ChatMessage
from ..services.assistant_service import assistant_engine

router = APIRouter(prefix="/chat", tags=["AI Conversational Copilot"])

@router.post("", response_model=ChatMessage)
def chat_with_copilot(req: ChatRequest):
    """
    Conversational AI Travel Copilot endpoint.
    Understands natural language, executes real travel tools (locations, places, weather, flights, hotels, itineraries),
    maintains conversational session memory, and communicates multilingually.
    """
    session_id = req.session_id or "default-session"
    return assistant_engine.process_chat(
        user_message=req.message,
        session_id=session_id,
        request_context=req.context
    )
