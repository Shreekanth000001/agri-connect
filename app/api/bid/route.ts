import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/session';
import { apiClient } from '@/lib/api/apiClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bidId, aucId, actionType } = body;

    if (!actionType) {
      return NextResponse.json({ error: "Missing action type" }, { status: 400 });
    }

    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (actionType === 'ACCEPT') {
      if (!bidId) return NextResponse.json({ error: "Missing bidId" }, { status: 400 });
      const res = await apiClient.patch<{ conversation?: { id: number } }>(`/bids/${bidId}/accept`, {}, headers);
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: res.status || 400 });
      }
      const conversationId = res.data?.conversation?.id;
      return NextResponse.json({ success: true, conversationId }, { status: 200 });
    } else if (actionType === 'REJECT') {
      if (!bidId) return NextResponse.json({ error: "Missing bidId" }, { status: 400 });
      const res = await apiClient.patch(`/bids/${bidId}/reject`, {}, headers);
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: res.status || 400 });
      }
      return NextResponse.json({ success: true }, { status: 200 });
    } else if (actionType === 'CLOSE_AUCTION') {
      if (!aucId) return NextResponse.json({ error: "Missing aucId" }, { status: 400 });
      const res = await apiClient.patch(`/auctions/${aucId}/close`, {}, headers);
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: res.status || 400 });
      }
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Bid action error:", error);
    return NextResponse.json({ error: "Action processing failed" }, { status: 500 });
  }
}