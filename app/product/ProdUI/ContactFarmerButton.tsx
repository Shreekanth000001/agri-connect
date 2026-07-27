"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createConversation } from '@/lib/api/chatService';

interface ContactFarmerButtonProps {
  aucId: number;
  farmerId: number;
  buyerId: number | null;
}

export default function ContactFarmerButton({
  aucId,
  farmerId,
  buyerId,
}: ContactFarmerButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleContactFarmer = async () => {
    if (!buyerId) {
      router.push('/auth/login');
      return;
    }

    setIsPending(true);
    try {
      // Omit consumer_id so backend automatically assigns current_user.uid
      const res = await createConversation(aucId, farmerId);

      if (res.data && res.data.id) {
        // Navigate directly to negotiation chat using res.data.id
        router.push(`/chat?id=${res.data.id}`);
      } else if (res.error) {
        alert(`Failed to initiate negotiation: ${res.error}`);
      } else {
        router.push(`/chat?auctionId=${aucId}`);
      }
    } catch (err: unknown) {
      console.error("Error creating conversation:", err);
      alert("Failed to connect to the server. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleContactFarmer}
      disabled={isPending}
      className="inline-flex items-center justify-center space-x-2 rounded-lg border border-[#009C25] bg-white px-5 py-3 text-sm font-bold text-[#009C25] hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-[#009C25] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <span>{isPending ? "Connecting..." : "Contact Farmer"}</span>
    </button>
  );
}
