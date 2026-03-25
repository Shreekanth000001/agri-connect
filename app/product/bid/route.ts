import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { aucId, fid, cid, bidAmount } = body;

        // 1. SECURITY CHECK: Did this user already bid on this specific auction?
        const existingBid = await prisma.bidId.findFirst({
            where: {
                aucId: aucId,
                cid: cid
            }
        });

        if (existingBid) {
            // Block the request and tell the frontend why
            return NextResponse.json(
                { success: false, message: "You have already placed a bid on this product." }, 
                { status: 400 }
            );
        }

        // 2. If no existing bid, create the new one
        const newBid = await prisma.bidId.create({
            data: {
                aucId: aucId,
                fid: fid,
                cid: cid,
                bidAmount: bidAmount,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, bid: newBid }, { status: 201 });

    } catch (error) {
        console.error("Bidding Error:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}