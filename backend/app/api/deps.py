from typing import Annotated, AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import security_settings
from app.db.session import AsyncSessionLocal
from app.models.user import User, Role
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

SessionDep = Annotated[AsyncSession, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]

async def get_current_user(
    session: SessionDep, token: TokenDep
) -> User:
    try:
        payload = jwt.decode(
            token, security_settings.SECRET_KEY, algorithms=[security_settings.ALGORITHM]
        )
        token_data = TokenPayload(uid=int(payload.get("sub")))
    except (JWTError, ValidationError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    user = await session.get(User, token_data.uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

def get_current_farmer(current_user: CurrentUser) -> User:
    if current_user.role != Role.FARMER:
        raise HTTPException(status_code=403, detail="Only farmers can perform this action")
    return current_user

FarmerDep = Annotated[User, Depends(get_current_farmer)]

def get_current_buyer(current_user: CurrentUser) -> User:
    if current_user.role != Role.BUYER:
        raise HTTPException(status_code=403, detail="Only buyers can perform this action")
    return current_user

BuyerDep = Annotated[User, Depends(get_current_buyer)]
