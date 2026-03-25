"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import Next.js router

export default function BidForm({ aucId, farmerId, startingBid, buyerId, existingBidAmt }: { aucId: number, farmerId: number, startingBid: number, buyerId: number | null , existingBidAmt?: number }) {
    const [bidAmt, setBidAmt] = useState<number | ''>(''); 
    const [isPending, setIsPending] = useState(false);
    const router = useRouter(); // Allows us to refresh the page safely

    if (!buyerId) {
        return <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-200">You must be logged in to place a bid.</p>;
    }

    // 2. UX UPGRADE: If they already bid, hide the form and show their bid!
    if (existingBidAmt) {
        return (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-green-800">You have already placed a bid!</p>
                    <p className="text-xs text-green-600 mt-1">We will notify you if the farmer accepts.</p>
                </div>
                <div className="text-xl font-black text-green-700">₹{existingBidAmt}</div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        
        // 1. Give the user clear feedback!
        if (!bidAmt) {
            alert("Please enter a bid amount.");
            return;
        }
        if (bidAmt <= startingBid) {
            alert(`Your bid must be higher than the starting bid of ₹${startingBid}`);
            return;
        }

        setIsPending(true); 

        try {
            // 2. Relative path pointing exactly to where your route.ts lives
            const response = await fetch('/product/bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aucId: aucId,
                    fid: farmerId,
                    cid: buyerId,
                    bidAmount: bidAmt
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setBidAmt(''); 
                alert("Bid successfully placed!");
                router.refresh(); 
            } else {
                alert("Error: " + (data.error || data.message || "Failed to place bid."));
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Failed to connect to the server. Please check your internet connection.");
        } finally {
            setIsPending(false); 
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-white px-4 text-gray-500 font-semibold sm:text-sm">
                    ₹
                </span>
                
                <input 
                    name='bidAmount'
                    id='bid' 
                    type='number' 
                    placeholder={String(startingBid + 10)} 
                    value={bidAmt}
                    onChange={(e) => setBidAmt(e.target.value ? Number(e.target.value) : '')}
                    required
                    disabled={isPending}
                    className="block w-full min-w-0 flex-1 border-gray-300 border px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#009C25] focus:ring-[#009C25] sm:text-base outline-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] disabled:bg-gray-100" 
                />
                
                <button 
                    type="submit"
                    disabled={isPending}
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-lg border border-transparent bg-[#009C25] px-8 py-3 text-sm font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#009C25] focus:ring-offset-2 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                    {isPending ? "Submitting..." : "Bid"}
                </button>
            </div>
        </form>
    );
}