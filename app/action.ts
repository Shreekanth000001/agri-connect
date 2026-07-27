"use server";

import { v2 as cloudinary } from 'cloudinary';
import { apiClient } from '@/lib/api/apiClient';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function createListing() {
  return { success: true };
}

export async function buttonAct() {
  await apiClient.post('/bids', {
    aucId: 1,
    cid: 2,
    fid: 1,
    bidAmount: 150,
  });
}

export async function buttonAct2() {
  await apiClient.post('/auctions', {
    fid: 1,
    title: 'Apple',
    description: 'Kashmir Apple',
    startingBid: 100,
  });
}