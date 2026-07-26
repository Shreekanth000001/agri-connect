import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

export async function POST(req: Request) {
    try {
        // 1. AUTH GUARD: Verify user session server-side
        const session = await getUserSession();
        if (!session?.uid) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in to place a bid." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { aucId, fid, cid, bidAmount } = body;

        // Ensure user is placing bid for themselves
        if (Number(cid) !== session.uid) {
            return NextResponse.json(
                { success: false, message: "Forbidden. Session user mismatch." },
                { status: 403 }
            );
        }

        // 2. SECURITY CHECK: Did this user already bid on this specific auction?
        const existingBid = await prisma.bidId.findFirst({
            where: {
                aucId: Number(aucId),
                cid: session.uid
            }
        });

        if (existingBid) {
            return NextResponse.json(
                { success: false, message: "You have already placed a bid on this product." }, 
                { status: 400 }
            );
        }

        // 3. Create the new bid with validated session uid
        const newBid = await prisma.bidId.create({
            data: {
                aucId: Number(aucId),
                fid: Number(fid),
                cid: session.uid,
                bidAmount: Number(bidAmount),
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, bid: newBid }, { status: 201 });

    } catch (error) {
        console.error("Bidding Error:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}