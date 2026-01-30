"use server"
import { prisma } from '@/lib//prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function createListing(formData: FormData) {
  // const file = formData.get('image') as File;
  
  // // 1. Convert file to Buffer for Cloudinary
  // const arrayBuffer = await file.arrayBuffer();
  // const buffer = new Uint8Array(arrayBuffer);
  
  // // 2. Upload to Cloudinary
  // const uploadResult: any = await new Promise((resolve, reject) => {
  //   cloudinary.uploader.upload_stream({}, (error, result) => {
  //     if (error) reject(error);
  //     else resolve(result);
  //   }).end(buffer);
  // });

  // const finalVideoUrl = uploadResult.secure_url; // "https://res.cloudinary..."

  // 3. Save to Prisma (WE ONLY SAVE THE TEXT URL)
  // await prisma.productAuction.create({
  //   data: {
  //     // ... other fields ...
  //     imageUrl: finalVideoUrl, 
  //   },
  // });
}

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
}