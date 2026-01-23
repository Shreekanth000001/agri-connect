"use server"

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// 1. Initialize Prisma
const prisma = new PrismaClient()

// 2. The Server Action
export async function createListing(formData: FormData) {
  
  // Extract data from the form
  // (In a real app, we would validate this with Zod)
  const cropName = formData.get('cropName') as string
  const quantity = formData.get('quantity') as string
  const price = formData.get('price') as string
  
  // 3. Save to Database
  // We are hardcoding the userId for now because we don't have login yet
  // We will create a "Test Farmer" automatically if one doesn't exist
  
  // Find or create a dummy user to own this listing
  let user = await prisma.user.findFirst({ where: { email: 'farmer@test.com' }})
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Farmer',
        email: 'farmer@test.com',
        role: 'FARMER'
      }
    })
  }

  // Create the listing
  await prisma.listing.create({
    data: {
      cropName: cropName,
      quantity: parseFloat(quantity),
      unit: 'kg',             // Defaulting to kg for now
      pricePerUnit: parseFloat(price),
      userId: user.id,
    },
  })

  // 4. Refresh the page so the new data shows up
  revalidatePath('/dashboard')
}