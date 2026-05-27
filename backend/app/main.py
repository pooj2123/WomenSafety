from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.navigation import router as navigation_router

app = FastAPI()

# ✅ ADD THIS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Women Safety Routing API Running"}

app.include_router(navigation_router)

import requests

@app.get("/search")
def search_location(q: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": q,
        "format": "json"
    }

    headers = {
        "User-Agent": "women-safety-app"
    }

    res = requests.get(url, params=params, headers=headers)
    data = res.json()

    if not data:
        return None

    return {
        "lat": float(data[0]["lat"]),
        "lon": float(data[0]["lon"])
    }