"""
KrishiMind Backend — main.py
Run with: uvicorn main:app --reload --port 8000
Must be run from inside the /backend folder
"""

import sys
import os

# ── Ensure ROOT is in path ────────────────────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))   # .../krishimind/backend
ROOT_DIR    = os.path.dirname(BACKEND_DIR)                  # .../krishimind

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

print(f"✅ main.py ROOT_DIR = {ROOT_DIR}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import predict, weather, news
from dotenv import load_dotenv

load_dotenv()

# ─── App Init ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="🌾 KrishiMind API",
    description="""
## KrishiMind — AI Mandi Price Prediction

- POST /predict         — Main price prediction (LSTM + Weather + Sentiment)
- GET  /weather/{state} — Weather for a state
- GET  /news/{crop}     — News sentiment for a crop
- POST /chat            — AI Chatbot (Groq RAG)
    """,
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://your-frontend.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(predict.router, tags=["Prediction"])
app.include_router(weather.router, tags=["Weather"])
app.include_router(news.router,    tags=["News & Sentiment"])

# ─── Root ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "app":     "KrishiMind API",
        "version": "1.0.0",
        "docs":    "/docs",
        "endpoints": {
            "predict": "POST /predict",
            "weather": "GET  /weather/{state}",
            "news":    "GET  /news/{crop}",
            "chat":    "POST /chat",
            "health":  "GET  /health",
        }
    }

@app.get("/health", tags=["Root"])
def health():
    from ml.predict_prices import MODELS
    return {
        "status":        "healthy",
        "models_loaded": list(MODELS.keys()),
        "total_models":  len(MODELS),
    }