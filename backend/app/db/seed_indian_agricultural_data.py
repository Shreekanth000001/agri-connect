import asyncio
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, delete
from app.db.base import Base, User, ProductAuction, BidId, Conversation, ConversationParticipant, Message
from app.db.session import AsyncSessionLocal
from app.models.user import Role
from app.models.auction import AuctionStatus, Category
from app.models.bid import Status as BidStatus
from app.models.chat import ConversationStatus
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hash for "password"
DEFAULT_PASSWORD_HASH = get_password_hash("password")

# 1. Authentic Indian Farmers (15 Farmers across distinct agricultural hubs)
INDIAN_FARMERS = [
    {
        "uid": 1,
        "uname": "Rameshwar Patil",
        "uemail": "farmer1@agriconnect.com",
        "uphone": "+91 9822011401",
        "ugeo": "Ratnagiri, Maharashtra - 415612",
        "uloc": "16.9902, 73.3120",
        "role": Role.FARMER,
    },
    {
        "uid": 2,
        "uname": "Gurpreet Singh",
        "uemail": "farmer2@agriconnect.com",
        "uphone": "+91 9814022502",
        "ugeo": "Ludhiana, Punjab - 141001",
        "uloc": "30.9010, 75.8573",
        "role": Role.FARMER,
    },
    {
        "uid": 3,
        "uname": "Venkatesh Reddy",
        "uemail": "farmer3@agriconnect.com",
        "uphone": "+91 9440333603",
        "ugeo": "Guntur, Andhra Pradesh - 522002",
        "uloc": "16.3067, 80.4365",
        "role": Role.FARMER,
    },
    {
        "uid": 4,
        "uname": "Kiran Gowda",
        "uemail": "farmer4@agriconnect.com",
        "uphone": "+91 9845444704",
        "ugeo": "Madikeri, Coorg, Karnataka - 571201",
        "uloc": "12.4244, 75.7382",
        "role": Role.FARMER,
    },
    {
        "uid": 5,
        "uname": "Rajendra Sharma",
        "uemail": "farmer5@agriconnect.com",
        "uphone": "+91 9414555805",
        "ugeo": "Nagaur, Rajasthan - 341001",
        "uloc": "27.2070, 73.7422",
        "role": Role.FARMER,
    },
    {
        "uid": 6,
        "uname": "Sunil Deshmukh",
        "uemail": "farmer6@agriconnect.com",
        "uphone": "+91 9765666906",
        "ugeo": "Nagpur, Maharashtra - 440001",
        "uloc": "21.1458, 79.0882",
        "role": Role.FARMER,
    },
    {
        "uid": 7,
        "uname": "Biju Kurien",
        "uemail": "farmer7@agriconnect.com",
        "uphone": "+91 9447777007",
        "ugeo": "Kalpetta, Wayanad, Kerala - 673121",
        "uloc": "11.6854, 76.1320",
        "role": Role.FARMER,
    },
    {
        "uid": 8,
        "uname": "Devendra Jagtap",
        "uemail": "farmer8@agriconnect.com",
        "uphone": "+91 9890888108",
        "ugeo": "Nashik, Maharashtra - 422001",
        "uloc": "19.9975, 73.7898",
        "role": Role.FARMER,
    },
    {
        "uid": 9,
        "uname": "Mohammad Ghulam",
        "uemail": "farmer9@agriconnect.com",
        "uphone": "+91 9906999209",
        "ugeo": "Pulwama, Jammu & Kashmir - 192301",
        "uloc": "33.8718, 74.8973",
        "role": Role.FARMER,
    },
    {
        "uid": 10,
        "uname": "Tapan Das",
        "uemail": "farmer10@agriconnect.com",
        "uphone": "+91 9831000310",
        "ugeo": "Hooghly, West Bengal - 712101",
        "uloc": "22.9038, 88.3846",
        "role": Role.FARMER,
    },
    {
        "uid": 11,
        "uname": "Suresh Verma",
        "uemail": "farmer11@agriconnect.com",
        "uphone": "+91 9825111411",
        "ugeo": "Anand, Gujarat - 388001",
        "uloc": "22.5645, 72.9289",
        "role": Role.FARMER,
    },
    {
        "uid": 12,
        "uname": "Muthuvel Karunanidhi",
        "uemail": "farmer12@agriconnect.com",
        "uphone": "+91 9443222512",
        "ugeo": "Pollachi, Coimbatore, Tamil Nadu - 642001",
        "uloc": "10.6609, 77.0048",
        "role": Role.FARMER,
    },
    {
        "uid": 13,
        "uname": "Shivpal Yadav",
        "uemail": "farmer13@agriconnect.com",
        "uphone": "+91 9415333613",
        "ugeo": "Varanasi, Uttar Pradesh - 221001",
        "uloc": "25.3176, 82.9739",
        "role": Role.FARMER,
    },
    {
        "uid": 14,
        "uname": "Hiren Phukan",
        "uemail": "farmer14@agriconnect.com",
        "uphone": "+91 9435444714",
        "ugeo": "Jorhat, Assam - 785001",
        "uloc": "26.7509, 94.2037",
        "role": Role.FARMER,
    },
    {
        "uid": 15,
        "uname": "Manjunath Hegde",
        "uemail": "farmer15@agriconnect.com",
        "uphone": "+91 9880555815",
        "ugeo": "Shimoga, Karnataka - 577201",
        "uloc": "13.9299, 75.5681",
        "role": Role.FARMER,
    },
]

# 2. Authentic Indian Bulk Buyers (5 Buyers across major trade centers)
INDIAN_BUYERS = [
    {
        "uid": 16,
        "uname": "Clementine Shields",
        "uemail": "buyer1@agriconnect.com",
        "uphone": "+91 9820011901",
        "ugeo": "Navi Mumbai Agro Export Zone, Maharashtra - 400703",
        "uloc": "19.0330, 73.0297",
        "role": Role.BUYER,
    },
    {
        "uid": 17,
        "uname": "Clint Collier",
        "uemail": "buyer2@agriconnect.com",
        "uphone": "+91 9845022902",
        "ugeo": "Bengaluru Organic Supermarkets Ltd, Karnataka - 560001",
        "uloc": "12.9716, 77.5946",
        "role": Role.BUYER,
    },
    {
        "uid": 18,
        "uname": "Kelli Lynch",
        "uemail": "buyer3@agriconnect.com",
        "uphone": "+91 9811033903",
        "ugeo": "Azadpur Mandi Wholesale Trade Corp, New Delhi - 110033",
        "uloc": "28.7041, 77.1725",
        "role": Role.BUYER,
    },
    {
        "uid": 19,
        "uname": "Joel Wolff",
        "uemail": "buyer4@agriconnect.com",
        "uphone": "+91 9825044904",
        "ugeo": "Ahmedabad FMCG Food Processing Hub, Gujarat - 380001",
        "uloc": "23.0225, 72.5714",
        "role": Role.BUYER,
    },
    {
        "uid": 20,
        "uname": "Aarav Singhania",
        "uemail": "buyer5@agriconnect.com",
        "uphone": "+91 9840055905",
        "ugeo": "Koyambedu Wholesale Market, Chennai, Tamil Nadu - 600107",
        "uloc": "13.0732, 80.1932",
        "role": Role.BUYER,
    },
]

# 3. Tailored Indian Produce Product Listings (30 items with authentic images, prices, descriptions, locations)
INDIAN_PRODUCTS = [
    # FRUITS
    {
        "fid": 1, # Rameshwar Patil
        "title": "Devgad Alphonso Mangoes (Grade A Export)",
        "description": "Naturally tree-ripened premium GI-tagged Alphonso (Hapus) mangoes from coastal Ratnagiri orchards. Saffron aroma, rich sweet pulp. Packed in 1-dozen wooden crates (approx 3.5 kg/crate). Minimum order: 5 crates.",
        "startingBid": 1200.0,
        "category": Category.FRUITS,
        "imageUrl": ["https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 6, # Sunil Deshmukh
        "title": "Fresh Nagpur Juicy Oranges (50kg Bag)",
        "description": "Farm-fresh GI-tagged Nagpur oranges direct from Vidarbha citrus groves. High juice content, vibrant orange peel, sweet-tangy taste. Graded size 60-70mm.",
        "startingBid": 2250.0,
        "category": Category.FRUITS,
        "imageUrl": ["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 9, # Mohammad Ghulam
        "title": "Shimla Royal Delicious Red Apples (20kg Crate)",
        "description": "Crisp, sweet, deep crimson Royal Delicious apples harvested from high-altitude Himachal/Kashmir mountain orchards. Cold-storage preserved at 2°C.",
        "startingBid": 2800.0,
        "category": Category.FRUITS,
        "imageUrl": ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 8, # Devendra Jagtap
        "title": "Nashik Thomson Seedless Green Grapes",
        "description": "Export quality sweet green seedless grapes from Nashik vineyards. Crisp texture, sugar level Brix 18+. Packed in 5kg corrugated cartons.",
        "startingBid": 375.0,
        "category": Category.FRUITS,
        "imageUrl": ["https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 8, # Devendra Jagtap
        "title": "Maharashtrian Bhagwa Red Pomegranates",
        "description": "Deep red soft-seeded Bhagwa variety pomegranates. Rich in antioxidants, high aril weight. Size 300g+ per fruit. Minimum order 100 kg.",
        "startingBid": 110.0,
        "category": Category.FRUITS,
        "imageUrl": ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"],
    },

    # VEGETABLES
    {
        "fid": 8, # Devendra Jagtap
        "title": "Nashik Export Quality Red Onions (Quintal)",
        "description": "Medium-sized firm red onions from Nashik APMC belt. Low moisture, 45-day storage life, strong pungent aroma. Packed in 50kg jute sacks.",
        "startingBid": 2400.0,
        "category": Category.VEGETABLES,
        "imageUrl": ["https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 10, # Tapan Das
        "title": "Hooghly Fresh Jyoti Potatoes (50kg Bag)",
        "description": "Freshly harvested Gangetic alluvial Jyoti potatoes from Hooghly district. Smooth skin, ideal for cooking and chip manufacturing.",
        "startingBid": 900.0,
        "category": Category.VEGETABLES,
        "imageUrl": ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 15, # Manjunath Hegde
        "title": "Bengaluru Hybrid Firm Red Tomatoes (25kg Crate)",
        "description": "Farm-pick firm red vine tomatoes from Kolar/Bengaluru green farms. Ideal for retail markets and food processing plants.",
        "startingBid": 800.0,
        "category": Category.VEGETABLES,
        "imageUrl": ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 3, # Venkatesh Reddy
        "title": "Guntur Sannam S4 Stemless Red Chillies",
        "description": "Sun-dried fiery red Sannam S4 chillies from Guntur market yard. High capsaicin content, deep red color rating ASTA 40-50.",
        "startingBid": 18500.0, # per quintal
        "category": Category.VEGETABLES,
        "imageUrl": ["https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 14, # Hiren Phukan
        "title": "Assam Organic Bhut Jolokia (Ghost Pepper)",
        "description": "Authentic super-hot Bhut Jolokia chillies cultivated in Jorhat, Assam. SHU level exceeding 1,000,000 units. Air-dried and packed in 1kg vacuum sealed bags.",
        "startingBid": 450.0,
        "category": Category.VEGETABLES,
        "imageUrl": ["https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80"],
    },

    # GRAINS & PULSES
    {
        "fid": 2, # Gurpreet Singh
        "title": "Ludhiana Sharbati Golden Wheat (Quintal)",
        "description": "Premium Sharbati rainfed golden wheat grains from Malwa belt, Punjab. Heavy grain weight, high protein content (13%+), perfect for soft rotis.",
        "startingBid": 2450.0,
        "category": Category.GRAINS,
        "imageUrl": ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 2, # Gurpreet Singh
        "title": "Basmati Rice 1121 Steam Extra Long Grain",
        "description": "Aged 2 years, 1121 Steam Basmati Rice with average grain length of 8.35 mm. Exceptional aroma and non-sticky texture upon cooking.",
        "startingBid": 8500.0, # per quintal
        "category": Category.GRAINS,
        "imageUrl": ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 10, # Tapan Das
        "title": "Gobindobhog Aromatic Short Grain Rice",
        "description": "Traditional GI-tagged aromatic rice from West Bengal. Naturally sticky, sweet fragrance, essential for Bengali Payesh and Khichuri.",
        "startingBid": 6800.0, # per quintal
        "category": Category.GRAINS,
        "imageUrl": ["https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 5, # Rajendra Sharma
        "title": "Nagaur Organic Cumin (Jeera) Seeds (25kg)",
        "description": "Machine-cleaned bold aromatic cumin seeds grown in arid Nagaur soil. High essential oil percentage, zero moisture adulteration.",
        "startingBid": 6500.0,
        "category": Category.GRAINS,
        "imageUrl": ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 11, # Suresh Verma
        "title": "Anand Bold Groundnut (Moongphali) Kernels",
        "description": "Double-sorted Gujarat groundnut kernels with high oil yield (48%). Ideal for oil extraction and roasted snacks.",
        "startingBid": 7800.0, # per quintal
        "category": Category.GRAINS,
        "imageUrl": ["https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80"],
    },

    # DAIRY
    {
        "fid": 11, # Suresh Verma
        "title": "Gir Cow Pure A2 Vedic Bilona Ghee (1 Liter)",
        "description": "Authentic A2 Ghee made using traditional Vedic Bilona method from free-range Gir cows in Anand, Gujarat. Golden color, granular texture, rich aroma.",
        "startingBid": 1400.0,
        "category": Category.DAIRY,
        "imageUrl": ["https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 11, # Suresh Verma
        "title": "Fresh Pure Farm Malai Paneer (5kg Block)",
        "description": "Soft, high-fat fresh cottage cheese prepared daily from pure Anand cow milk. Vacuum packed for maximum freshness.",
        "startingBid": 1700.0,
        "category": Category.DAIRY,
        "imageUrl": ["https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80"],
    },

    # SPICES & CASH CROPS (OTHER)
    {
        "fid": 4, # Kiran Gowda
        "title": "Coorg Organic Tellicherry Black Pepper (TGSEB)",
        "description": "Tellicherry Garbled Extra Bold (TGSEB) sun-dried black peppercorns harvested from high-elevation Coorg plantations. Pungent aroma, 4.5%+ piperine content.",
        "startingBid": 520.0, # per kg
        "category": Category.OTHER,
        "imageUrl": ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 7, # Biju Kurien
        "title": "Wayanad Bold Green Cardamom (8mm Export)",
        "description": "Whole 8mm extra-bold green cardamom pods from Wayanad Western Ghats. Intense camphoraceous aroma, vibrant green hue.",
        "startingBid": 2100.0, # per kg
        "category": Category.OTHER,
        "imageUrl": ["https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 12, # Muthuvel Karunanidhi
        "title": "Pollachi Sweet Tender Coconut (Lot of 100 Nuts)",
        "description": "Large green tender coconuts with 450ml+ sweet coconut water and tender meat from coastal Pollachi groves.",
        "startingBid": 3500.0,
        "category": Category.OTHER,
        "imageUrl": ["https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 14, # Hiren Phukan
        "title": "Jorhat Assam CTC Black Tea (Granular 10kg)",
        "description": "Strong, malty CTC black tea from Upper Assam tea estates. Deep amber liquor, ideal for Indian Masala Chai blends.",
        "startingBid": 2800.0,
        "category": Category.OTHER,
        "imageUrl": ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 9, # Mohammad Ghulam
        "title": "Kashmiri Pure Lacha Saffron (Zafran 10g)",
        "description": "100% pure organic GI-tagged Kashmiri Lacha Saffron from Pampore/Pulwama fields. Deep maroon threads, supreme coloring power and aroma.",
        "startingBid": 2200.0,
        "category": Category.OTHER,
        "imageUrl": ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 4, # Kiran Gowda
        "title": "Coorg Single-Origin Roasted Arabica Coffee Beans",
        "description": "Shade-grown Arabica coffee beans from Coorg hill slopes. Medium roast with chocolatey notes and balanced acidity.",
        "startingBid": 420.0,
        "category": Category.OTHER,
        "imageUrl": ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"],
    },
    {
        "fid": 3, # Venkatesh Reddy
        "title": "Salem High-Curcumin Turmeric Powder (5kg)",
        "description": "Pure unadulterated golden turmeric powder milled from Salem/Guntur fingers. Curcumin level 4.8%.",
        "startingBid": 800.0,
        "category": Category.OTHER,
        "imageUrl": ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"],
    },
]

async def seed_data():
    async with AsyncSessionLocal() as db:
        logger.info("🧹 Step 1: Cleaning up old fake auctions, bids, and chat history...")

        await db.execute(delete(Message))
        await db.execute(delete(ConversationParticipant))
        await db.execute(delete(Conversation))
        await db.execute(delete(BidId))
        await db.execute(delete(ProductAuction))

        logger.info("👤 Step 2: Updating/Inserting 15 Farmers & 5 Buyers with authentic Indian credentials...")
        all_users_data = INDIAN_FARMERS + INDIAN_BUYERS

        for udata in all_users_data:
            existing = await db.get(User, udata["uid"])
            if existing:
                existing.uname = udata["uname"]
                existing.uemail = udata["uemail"]
                existing.uphone = udata["uphone"]
                existing.ugeo = udata["ugeo"]
                existing.uloc = udata["uloc"]
                existing.role = udata["role"]
                if not existing.password:
                    existing.password = DEFAULT_PASSWORD_HASH
            else:
                new_u = User(
                    uid=udata["uid"],
                    uname=udata["uname"],
                    uemail=udata["uemail"],
                    password=DEFAULT_PASSWORD_HASH,
                    uphone=udata["uphone"],
                    ugeo=udata["ugeo"],
                    uloc=udata["uloc"],
                    role=udata["role"],
                )
                db.add(new_u)

        await db.commit()

        logger.info("🌾 Step 3: Seeding 24 authentic Indian agricultural product auctions...")
        now = datetime.now()
        end_date = now + timedelta(days=14)

        created_auctions = []
        for pdata in INDIAN_PRODUCTS:
            auc = ProductAuction(
                fid=pdata["fid"],
                title=pdata["title"],
                description=pdata["description"],
                startingBid=pdata["startingBid"],
                startTime=now,
                endTime=end_date,
                auctionStatus=AuctionStatus.OPEN,
                category=pdata["category"],
                imageUrl=pdata["imageUrl"],
            )
            db.add(auc)
            created_auctions.append(auc)

        await db.commit()
        logger.info(f"✅ Created {len(created_auctions)} high-quality Indian agricultural product listings!")

        logger.info("💰 Step 4: Seeding active bids from Indian wholesale buyers...")
        # Get actual created auction IDs
        db_auctions = (await db.execute(select(ProductAuction))).scalars().all()

        sample_bids = []
        buyer_ids = [16, 17, 18, 19, 20]

        for i, auc in enumerate(db_auctions):
            # Add 1-2 bids per auction
            buyer_id = buyer_ids[i % len(buyer_ids)]
            bid_price = round(auc.startingBid * 1.08, 2)
            bid = BidId(
                aucId=auc.ProdAucId,
                cid=buyer_id,
                fid=auc.fid,
                bidAmount=bid_price,
                deliveryDate=now + timedelta(days=7),
                status=BidStatus.PENDING
            )
            db.add(bid)
            sample_bids.append(bid)

        await db.commit()
        logger.info(f"✅ Created {len(sample_bids)} active marketplace bids!")

        logger.info("💬 Step 5: Seeding active chat negotiations between buyers & farmers...")
        # Create 3 active conversations with messages
        conv1 = Conversation(product_id=db_auctions[0].ProdAucId, farmer_id=1, consumer_id=17, status=ConversationStatus.OPEN)
        conv2 = Conversation(product_id=db_auctions[1].ProdAucId, farmer_id=6, consumer_id=16, status=ConversationStatus.OPEN)
        conv3 = Conversation(product_id=db_auctions[5].ProdAucId, farmer_id=8, consumer_id=18, status=ConversationStatus.OPEN)
        
        db.add_all([conv1, conv2, conv3])
        await db.commit()

        # Add participants
        parts = [
            ConversationParticipant(conversation_id=conv1.id, user_id=1),
            ConversationParticipant(conversation_id=conv1.id, user_id=17),
            ConversationParticipant(conversation_id=conv2.id, user_id=6),
            ConversationParticipant(conversation_id=conv2.id, user_id=16),
            ConversationParticipant(conversation_id=conv3.id, user_id=8),
            ConversationParticipant(conversation_id=conv3.id, user_id=18),
        ]
        db.add_all(parts)
        await db.commit()

        # Add realistic negotiation messages
        msgs = [
            Message(conversation_id=conv1.id, sender_id=17, content="Namaste Rameshwarji, interested in 10 crates of Devgad Alphonso. Is transport to Bengaluru included?"),
            Message(conversation_id=conv1.id, sender_id=1, content="Namaste Clintji. Transport is extra at ₹150/crate via refrigerated vehicle. Quality is 100% guaranteed Grade A."),
            Message(conversation_id=conv2.id, sender_id=16, content="Sunilji, what is the current moisture level on the Nagpur Oranges lot?"),
            Message(conversation_id=conv2.id, sender_id=6, content="Freshly plucked yesterday Clementineji. Moisture is optimal, Brix 11+. Ready for dispatch to Mumbai."),
        ]
        db.add_all(msgs)
        await db.commit()

        logger.info("🎉 Database refactoring complete! Pure authentic Indian dataset ready.")

if __name__ == "__main__":
    asyncio.run(seed_data())
