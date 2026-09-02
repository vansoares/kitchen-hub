import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import items, history, barcode, shopping_list

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KitchenHub API")

# CORS is wide open on purpose: this API is only reachable via the home LAN or
# Tailscale (never exposed to the public internet), and the frontend is served
# from multiple origins (Pi kiosk on localhost, phone over Tailscale IP/hostname).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router)
app.include_router(history.router)
app.include_router(barcode.router)
app.include_router(shopping_list.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serve the built frontend (frontend/dist) if present, so the Pi only needs to
# run this one process. In development, run the Vite dev server separately instead.
FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend", "dist",
)
if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
