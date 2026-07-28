import os
import bcrypt
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from pydantic_settings import BaseSettings

def _get_required_secret_key() -> str:
    key = (
        os.getenv("SECRET_KEY")
        or os.getenv("SESSION_SECRET")
        or os.getenv("AUTH_SECRET")
        or os.getenv("JWT_SECRET")
    )
    if not key or not key.strip():
        raise RuntimeError(
            "CRITICAL SECURITY FAILURE: SECRET_KEY environment variable is not configured. "
            "Application startup aborted to prevent insecure operation."
        )
    return key.strip()

class SecuritySettings(BaseSettings):
    SECRET_KEY: str = _get_required_secret_key()
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ENVIRONMENT: str = os.getenv("ENVIRONMENT") or os.getenv("APP_ENV") or "development"
    
    model_config = {"env_file": ".env", "extra": "ignore"}

security_settings = SecuritySettings()

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta | None = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=security_settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, security_settings.SECRET_KEY, algorithm=security_settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        password_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    password_bytes = (password or "").encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')
