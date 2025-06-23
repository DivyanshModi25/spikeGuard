import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.kafka_consumer import create_consumer
from app.utils import decode_token
from app.dev_service_fetcher import get_dev_service_ids
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

connected_clients = {}  # websocket -> dev_services
@app.get("/health")
async def health():
    return json({"health":"healthy perfectly"})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    token = websocket.query_params.get("token")
    dev = decode_token(token)
    
    if not dev:
        await websocket.close(code=1008)
        return

    dev_id = dev["dev_id"]
    dev_services = get_dev_service_ids(dev_id)

    connected_clients[websocket] = dev_services
    print(f"dev {dev_id} connected with services: {dev_services}")

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        connected_clients.pop(websocket, None)
        print("Client disconnected")

async def kafka_stream():
    consumer = create_consumer()
    for message in consumer:
        log = message.value
        service_id = log['service_id']
        for websocket, service_ids in list(connected_clients.items()):
            if service_id in service_ids:
                try:
                    await websocket.send_text(json.dumps(log))
                except Exception:
                    connected_clients.pop(websocket, None)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(kafka_stream())
