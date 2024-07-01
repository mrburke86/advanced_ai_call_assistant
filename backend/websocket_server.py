# backend/websocket_server.py
import asyncio
import websockets
import json
import signal
import logging
from utils.logger_config import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

clients = set()

async def handler(websocket, path):
    clients.add(websocket)
    logger.debug(f"New client connected: {websocket.remote_address}")
    try:
        async for message in websocket:
            data = json.loads(message)
            logger.debug(f"Received message: {data}")
            await broadcast(data)
    except websockets.exceptions.ConnectionClosed as e:
        logger.debug(f"Client disconnected: {websocket.remote_address} - {e}")
    finally:
        clients.remove(websocket)

async def broadcast(message):
    logger.debug(f"Broadcasting message: {message}")
    for client in clients:
        try:
            await client.send(json.dumps(message))
        except Exception as e:
            logger.error(f"Error broadcasting message to client: {e}")


async def main():
    stop = asyncio.Future()

    def on_shutdown():
        if not stop.done():
            stop.set_result(None)

    signal.signal(signal.SIGTERM, lambda *_: on_shutdown())
    signal.signal(signal.SIGINT, lambda *_: on_shutdown())

    async with websockets.serve(handler, "localhost", 8765, ping_interval=30):
        await stop

if __name__ == "__main__":
    asyncio.run(main())

# import asyncio
# import websockets
# import json
# import logging
# from utils.logger_config import setup_logging

# setup_logging()
# logger = logging.getLogger(__name__)

# clients = set()

# async def handler(websocket, path):
#     clients.add(websocket)
#     logger.debug(f"New client connected: {websocket.remote_address}")
#     try:
#         async for message in websocket:
#             data = json.loads(message)
#             logger.debug(f"Received message: {data}")
#             await broadcast(data)
#     except websockets.exceptions.ConnectionClosed as e:
#         logger.debug(f"Client disconnected: {websocket.remote_address} - {e}")
#     finally:
#         clients.remove(websocket)

# async def broadcast(message):
#     logger.debug(f"Broadcasting message: {message}")
#     for client in clients:
#         try:
#             await client.send(json.dumps(message))
#         except Exception as e:
#             logger.error(f"Error broadcasting message to client: {e}")

# async def main():
#     server = await websockets.serve(
#         handler,
#         "localhost",
#         8765,
#         extra_headers=[
#             ("Access-Control-Allow-Origin", "http://localhost:3000"),
#             ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
#             ("Access-Control-Allow-Headers", "Content-Type"),
#         ]
#     )
#     logger.info("WebSocket server started on ws://localhost:8765")
#     await server.wait_closed()

# if __name__ == "__main__":
#     asyncio.run(main())
