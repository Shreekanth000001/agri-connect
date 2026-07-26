from fastapi import APIRouter
from app.api.deps import SessionDep
from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageCreate

router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("", status_code=201)
async def submit_contact(msg_in: ContactMessageCreate, db: SessionDep):
    db_msg = ContactMessage(
        name=msg_in.name,
        email=msg_in.email,
        message=msg_in.message
    )
    db.add(db_msg)
    await db.commit()
    await db.refresh(db_msg)
    return {"msgId": db_msg.msgId, "message": "Message received"}
