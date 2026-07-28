import json
import logging
from datetime import datetime
from typing import Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Role
from app.models.auction import Category
from app.repositories.product_repository import product_repository
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    PaginatedProductsResponse,
    CategoryListResponse
)
from app.services.ai.memory import memory_store

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 30

class ProductService:
    def _cache_key(self, prefix: str, **kwargs: Any) -> str:
        param_str = ":".join(f"{k}={v}" for k, v in sorted(kwargs.items()) if v is not None)
        return f"agri:cache:{prefix}:{param_str}"

    async def get_products(
        self,
        db: AsyncSession,
        page: int = 1,
        limit: int = 20,
        category: str | None = None,
        status_filter: str | None = "OPEN",
        min_price: float | None = None,
        max_price: float | None = None,
        farmer_id: int | None = None,
        sort_by: str = "newest"
    ) -> PaginatedProductsResponse:
        cache_key = self._cache_key(
            "catalog", page=page, limit=limit, category=category, status=status_filter,
            min=min_price, max=max_price, farmer=farmer_id, sort=sort_by
        )
        
        # Check cache
        cached_data = await memory_store.get_val(cache_key)
        if cached_data:
            try:
                return PaginatedProductsResponse(**json.loads(cached_data))
            except Exception:
                pass

        items, total = await product_repository.get_all(
            db, page=page, limit=limit, category=category, status=status_filter,
            min_price=min_price, max_price=max_price, farmer_id=farmer_id, sort_by=sort_by
        )
        
        pages = (total + limit - 1) // limit if limit > 0 else 1
        summaries = [ProductResponse.model_validate(item) for item in items]
        
        response = PaginatedProductsResponse(
            items=summaries,
            total=total,
            page=page,
            pages=pages,
            limit=limit
        )

        try:
            await memory_store.set_val(cache_key, response.model_dump_json(), ttl_seconds=CACHE_TTL_SECONDS)
        except Exception:
            pass

        return response

    async def search_products(
        self,
        db: AsyncSession,
        q: str,
        page: int = 1,
        limit: int = 20,
        category: str | None = None
    ) -> PaginatedProductsResponse:
        cache_key = self._cache_key("search", q=q, page=page, limit=limit, category=category)

        cached_data = await memory_store.get_val(cache_key)
        if cached_data:
            try:
                return PaginatedProductsResponse(**json.loads(cached_data))
            except Exception:
                pass

        items, total = await product_repository.search(
            db, q=q, page=page, limit=limit, category=category
        )
        
        pages = (total + limit - 1) // limit if limit > 0 else 1
        summaries = [ProductResponse.model_validate(item) for item in items]

        response = PaginatedProductsResponse(
            items=summaries,
            total=total,
            page=page,
            pages=pages,
            limit=limit
        )

        try:
            await memory_store.set_val(cache_key, response.model_dump_json(), ttl_seconds=CACHE_TTL_SECONDS)
        except Exception:
            pass

        return response

    async def get_product_by_id(self, db: AsyncSession, product_id: int) -> ProductResponse:
        cache_key = self._cache_key("detail", id=product_id)
        cached_data = await memory_store.get_val(cache_key)
        if cached_data:
            try:
                return ProductResponse(**json.loads(cached_data))
            except Exception:
                pass

        product = await product_repository.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        resp = ProductResponse.model_validate(product)

        try:
            await memory_store.set_val(cache_key, resp.model_dump_json(), ttl_seconds=CACHE_TTL_SECONDS)
        except Exception:
            pass

        return resp

    async def create_product(
        self, db: AsyncSession, current_user: User, product_in: ProductCreate
    ) -> ProductResponse:
        if current_user.role != Role.FARMER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered farmers can create product listings"
            )

        if product_in.startingBid <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Starting bid must be greater than 0"
            )

        if product_in.endTime <= datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End time must be in the future"
            )

        product = await product_repository.create(db, current_user.uid, product_in)
        return ProductResponse.model_validate(product)

    async def update_product(
        self, db: AsyncSession, product_id: int, current_user: User, product_update: ProductUpdate
    ) -> ProductResponse:
        product = await product_repository.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )

        if product.fid != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this product listing"
            )

        updated_product = await product_repository.update(db, product, product_update)
        return ProductResponse.model_validate(updated_product)

    async def delete_product(
        self, db: AsyncSession, product_id: int, current_user: User
    ) -> dict[str, str]:
        product = await product_repository.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )

        if product.fid != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this product listing"
            )

        await product_repository.delete(db, product)
        return {"detail": f"Product {product_id} successfully deleted"}

    def get_categories(self) -> CategoryListResponse:
        categories = [c.value for c in Category]
        return CategoryListResponse(categories=categories)

product_service = ProductService()
