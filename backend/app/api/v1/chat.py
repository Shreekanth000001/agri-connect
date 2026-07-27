from fastapi import APIRouter, Query, status
from app.api.deps import SessionDep, CurrentUser
from app.schemas.chat import ConversationCreate, ConversationResponse, MessageCreate, MessageResponse
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations(
    db: SessionDep,
    current_user: CurrentUser
):
    return await chat_service.get_user_conversations(db, current_user.uid)

@router.get("/conversations/{id}", response_model=ConversationResponse)
async def get_conversation(
    id: int,
    db: SessionDep,
    current_user: CurrentUser
):
    return await chat_service.get_conversation_by_id(db, id, current_user.uid)

@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conv_in: ConversationCreate,
    db: SessionDep,
    current_user: CurrentUser
):
    return await chat_service.create_or_get_conversation(db, current_user, conv_in)

@router.get("/messages/{conversation_id}", response_model=list[MessageResponse])
@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: int,
    db: SessionDep,
    current_user: CurrentUser,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    return await chat_service.get_messages(db, conversation_id, current_user.uid, limit=limit, offset=offset)

@router.post("/messages/{conversation_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    conversation_id: int,
    msg_in: MessageCreate,
    db: SessionDep,
    current_user: CurrentUser
):
    return await chat_service.send_message(db, conversation_id, current_user.uid, msg_in)
