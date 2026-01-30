import { prisma } from '@/lib//prisma';
export async function GET(request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;
    const proddata = await prisma.productAuction.findUnique({ where: { ProdAucId: Number(id) } });
    const fdata = await prisma.user.findUnique({ where: { uid: Number(proddata?.fid) } });
    const combinedData = {
        prodData:proddata,
        fData:fdata
    }
    const returns= new Response(JSON.stringify(combinedData));
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

