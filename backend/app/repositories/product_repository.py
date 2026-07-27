from sqlalchemy import select, func, or_, and_, desc, asc, cast, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime
from app.models.auction import ProductAuction, AuctionStatus, Category
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate

class ProductRepository:
    async def get_all(
        self,
        db: AsyncSession,
        page: int = 1,
        limit: int = 20,
        category: str | None = None,
        status: str | None = "OPEN",
        min_price: float | None = None,
        max_price: float | None = None,
        farmer_id: int | None = None,
        sort_by: str = "newest"
    ) -> tuple[list[ProductAuction], int]:
        query = select(ProductAuction).options(selectinload(ProductAuction.user_fid))
        
        conditions = []
        if farmer_id is not None:
            conditions.append(ProductAuction.fid == farmer_id)
        if status and status.upper() != "ALL":
            conditions.append(cast(ProductAuction.auctionStatus, String) == status)
        if category and category.upper() != "ALL":
            conditions.append(func.upper(cast(ProductAuction.category, String)) == category.upper())
        if min_price is not None:
            conditions.append(ProductAuction.startingBid >= min_price)
        if max_price is not None:
            conditions.append(ProductAuction.startingBid <= max_price)

        if conditions:
            query = query.where(and_(*conditions))

        # Total count query
        total_stmt = select(func.count()).select_from(query.subquery())
        total_res = await db.execute(total_stmt)
        total = total_res.scalar() or 0

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(asc(ProductAuction.startingBid))
        elif sort_by == "price_desc":
            query = query.order_by(desc(ProductAuction.startingBid))
        elif sort_by == "oldest":
            query = query.order_by(asc(ProductAuction.CreatedAt))
        else:  # newest
            query = query.order_by(desc(ProductAuction.CreatedAt))

        # Pagination
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def search(
        self,
        db: AsyncSession,
        q: str,
        page: int = 1,
        limit: int = 20,
        category: str | None = None
    ) -> tuple[list[ProductAuction], int]:
        search_pattern = f"%{q}%"
        query = (
            select(ProductAuction)
            .outerjoin(User, ProductAuction.fid == User.uid)
            .options(selectinload(ProductAuction.user_fid))
            .where(
                or_(
                    ProductAuction.title.ilike(search_pattern),
                    ProductAuction.description.ilike(search_pattern),
                    User.uname.ilike(search_pattern)
                )
            )
        )

        if category:
            query = query.where(ProductAuction.category == category)

        total_stmt = select(func.count()).select_from(query.subquery())
        total_res = await db.execute(total_stmt)
        total = total_res.scalar() or 0

        query = query.order_by(desc(ProductAuction.CreatedAt)).offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, db: AsyncSession, product_id: int) -> ProductAuction | None:
        query = select(ProductAuction).where(ProductAuction.ProdAucId == product_id).options(selectinload(ProductAuction.user_fid))
        result = await db.execute(query)
        return result.scalars().first()

    async def create(self, db: AsyncSession, farmer_id: int, product_in: ProductCreate) -> ProductAuction:
        start_time = product_in.startTime or datetime.now()
        product = ProductAuction(
            fid=farmer_id,
            title=product_in.title,
            description=product_in.description,
            startingBid=product_in.startingBid,
            startTime=start_time,
            endTime=product_in.endTime,
            category=product_in.category,
            imageUrl=product_in.imageUrl,
            auctionStatus=AuctionStatus.OPEN
        )
        db.add(product)
        await db.commit()
        await db.refresh(product)
        return await self.get_by_id(db, product.ProdAucId) # type: ignore

    async def update(self, db: AsyncSession, product: ProductAuction, product_update: ProductUpdate) -> ProductAuction:
        update_data = product_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)

        db.add(product)
        await db.commit()
        await db.refresh(product)
        return await self.get_by_id(db, product.ProdAucId) # type: ignore

    async def delete(self, db: AsyncSession, product: ProductAuction) -> None:
        await db.delete(product)
        await db.commit()

product_repository = ProductRepository()
