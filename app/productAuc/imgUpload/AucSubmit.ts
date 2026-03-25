"use server"
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Category } from '@prisma/client';

export default async function AucFormSubmit(formData: FormData) {
    try {
        const fid = Number(formData.get('uid'));
        const title = String(formData.get('title'));
        const description = String(formData.get('description'));
        const startingBid = Number(formData.get('startingBid'));
        
        const rawStartTime = String(formData.get('startTime'));
        const rawEndTime = String(formData.get('endTime'));
        const category = String(formData.get('category')) as Category;
        const rawimageUrl = String(formData.get('imageUrl'));

        // 1. Safety Check: Ensure dates were actually filled out
        if (!rawStartTime || !rawEndTime || rawStartTime === "null" || rawEndTime === "null") {
            throw new Error("Start time and End time are required.");
        }

        const startTime = new Date(rawStartTime);
        const endTime = new Date(rawEndTime);

        // 2. Safely parse the Cloudinary URLs
        let imageUrl: string[] = [];
        if (rawimageUrl && rawimageUrl !== "undefined") {
            imageUrl = JSON.parse(rawimageUrl);
        }

        // 3. Create the Auction
        const result = await prisma.productAuction.create({
            data: {
                fid: fid, // Assigned directly!
                title: title,
                description: description,
                startingBid: startingBid,
                startTime: startTime,
                endTime: endTime,
                category: category,
                imageUrl: imageUrl,
            }
        });
        
        console.log("✅ New Auction Created:", result.ProdAucId);

    } catch (error) {
        console.error("❌ Auction Creation Error:", error);
        // In Server Actions, returning the error lets the frontend know it failed
        throw new Error("Failed to create auction. Please check your inputs.");
    }

    // 4. Redirect MUST be outside the try/catch block!
    redirect('/');
}