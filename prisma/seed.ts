// 1. We use require() to bypass the missing TypeScript definitions for bcrypt
const bcrypt = require('bcrypt');
import { faker } from '@faker-js/faker';

// 2. We import PrismaClient from your CUSTOM generated path
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const karnatakaDistricts = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Udupi', 'Hassan', 'Tumakuru', 'Ballari', 'Kalaburagi'];
// 3. We hardcode the categories here to bypass the Enum import error
const categories = ['VEGETABLES', 'FRUITS', 'GRAINS', 'DAIRY', 'MEAT', 'FISH', 'OTHER'] as const;

async function main() {
    console.log('🌱 Starting database seed...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('👨‍🌾 Creating 15 Farmers...');
    const farmers = [];
    for (let i = 0; i < 15; i++) {
        const district = faker.helpers.arrayElement(karnatakaDistricts);
        const farmer = await prisma.user.create({
            data: {
                uname: faker.person.fullName(),
                uemail: `farmer${i + 1}@agriconnect.com`,
                password: hashedPassword,
                uphone: `+91 ${faker.string.numeric(10)}`,
                ugeo: `${faker.location.streetAddress()}, ${district}, Karnataka - ${faker.location.zipCode('56####')}`,
                uloc: `${faker.location.latitude({ max: 18.0, min: 11.5 })}, ${faker.location.longitude({ max: 78.5, min: 74.0 })}`,
                role: 'FARMER', // Passed as a raw string!
            }
        });
        farmers.push(farmer);
    }

    console.log('🛒 Creating 5 Buyers...');
    const buyers = [];
    for (let i = 0; i < 5; i++) {
        const buyer = await prisma.user.create({
            data: {
                uname: faker.person.fullName(),
                uemail: `buyer${i + 1}@agriconnect.com`,
                password: hashedPassword,
                uphone: `+91 ${faker.string.numeric(10)}`,
                ugeo: `${faker.location.streetAddress()}, Bengaluru, Karnataka - 560001`,
                uloc: `12.9716, 77.5946`,
                role: 'BUYER', // Passed as a raw string!
            }
        });
        buyers.push(buyer);
    }

    console.log('🍅 Creating 100 Products...');
    const products = [];
    
    for (let i = 0; i < 100; i++) {
        const randomFarmer = faker.helpers.arrayElement(farmers);
        const startingBid = faker.number.int({ min: 50, max: 5000 });
        const status = faker.number.int({ min: 1, max: 10 }) > 2 ? 'OPEN' : 'CLOSED'; // Passed as a raw string!

        const product = await prisma.productAuction.create({
            data: {
                fid: randomFarmer.uid,
                title: faker.commerce.productName() + ' (Bulk)',
                description: faker.commerce.productDescription(),
                startingBid: startingBid,
                startTime: faker.date.recent({ days: 5 }), 
                endTime: faker.date.soon({ days: 10 }),    
                auctionStatus: status,
                category: faker.helpers.arrayElement(categories),
                
                // 👇 THE FIX: Using LoremFlickr with a unique lock for every iteration
                imageUrl: [`https://loremflickr.com/400/300/${faker.helpers.arrayElement(['vegetable', 'fruit', 'grain', 'farm'])}?lock=${i}`],
            }
        });
        products.push(product);
    }

    console.log('💰 Placing 50 Bids...');
    const productsToBidOn = faker.helpers.arrayElements(products, 50);

    for (const product of productsToBidOn) {
        const randomBuyer = faker.helpers.arrayElement(buyers);
        const bidAmount = faker.number.int({ min: product.startingBid + 10, max: product.startingBid + 2000 });

        await prisma.bidId.create({
            data: {
                aucId: product.ProdAucId,
                cid: randomBuyer.uid,
                fid: product.fid,
                bidAmount: bidAmount,
                status: 'PENDING', // Passed as a raw string!
            }
        });
    }

    console.log('✅ Seeding completely finished! You now have a thriving marketplace.');
    console.log('🔑 Test Account Login: farmer1@agriconnect.com | Password: password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });