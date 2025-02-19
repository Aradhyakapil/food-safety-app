import logging
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import os
from supabase import create_client, Client
import shutil
import aiofiles
from fastapi.security import OAuth2PasswordBearer

# Import your models (ensure these are defined in your project)
from app.backend.models import (
    User, Business, Inspection, HygieneRating, LabReport, Certification, 
    TeamMember, FacilityPhoto, Review, ManufacturingDetails, BatchProductionDetails, 
    RawMaterialSupplier, PackagingCompliance
)

# Import the auth router from your auth module
from app.backend import auth
from app.backend.auth import (
    create_user, login_user, get_current_user, verify_otp
)
# Create the FastAPI app
app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# (Optional) Create a Supabase client if needed for business routes.
supabase: Client = create_client(
    "https://fpeivhlljqryxemvdmvm.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWl2aGxsanFyeXhlbXZkbXZtIiwicm9sZSIsImlhdCI6MTczODMwMjg5MiwiZXhwIjoyMDUzODc4ODkyfQ.c5MNo3xhtA-hEzJa02nW23c6-opzVZZRcN7fKCRtIM8"
)

# Helper function to upload a file to Supabase storage and get its URL
async def upload_file(file: UploadFile, file_name: str) -> str:
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Upload file to Supabase storage
        with open(file_path, "rb") as f:
            supabase.storage.from_("food-safety-files").upload(f"uploads/{file_name}", f)

        # Get public URL
        file_url = supabase.storage.from_("food-safety-files").get_public_url(file_name)
        
        # Remove local file
        os.remove(file_path)
        
        return file_url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------- Include Auth Router -------------------
# This will mount your auth endpoints at /auth (e.g. /auth/signup, /auth/login, etc.)
app.include_router(auth.router, prefix="/auth")

# ------------------- Business and Other Routes -------------------
@app.post("/business/onboard")
async def onboard_business(
    business_name: str = Form(...),
    address: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    license_number: str = Form(...),
    business_type: str = Form(...),
    owner_name: str = Form(...),
    trade_license: str = Form(...),
    gst_number: str = Form(...),
    fire_safety_cert: str = Form(...),
    liquor_license: Optional[str] = Form(None),
    music_license: Optional[str] = Form(None),
    business_logo: UploadFile = File(...),
    owner_photo: UploadFile = File(...),
    team_member_names: str = Form(""),
    team_member_roles: str = Form(""),
    team_member_photos: List[UploadFile] = File([]),
    facility_photo_area_names: str = Form(""),
    facility_photos: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user)
):
    try:
        logger.info(f"Received onboarding request for business: {business_name}")
        logger.info(f"Current user: {current_user}")

        # Validate input data
        if not business_name or not address or not phone or not email or not license_number:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # 1. Upload Business Logo and Owner Photo
        logo_name = f"business_{license_number}_logo.{business_logo.filename.split('.')[-1]}"
        owner_photo_name = f"business_{license_number}_owner.{owner_photo.filename.split('.')[-1]}"
        logo_url = await upload_file(business_logo, logo_name)
        owner_photo_url = await upload_file(owner_photo, owner_photo_name)

        # 2. Create business entry
        business_data = {
            "name": business_name,
            "address": address,
            "phone": phone,
            "email": email,
            "license_number": license_number,
            "business_type": business_type,
            "owner_id": current_user.id,
            "owner_name": owner_name,
            "owner_photo_url": owner_photo_url,
            "logo_url": logo_url,
            "trade_license": trade_license,
            "gst_number": gst_number,
            "fire_safety_cert": fire_safety_cert,
            "liquor_license": liquor_license,
            "music_license": music_license,
        }
        new_business = await supabase.table("businesses").insert(business_data).execute()
        if not new_business.data:
            raise HTTPException(status_code=500, detail="Failed to create business")
        business_id = new_business.data[0]['id']

        # 3. Handle team members
        team_names = team_member_names.split(",")
        team_roles = team_member_roles.split(",")

        if len(team_names) != len(team_roles) or len(team_names) != len(team_member_photos):
            raise HTTPException(status_code=400, detail="Mismatched team member data.")

        for i in range(len(team_names)):
            photo_name = f"business_{business_id}_team_{i}.{team_member_photos[i].filename.split('.')[-1]}"
            photo_url = await upload_file(team_member_photos[i], photo_name)
            team_member_data = {
                "business_id": business_id,
                "name": team_names[i].strip(),
                "role": team_roles[i].strip(),
                "photo_url": photo_url,
            }
            team_member_insert = await supabase.table("team_members").insert(team_member_data).execute()
            if not team_member_insert.data:
                raise HTTPException(status_code=500, detail=f"Failed to insert team member {i}")

        # 4. Handle facility photos
        facility_photo_area_names_list = facility_photo_area_names.split(",")
        if len(facility_photos) != len(facility_photo_area_names_list):
            raise HTTPException(status_code=400, detail="Mismatched number of facility photos and area names.")

        for i, facility_photo in enumerate(facility_photos):
            photo_name = f"business_{business_id}_facility_{i}.{facility_photo.filename.split('.')[-1]}"
            photo_url = await upload_file(facility_photo, photo_name)
            facility_photo_data = {
                "business_id": business_id,
                "area_name": facility_photo_area_names_list[i].strip(),
                "photo_url": photo_url,
            }
            facility_photo_insert = await supabase.table("facility_photos").insert(facility_photo_data).execute()
            if not facility_photo_insert.data:
                raise HTTPException(status_code=500, detail=f"Failed to insert facility photo {i}")

        logger.info(f"Business onboarding successful for: {business_name}")
        return {
            "success": True,
            "message": "Business onboarded successfully",
            "businessId": business_id
        }

    except HTTPException as http_ex:
        logger.error(f"HTTP Exception during onboarding: {http_ex.detail}")
        raise http_ex
    except Exception as e:
        logger.error(f"Unexpected error during onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ... [Keep the rest of your business, inspection, lab report, certification, etc. routes unchanged] ...
# User routes
@app.post("/register")
async def register_user(user: User):
    return await create_user(user.name, user.email, user.password, user.user_type)

@app.post("/login")
async def login(user: User):
    return await login_user(user.email, user.password)

@app.post("/refresh-token")
async def refresh(refresh_token: str = Header(...)):
    return await refresh_token(refresh_token)

@app.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Business routes
@app.post("/business")
async def create_business(business: Business, current_user: User = Depends(get_current_user)):
    try:
        new_business = supabase.table("businesses").insert(business.dict()).execute()
        return {"message": "Business created successfully", "business": new_business.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/business/{business_id}")
async def get_business(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        business = supabase.table("businesses").select("*").eq("id", business_id).execute()
        if not business.data:
            raise HTTPException(status_code=404, detail="Business not found")
        return business.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/business/license/{license_number}")
async def get_business_by_license(license_number: str, current_user: User = Depends(get_current_user)):
    try:
        business = supabase.table("businesses").select("*").eq("license_number", license_number).execute()
        if not business.data:
            raise HTTPException(status_code=404, detail="Business not found")
        return business.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/business/{business_id}")
async def update_business(business_id: int, business: Business, current_user: User = Depends(get_current_user)):
    try:
        updated_business = supabase.table("businesses").update(business.dict()).eq("id", business_id).execute()
        if not updated_business.data:
            raise HTTPException(status_code=404, detail="Business not found")
        return {"message": "Business updated successfully", "business": updated_business.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Inspection routes
@app.post("/inspection")
async def create_inspection(inspection: Inspection, current_user: User = Depends(get_current_user)):
    try:
        new_inspection = supabase.table("inspections").insert(inspection.dict()).execute()
        return {"message": "Inspection created successfully", "inspection": new_inspection.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/inspections/{business_id}")
async def get_inspections(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        inspections = supabase.table("inspections").select("*").eq("business_id", business_id).execute()
        return inspections.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Hygiene Rating routes
@app.post("/hygiene-rating")
async def create_hygiene_rating(rating: HygieneRating, current_user: User = Depends(get_current_user)):
    try:
        new_rating = supabase.table("hygiene_ratings").insert(rating.dict()).execute()
        return {"message": "Hygiene rating created successfully", "rating": new_rating.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/hygiene-ratings/{business_id}")
async def get_hygiene_ratings(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        ratings = supabase.table("hygiene_ratings").select("*").eq("business_id", business_id).execute()
        return ratings.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Lab Report routes
@app.post("/lab-report")
async def create_lab_report(report: LabReport, current_user: User = Depends(get_current_user)):
    try:
        new_report = supabase.table("lab_reports").insert(report.dict()).execute()
        return {"message": "Lab report created successfully", "report": new_report.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/lab-reports/{business_id}")
async def get_lab_reports(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        reports = supabase.table("lab_reports").select("*").eq("business_id", business_id).execute()
        return reports.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Certification routes
@app.post("/certification")
async def create_certification(certification: Certification, current_user: User = Depends(get_current_user)):
    try:
        new_certification = supabase.table("certifications").insert(certification.dict()).execute()
        return {"message": "Certification created successfully", "certification": new_certification.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/certifications/{business_id}")
async def get_certifications(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        certifications = supabase.table("certifications").select("*").eq("business_id", business_id).execute()
        return certifications.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Team Member routes
@app.post("/team-member")
async def create_team_member(team_member: TeamMember, current_user: User = Depends(get_current_user)):
    try:
        new_team_member = supabase.table("team_members").insert(team_member.dict()).execute()
        return {"message": "Team member created successfully", "team_member": new_team_member.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/team-members/{business_id}")
async def get_team_members(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        team_members = supabase.table("team_members").select("*").eq("business_id", business_id).execute()
        return team_members.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Facility Photo routes
@app.post("/facility-photo")
async def create_facility_photo(facility_photo: FacilityPhoto, current_user: User = Depends(get_current_user)):
    try:
        new_facility_photo = supabase.table("facility_photos").insert(facility_photo.dict()).execute()
        return {"message": "Facility photo created successfully", "facility_photo": new_facility_photo.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/facility-photos/{business_id}")
async def get_facility_photos(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        facility_photos = supabase.table("facility_photos").select("*").eq("business_id", business_id).execute()
        return facility_photos.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Review routes
@app.post("/review")
async def create_review(review: Review, current_user: User = Depends(get_current_user)):
    try:
        new_review = supabase.table("reviews").insert(review.dict()).execute()
        return {"message": "Review created successfully", "review": new_review.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/reviews/{business_id}")
async def get_reviews(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        reviews = supabase.table("reviews").select("*").eq("business_id", business_id).execute()
        return reviews.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Manufacturing Details routes
@app.post("/manufacturing-details")
async def create_manufacturing_details(details: ManufacturingDetails, current_user: User = Depends(get_current_user)):
    try:
        new_details = supabase.table("manufacturing_details").insert(details.dict()).execute()
        return {"message": "Manufacturing details created successfully", "details": new_details.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/manufacturing-details/{business_id}")
async def get_manufacturing_details(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        details = supabase.table("manufacturing_details").select("*").eq("business_id", business_id).execute()
        if not details.data:
            raise HTTPException(status_code=404, detail="Manufacturing details not found")
        return details.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/manufacturing-details/{business_id}")
async def update_manufacturing_details(business_id: int, details: ManufacturingDetails, current_user: User = Depends(get_current_user)):
    try:
        updated_details = supabase.table("manufacturing_details").update(details.dict()).eq("business_id", business_id).execute()
        if not updated_details.data:
            raise HTTPException(status_code=404, detail="Manufacturing details not found")
        return {"message": "Manufacturing details updated successfully", "details": updated_details.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Batch Production Details routes
@app.post("/batch-production")
async def create_batch_production(batch: BatchProductionDetails, current_user: User = Depends(get_current_user)):
    try:
        new_batch = supabase.table("batch_production").insert(batch.dict()).execute()
        return {"message": "Batch production details created successfully", "batch": new_batch.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/batch-production/{business_id}")
async def get_batch_production(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        batches = supabase.table("batch_production").select("*").eq("business_id", business_id).execute()
        return batches.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Raw Material Supplier routes
@app.post("/raw-material-supplier")
async def create_raw_material_supplier(supplier: RawMaterialSupplier, current_user: User = Depends(get_current_user)):
    try:
        new_supplier = supabase.table("raw_material_suppliers").insert(supplier.dict()).execute()
        return {"message": "Raw material supplier created successfully", "supplier": new_supplier.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/raw-material-suppliers/{business_id}")
async def get_raw_material_suppliers(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        suppliers = supabase.table("raw_material_suppliers").select("*").eq("business_id", business_id).execute()
        return suppliers.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Packaging Compliance routes
@app.post("/packaging-compliance")
async def create_packaging_compliance(compliance: PackagingCompliance, current_user: User = Depends(get_current_user)):
    try:
        new_compliance = supabase.table("packaging_compliance").insert(compliance.dict()).execute()
        return {"message": "Packaging compliance created successfully", "compliance": new_compliance.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/packaging-compliance/{business_id}")
async def get_packaging_compliance(business_id: int, current_user: User = Depends(get_current_user)):
    try:
        compliance = supabase.table("packaging_compliance").select("*").eq("business_id", business_id).execute()
        if not compliance.data:
            raise HTTPException(status_code=404, detail="Packaging compliance not found")
        return compliance.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = await auth.get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
