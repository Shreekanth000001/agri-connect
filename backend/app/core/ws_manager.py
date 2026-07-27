from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps conversation_id to a list of active WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    def add_connection(self, websocket: WebSocket, conversation_id: int):
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        if websocket not in self.active_connections[conversation_id]:
            self.active_connections[conversation_id].append(websocket)

    async def connect(self, websocket: WebSocket, conversation_id: int):
        try:
            await websocket.accept()
        except Exception:
            pass
        self.add_connection(websocket, conversation_id)

    def disconnect(self, websocket: WebSocket, conversation_id: int):
        if conversation_id in self.active_connections:
            if websocket in self.active_connections[conversation_id]:
                self.active_connections[conversation_id].remove(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def broadcast_to_conversation(self, conversation_id: int, message: dict):
        if conversation_id in self.active_connections:
            # Send to all connected sockets in this conversation
            disconnected_sockets = []
            for connection in self.active_connections[conversation_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected_sockets.append(connection)

            # Cleanup broken sockets
            for socket in disconnected_sockets:
                self.disconnect(socket, conversation_id)

ws_manager = ConnectionManager()
