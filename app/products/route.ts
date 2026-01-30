import { prisma } from '@/lib//prisma';

export async function GET() {
    const data = await prisma.productAuction.findMany();
    const returns= new Response(JSON.stringify(data));
    return returns;
}

export async function POST() {
    let bid = await prisma.productAuction.create({
    data: {
      fid: 2,
      title: 'Banana',
      description: 'Medium size',
      startingBid: 80,
      endTime: new Date("2026-01-27")
    }
  })

    return new Response(JSON.stringify(bid));
}