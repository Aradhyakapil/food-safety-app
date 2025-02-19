from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from supabase import create_client, Client
import logging
from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = "https://fpeivhlljqryxemvdmvm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWl2aGxsanFyeXhlbXZkbXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODMwMjg5MiwiZXhwIjoyMDUzODc4ODkyfQ.c5MNo3xhtA-hEzJa02nW23c6-opzVZZRcN7fKCRtIM8"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI Router
router = APIRouter()

# User models
class UserSignup(BaseModel):
    name: str
    phone_number: str
    user_type: str  # "consumer" or "business_owner"

class UserLogin(BaseModel):
    phone_number: str

class VerifyOTP(BaseModel):
    phone_number: str
    otp: str

class User(BaseModel):
    id: str
    name: str
    phone_number: str
    user_type: str

class BusinessSignup(BaseModel):
    business_name: str
    phone_number: str
    license_number: str
    otp: str

# ------------------- SIGN UP (Phone Number Only) -------------------
@router.post("/signup")
async def create_user(user: UserSignup) -> Dict:
    """Creates a user with phone number authentication (OTP sent)."""
    try:
        logger.info(f"Signing up user with phone: {user.phone_number}")

        response = supabase.auth.sign_up({
            "phone": user.phone_number,
            "options": {
                "data": {
                    "name": user.name,
                    "user_type": user.user_type
                }
            }
        })

        if response:
            logger.info(f"OTP sent to {user.phone_number} for verification.")
            return {"success": True, "message": "OTP sent to phone for verification."}
        else:
            raise HTTPException(status_code=400, detail="User registration failed")

    except Exception as e:
        logger.error(f"Error signing up user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ------------------- LOGIN (Phone Number Only) -------------------
@router.post("/login")
async def login_user(user: UserLogin) -> Dict:
    """Sends an OTP to the user's phone for login."""
    try:
        logger.info(f"Sending OTP for login: {user.phone_number}")

        response = supabase.auth.sign_in_with_otp({"phone": user.phone_number})

        if response:
            logger.info(f"OTP sent to {user.phone_number} for login.")
            return {"success": True, "message": "OTP sent to phone for login."}
        else:
            raise HTTPException(status_code=401, detail="Failed to send OTP")

    except Exception as e:
        logger.error(f"Error logging in user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ------------------- VERIFY OTP -------------------
@router.post("/verify-otp")
async def verify_otp(data: VerifyOTP) -> Dict:
    """Verifies the OTP and completes login."""
    try:
        logger.info(f"Verifying OTP for: {data.phone_number}")

        response = supabase.auth.verify_otp({
            "phone": data.phone_number,
            "token": data.otp,
            "type": "sms"  # OTP verification type
        })

        if response.user:
            return {
                "success": True,
                "user": {
                    "id": response.user.id,
                    "phone_number": response.user.phone
                },
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid OTP")

    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ------------------- GET CURRENT USER -------------------
@router.get("/me")
async def get_current_user(token: str) -> User:
    """Retrieves the authenticated user using the access token."""
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_info = user.user

        return User(
            id=user_info.id,
            name=user_info.user_metadata.get("name", "User"),
            phone_number=user_info.phone,
            user_type=user_info.user_metadata.get("user_type", "consumer")
        )

    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

# ------------------- SEND OTP TO BUSINESS -------------------
@router.post("/business/send-otp")
async def send_business_otp(user: UserLogin) -> Dict:
    """Sends an OTP to the business phone number."""
    try:
        logger.info(f"Sending OTP for business: {user.phone_number}")

        response = supabase.auth.sign_in_with_otp({
            "phone": user.phone_number
        })

        if response:
            logger.info(f"OTP sent to {user.phone_number} for business verification.")
            return {"success": True, "message": "OTP sent to phone for verification."}
        else:
            raise HTTPException(status_code=401, detail="Failed to send OTP")

    except Exception as e:
        logger.error(f"Error sending business OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ------------------- REGISTER BUSINESS -------------------
@router.post("/business/register")
async def register_business(business: BusinessSignup) -> Dict:
    try:
        # Your existing registration logic
        return {"success": True, "message": "Business registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
