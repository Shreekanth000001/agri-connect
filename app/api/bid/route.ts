import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { bidId, aucId, actionType } = body;

        if (!bidId || !aucId || !actionType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (actionType === 'ACCEPT') {
            // 1. Accept this bid
            await prisma.bidId.update({ where: { bidId }, data: { status: 'ACCEPTED' } });
            
            // 2. Reject all other pending bids
            await prisma.bidId.updateMany({
                where: { aucId, bidId: { not: bidId }, status: 'PENDING' },
                data: { status: 'REJECTED' }
            });

            // 3. Close the auction
            await prisma.productAuction.update({
                where: { ProdAucId: aucId },
                data: { auctionStatus: 'CLOSED' }
            });
        } else if (actionType === 'REJECT') {
            // Just reject this bid
            await prisma.bidId.update({ where: { bidId }, data: { status: 'REJECTED' } });
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Bid action error:", error);
        return NextResponse.json({ error: "Failed to process bid action." }, { status: 500 });
    }
}