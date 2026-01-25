import { prisma } from '@/lib//prisma';
import { revalidatePath } from 'next/cache'

// 1. Initialize Prisma
// const prisma = new PrismaClient()

// 2. The Server Action
// export async function createListing(formData: FormData) {
//   "use server"
//   // Extract data from the form
//   // (In a real app, we would validate this with Zod)
//   const cropName = formData.get('cropName') as string
//   const quantity = formData.get('quantity') as string
//   const price = formData.get('price') as string

//   // 3. Save to Database
//   // We are hardcoding the userId for now because we don't have login yet
//   // We will create a "Test Farmer" automatically if one doesn't exist

//   // Find or create a dummy user to own this listing
//   let user = await prisma.user.findFirst({ where: { uemail: 'farmer@test.com' }})

//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         uname: 'Test Farmer',
//         uemail: 'farmer@test.com',
//       }
//     })
//   }

//   // Create the listing
//   await prisma.listing.create({
//     data: {
//       cropName: cropName,
//       quantity: parseFloat(quantity),
//       unit: 'kg',             // Defaulting to kg for now
//       pricePerUnit: parseFloat(price),
//       userId: user.id,
//     },
//   })

//   // 4. Refresh the page so the new data shows up
//   revalidatePath('/dashboard')
// }

export async function buttonAct() {
  "use server"
  let bid = await prisma.bidId.create({
    data: {
      aucId: 1,
      cid: 2,
      fid: 1,
      bidAmount: 150,
      deliveryDate: new Date("2026-01-26")
    }
  })
  console.log(new Response(JSON.stringify(bid)));
}

export async function buttonAct2() {
  "use server"
  let bid = await prisma.productAuction.create({
    data: {
      fid: 1,
      title: 'Apple',
      description: 'Kashmir Apple ',
      startingBid: 100,
      endTime: new Date("2026-01-26")
    }
  })
  console.log(new Response(JSON.stringify(bid)));
}