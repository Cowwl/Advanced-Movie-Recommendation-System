from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi import FastAPI
from plot_main import plot_app
from mood_main import mood_app
from fastapi.middleware.cors import CORSMiddleware

main_app = FastAPI()
# Allow CORS for all origins
main_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@main_app.get("/")
def read_root():
    return {"message": "This is the main app."}

# Mount the plot and mood apps as sub-applications
main_app.mount("/plot", app=plot_app)
main_app.mount("/mood", app=mood_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(main_app, host="0.0.0.0", port=8000)
