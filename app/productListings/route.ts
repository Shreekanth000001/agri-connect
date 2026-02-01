  "use server"
import { prisma } from '@/lib//prisma';
export async function POST( req: Request) {
  const { id } = await req.json();
  console.log("id recieved: ",id);

  const proddata = await prisma.productAuction.findUnique({ where: { ProdAucId: Number(id) } });
  const fdata = await prisma.user.findUnique({ where: { uid: Number(proddata?.fid) } });
  const combinedData = {
    prodData: proddata,
    fData: fdata
  }
  const returns = new Response(JSON.stringify(combinedData));
  return returns;
}

// export async function POST() {
//   let bid = await prisma.productAuction.create({
//     data: {
//       fid: 2,
//       title: 'Banana',
//       description: 'Medium size',
//       startingBid: 80,
//       endTime: new Date("2026-01-27")
//     }
//   })

//   return new Response(JSON.stringify(bid));
// }

