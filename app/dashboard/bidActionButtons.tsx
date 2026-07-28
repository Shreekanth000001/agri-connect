"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BidActionButtons({ bidId, aucId }: { bidId: number, aucId: number }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleAction = async (actionType: 'ACCEPT' | 'REJECT') => {
        // Optional: Add a confirmation dialog for safety
        if (actionType === 'ACCEPT' && !confirm("Are you sure you want to accept this bid? This will close the auction and reject all other bids.")) {
            return;
        }

        setIsPending(true);
        try {
            const res = await fetch('/api/bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bidId, aucId, actionType })
            });
            
            const data = await res.json();

            if (res.ok && data.success) {
                if (actionType === 'ACCEPT') {
                    const chatUrl = data.conversationId ? `/chat?id=${data.conversationId}` : '/chat';
                    router.push(chatUrl);
                } else {
                    router.refresh();
                }
            } else {
                alert(data.error || "Failed to process action.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Network error. Please try again.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleAction('REJECT')}
                disabled={isPending}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "..." : "Reject"}
            </button>
            <button
                onClick={() => handleAction('ACCEPT')}
                disabled={isPending}
                className="px-4 py-2 text-sm font-bold text-white bg-[#009C25] hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "..." : "Accept"}
            </button>
        </div>
    );
}

export function CloseAuctionButton({ aucId }: { aucId: number }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleClose = async () => {
        if (!confirm("Are you sure you want to close this auction?")) return;
        setIsPending(true);
        try {
            const res = await fetch('/api/bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aucId, actionType: 'CLOSE_AUCTION' })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                router.refresh();
            } else {
                alert(data.error || "Failed to close auction.");
            }
        } catch {
            alert("Network error.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleClose}
            disabled={isPending}
            className="px-3 py-1 text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
        >
            {isPending ? "Closing..." : "Close Auction"}
        </button>
    );
}