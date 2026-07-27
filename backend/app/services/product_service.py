from datetime import datetime
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

class ProductService:
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
        items, total = await product_repository.get_all(
            db, page=page, limit=limit, category=category, status=status_filter,
            min_price=min_price, max_price=max_price, farmer_id=farmer_id, sort_by=sort_by
        )
        
        pages = (total + limit - 1) // limit if limit > 0 else 1
        summaries = [ProductResponse.model_validate(item) for item in items]
        
        return PaginatedProductsResponse(
            items=summaries,
            total=total,
            page=page,
            pages=pages,
            limit=limit
        )

    async def search_products(
        self,
        db: AsyncSession,
        q: str,
        page: int = 1,
        limit: int = 20,
        category: str | None = None
    ) -> PaginatedProductsResponse:
        items, total = await product_repository.search(
            db, q=q, page=page, limit=limit, category=category
        )
        
        pages = (total + limit - 1) // limit if limit > 0 else 1
        summaries = [ProductResponse.model_validate(item) for item in items]

        return PaginatedProductsResponse(
            items=summaries,
            total=total,
            page=page,
            pages=pages,
            limit=limit
        )

    async def get_product_by_id(self, db: AsyncSession, product_id: int) -> ProductResponse:
        product = await product_repository.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        return ProductResponse.model_validate(product)

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
