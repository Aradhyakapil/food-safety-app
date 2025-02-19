from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[int] = None
    name: str
    phone_number: str
    email: str
    password: str
    user_type: str

class Business(BaseModel):
    id: Optional[int] = None
    name: str
    address: str
    phone: str
    email: str
    license_number: str
    business_type: str
    owner_id: str  # Changed from int to str to match UUID type in the database
    owner_name: str
    owner_photo_url: str
    logo_url: str
    trade_license: str
    gst_number: str
    fire_safety_cert: str
    liquor_license: Optional[str] = None
    music_license: Optional[str] = None

class Inspection(BaseModel):
    id: Optional[int]
    business_id: int
    inspector_id: int
    date: datetime
    rating: int
    comments: str

class HygieneRating(BaseModel):
    id: Optional[int]
    business_id: int
    rating: int
    date: datetime

class LabReport(BaseModel):
    id: Optional[int]
    business_id: int
    report_type: str
    date: datetime
    result: str
    file_url: Optional[str]

class Certification(BaseModel):
    id: Optional[int]
    business_id: int
    certification_type: str
    issue_date: datetime
    expiry_date: datetime
    certificate_number: str

class TeamMember(BaseModel):
    id: Optional[int]
    business_id: int
    name: str
    role: str
    photo_url: Optional[str]

class FacilityPhoto(BaseModel):
    id: Optional[int]
    business_id: int
    area_name: str
    photo_url: str

class Review(BaseModel):
    id: Optional[int]
    business_id: int
    reviewer_id: int
    rating: int
    comment: str
    date: datetime

class ManufacturingDetails(BaseModel):
    id: Optional[int]
    business_id: int
    production_capacity: str
    manufacturing_license: str
    iso_certification: Optional[str]
    haccp_certification: Optional[str]
    description: str

class BatchProductionDetails(BaseModel):
    id: Optional[int]
    business_id: int
    batch_number: str
    manufacturing_date: datetime
    expiry_date: datetime
    production_facility: str
    quality_report_url: Optional[str]
    supervisor: str
    testing_parameters: str
    storage_conditions: str

class RawMaterialSupplier(BaseModel):
    id: Optional[int]
    business_id: int
    supplier_name: str
    supplier_certification: str
    contact_info: str
    materials_provided: str
    origin_country: str
    traceability_info: str
    compliance_status: str

class PackagingCompliance(BaseModel):
    id: Optional[int]
    business_id: int
    material_type: str
    fssai_compliant: bool
    tamper_proof_method: str
    labeling_details: str
    sustainability_info: str
    barcode: str
    qr_code: Optional[str]
    shelf_life_info: str
    regulatory_certification: str

