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