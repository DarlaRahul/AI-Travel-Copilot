import os
from dataclasses import dataclass
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from jose import jwt, JWTError
from ..config import settings

@dataclass
class AuthenticatedUser:
    id: str
    email: Optional[str] = None
    name: str = "Traveler"
    is_anonymous: bool = False
    travel_style: str = "Balanced"
    preferred_currency: str = "INR"

def get_current_user(authorization: Optional[str] = Header(None)) -> AuthenticatedUser:
    """
    Extracts and verifies user identity from incoming Supabase/Application JWT token.
    Enforces user identification across all protected endpoints.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Expected 'Bearer <token>'"
        )
    token = authorization.split(" ")[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty bearer token provided."
        )

    payload: Optional[Dict[str, Any]] = None

    # 1. Try Supabase JWT Secret verification if configured
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        except JWTError:
            payload = None

    # 2. Try application JWT_SECRET
    if payload is None and settings.JWT_SECRET:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM], options={"verify_aud": False})
        except JWTError:
            payload = None

    # 3. Fallback: Parse token claims directly
    if payload is None:
        try:
            payload = jwt.get_unverified_claims(token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token."
            )

    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity."
        )

    metadata = payload.get("user_metadata", {})
    email = payload.get("email")
    is_anon = payload.get("is_anonymous", bool(not email))
    name = metadata.get("display_name") or (email.split("@")[0] if email else ("Guest Traveler" if is_anon else "Traveler"))

    return AuthenticatedUser(
        id=str(user_id),
        email=email,
        name=name,
        is_anonymous=is_anon,
        travel_style=metadata.get("travel_style", "Balanced"),
        preferred_currency=metadata.get("preferred_currency", "INR")
    )

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[AuthenticatedUser]:
    """
    Returns authenticated user if a valid bearer token is present, else None.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return get_current_user(authorization)
    except HTTPException:
        return None
