import * as z from 'zod';
 
export const SignupFormSchema = z.object({
  uid: z
    .number(),
  uname: z
    .string(),
})
 
export type FormState = {
  userDetails: {
    uid?: number;
    uname?: string;
  };
  expiresAt: Date;
};

export interface UserSession {
  uid: number;
  uname: string;
  uloc?: string;
}

export interface ProductAuctionItem {
  ProdAucId: number;
  fid?: number;
  title: string;
  description?: string;
  startingBid: number;
  startTime: string;
  endTime: string;
  auctionStatus?: 'OPEN' | 'CLOSED' | 'CANCELLED';
  category?: string;
  imageUrl?: string[];
  farmerName?: string;
  farmerLocation?: string;
  location?: string;
  CreatedAt?: string;
}