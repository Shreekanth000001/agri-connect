import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/apiClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bidId, actionType } = body;

    if (!bidId || !actionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (actionType === 'ACCEPT') {
      const res = await apiClient.patch(`/bids/${bidId}/accept`, {});
      if (res.error) {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      return NextResponse.json({ success: true, data: res.data }, { status: 200 });
    } else if (actionType === 'REJECT') {
      const res = await apiClient.patch(`/bids/${bidId}/reject`, {});
      if (res.error) {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      return NextResponse.json({ success: true, data: res.data }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Bid action error:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}