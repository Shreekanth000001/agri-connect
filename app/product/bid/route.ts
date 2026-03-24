// app/api/bid/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // 1. Grab the JSON payload sent from the browser
        const body = await req.json();
        const { aucId, fid, cid, bidAmount } = body;

        // Security check
        if (!cid) {
            return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
        }

        // 2. Save to database
        const result = await prisma.bidId.create({
            data: {
                bidAmount: Number(bidAmount),
                user_cid: { connect: { uid: Number(cid) } },
                user_fid: { connect: { uid: Number(fid) } },
                auc_bid: { connect: { ProdAucId: Number(aucId) } }
            }
        });

        console.log("Database Save Successful:", result.bidId);

        // 3. Return a clean, standard HTTP response
        return NextResponse.json({ success: true, message: "Bid placed!" }, { status: 200 });

    } catch (error) {
        console.error("API ROUTE ERROR:", error);
        return NextResponse.json({ success: false, message: "Database Error" }, { status: 500 });
    }
}