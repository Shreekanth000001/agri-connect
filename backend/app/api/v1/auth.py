from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from app.api.deps import SessionDep, CurrentUser
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, User as UserSchema

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: SessionDep):
    result = await db.execute(select(User).where(User.uemail == user_in.uemail))
    if result.scalars().first():
        raise HTTPException(status_code=409, detail="Email already registered")
    
    db_user = User(
        uname=user_in.uname,
        uemail=user_in.uemail,
        password=get_password_hash(user_in.password),
        uphone=user_in.uphone,
        ugeo=user_in.ugeo,
        uloc=user_in.uloc,
        role=user_in.role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    access_token = create_access_token(subject=db_user.uid)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserSchema.model_validate(db_user)
    }

@router.post("/login", response_model=Token)
async def login(request: Request, db: SessionDep):
    username = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username") or body.get("email")
            password = body.get("password")
        except Exception:
            pass

    if not username or not password:
        try:
            form = await request.form()
            username = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username/Email and password required")

    result = await db.execute(select(User).where(User.uemail == username))
    user = result.scalars().first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(subject=user.uid)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.uid,
        "user": UserSchema.model_validate(user)
    }

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: CurrentUser):
    return current_user
