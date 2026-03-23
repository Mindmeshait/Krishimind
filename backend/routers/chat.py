from fastapi import APIRouter
from services.rag_service import RagService

router = APIRouter()
rag = RagService()

@router.post("/chat")
def chat(query: str):
    return {
        "query": query,
        "response": rag.ask(query)
    }