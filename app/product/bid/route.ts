import { NextResponse } from 'next/server';
import { getUserSession, getAccessToken } from '@/lib/session';
import { apiClient } from '@/lib/api/apiClient';

export async function POST(req: Request) {
  try {
    const session = await getUserSession();
    if (!session?.uid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to place a bid." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { aucId, fid, cid, bidAmount } = body;

    if (Number(cid) !== session.uid) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Session user mismatch." },
        { status: 403 }
      );
    }

    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await apiClient.post('/bids', {
      auction_id: Number(aucId),
      aucId: Number(aucId),
      fid: Number(fid),
      cid: session.uid,
      bidAmount: Number(bidAmount),
      amount: Number(bidAmount),
    }, headers);

    if (res.error) {
      return NextResponse.json(
        { success: false, message: res.error },
        { status: res.status || 400 }
      );
    }

    return NextResponse.json({ success: true, bid: res.data }, { status: 201 });
  } catch (error) {
    console.error("Bidding Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place bid. Please try again." },
      { status: 500 }
    );
  }
}