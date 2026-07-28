import os
from typing import Annotated, AsyncGenerator
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import security_settings
from app.db.session import AsyncSessionLocal
from app.models.user import User, Role

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

SessionDep = Annotated[AsyncSession, Depends(get_db)]

async def get_current_user(
    request: Request,
    session: SessionDep,
    header_token: str | None = Depends(reusable_oauth2)
) -> User:
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    token = header_token
    if not token and auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1].strip()

    if not token:
        token = request.cookies.get("session") or request.cookies.get("token") or request.query_params.get("token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token,
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
        elif "userDetails" in payload and isinstance(payload["userDetails"], dict):
            uid = payload["userDetails"].get("uid")

        if uid is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    user = await session.get(User, uid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

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
