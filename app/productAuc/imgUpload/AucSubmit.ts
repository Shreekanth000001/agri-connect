"use server";

import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import { apiClient } from '@/lib/api/apiClient';

export default async function AucFormSubmit(formData: FormData) {
  try {
    const fid = Number(formData.get('uid'));
    const title = String(formData.get('title'));
    const description = String(formData.get('description'));
    const startingBid = Number(formData.get('startingBid'));

    const rawStartTime = String(formData.get('startTime'));
    const rawEndTime = String(formData.get('endTime'));
    const category = String(formData.get('category'));
    const rawimageUrl = String(formData.get('imageUrl'));

    if (!rawStartTime || !rawEndTime || rawStartTime === "null" || rawEndTime === "null") {
      throw new Error("Start time and End time are required.");
    }

    let imageUrl: string[] = [];
    if (rawimageUrl && rawimageUrl !== "undefined") {
      try {
        imageUrl = JSON.parse(rawimageUrl);
      } catch {
        imageUrl = [rawimageUrl];
      }
    }

    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await apiClient.post('/auctions', {
      farmer_id: fid,
      fid,
      title,
      name: title,
      description,
      starting_bid: startingBid,
      price: startingBid,
      startingBid,
      start_time: rawStartTime,
      end_time: rawEndTime,
      category,
      images: imageUrl,
      imageUrl,
    }, headers);
  } catch (error) {
    console.error("❌ Auction Creation Error:", error);
  }

  redirect('/');
}