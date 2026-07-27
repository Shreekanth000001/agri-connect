from fastapi import APIRouter, Query, status
from app.api.deps import SessionDep, CurrentUser, FarmerDep
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    PaginatedProductsResponse,
    CategoryListResponse
)
from app.services.product_service import product_service

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=PaginatedProductsResponse)
async def list_products(
    db: SessionDep,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: str | None = None,
    status: str | None = "OPEN",
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    farmer_id: int | None = None,
    fid: int | None = None,
    sort_by: str = Query("newest", pattern="^(newest|oldest|price_asc|price_desc)$")
):
    target_fid = farmer_id if farmer_id is not None else fid
    return await product_service.get_products(
        db, page=page, limit=limit, category=category, status_filter=status,
        min_price=min_price, max_price=max_price, farmer_id=target_fid, sort_by=sort_by
    )

@router.get("/search", response_model=PaginatedProductsResponse)
async def search_products(
    db: SessionDep,
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: str | None = None
):
    return await product_service.search_products(
        db, q=q, page=page, limit=limit, category=category
    )

@router.get("/categories", response_model=CategoryListResponse)
async def get_categories():
    return product_service.get_categories()

@router.get("/{id}", response_model=ProductResponse)
async def get_product(id: int, db: SessionDep):
    return await product_service.get_product_by_id(db, id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: SessionDep,
    current_farmer: FarmerDep
):
    return await product_service.create_product(db, current_farmer, product_in)

@router.put("/{id}", response_model=ProductResponse)
async def update_product(
    id: int,
    product_update: ProductUpdate,
    db: SessionDep,
    current_farmer: FarmerDep
):
    return await product_service.update_product(db, id, current_farmer, product_update)

@router.delete("/{id}", response_model=dict[str, str])
async def delete_product(
    id: int,
    db: SessionDep,
    current_farmer: FarmerDep
):
    return await product_service.delete_product(db, id, current_farmer)
