from fastapi import APIRouter
from app.api.deps import CurrentUser, SessionDep
from app.schemas.user import User, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=User)
async def get_users_me(current_user: CurrentUser):
    return current_user

@router.put("/me", response_model=User)
async def update_user_me(user_update: UserUpdate, current_user: CurrentUser, db: SessionDep):
    if user_update.uname is not None:
        current_user.uname = user_update.uname
    if user_update.uphone is not None:
        current_user.uphone = user_update.uphone
    if user_update.ugeo is not None:
        current_user.ugeo = user_update.ugeo
    if user_update.uloc is not None:
        current_user.uloc = user_update.uloc
        
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
