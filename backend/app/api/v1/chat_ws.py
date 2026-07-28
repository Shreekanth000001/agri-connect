from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from jose import jwt, JWTError
from app.core.security import security_settings
from app.core.ws_manager import ws_manager
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.repositories.chat_repository import chat_repository
from app.schemas.chat import MessageResponse
from app.schemas.token import TokenPayload

router = APIRouter(prefix="/ws", tags=["websocket"])

async def get_current_user_ws(token: str) -> User | None:
    if not token or not token.strip():
        return None

    try:
        payload = jwt.decode(
            token.strip(),
            security_settings.SECRET_KEY,
            algorithms=[security_settings.ALGORITHM]
        )
        uid = None
        if "sub" in payload and str(payload["sub"]).isdigit():
            uid = int(payload["sub"])
        elif "uid" in payload and str(payload["uid"]).isdigit():
            uid = int(payload["uid"])
        elif "userId" in payload and str(payload["userId"]).isdigit():
            uid = int(payload["userId"])

        if uid is None:
            return None
    except JWTError:
        return None

    async with AsyncSessionLocal() as session:
        user = await session.get(User, uid)
        return user

@router.websocket("/chat/{conversation_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    token: str = Query(...)
):
    await websocket.accept()

    # 1. Authenticate user
    user = await get_current_user_ws(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Check conversation membership
    async with AsyncSessionLocal() as session:
        conversation = await chat_repository.get_conversation(session, conversation_id, user.uid)
        if not conversation:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    # 3. Connect socket into active manager
    ws_manager.add_connection(websocket, conversation_id)

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            # Heartbeat ping/pong support
            if event_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            # Incoming chat message
            if event_type == "message":
                content = data.get("content")
                if not content or not isinstance(content, str):
                    continue

                # Store message in DB
                async with AsyncSessionLocal() as session:
                    db_message = await chat_repository.create_message(
                        db=session,
                        conversation_id=conversation_id,
                        sender_id=user.uid,
                        content=content.strip()
                    )
                    message_payload = MessageResponse.model_validate(db_message).model_dump(mode="json")

                # Broadcast saved message to all participants in this conversation
                broadcast_event = {
                    "type": "new_message",
                    "data": message_payload
                }
                await ws_manager.broadcast_to_conversation(conversation_id, broadcast_event)

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, conversation_id)
    except Exception:
        ws_manager.disconnect(websocket, conversation_id)
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
