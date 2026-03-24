import { prisma } from '@/lib//prisma';

export async function GET() {
    const data = await prisma.productAuction.findMany();
    const returns= new Response(JSON.stringify(data));
    return returns;
}