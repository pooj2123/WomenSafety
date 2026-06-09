from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

#from app.routes.navigation import router as navigation_router
from app.routes.search import router as search_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#app.include_router(
 #   navigation_router,
 #   prefix="/api/navigation"
#)

app.include_router(search_router)

@app.get("/")
def root():
    return {"message": "API running"}