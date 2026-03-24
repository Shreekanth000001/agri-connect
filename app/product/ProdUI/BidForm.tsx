"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import Next.js router

export default function BidForm({ aucId, farmerId, startingBid, buyerId }: { aucId: number, farmerId: number, startingBid: number, buyerId: number | null }) {
    const [bidAmt, setBidAmt] = useState<number | ''>(''); 
    const [isPending, setIsPending] = useState(false);
    const router = useRouter(); // Allows us to refresh the page safely

    if (!buyerId) {
        return <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-200">You must be logged in to place a bid.</p>;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        if (!bidAmt || bidAmt <= startingBid) return;

        setIsPending(true); // Turn on the loading state on the button

        try {
            // 1. Talk directly to our new API route
            const response = await fetch('http://localhost:3000/product/bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aucId: aucId,
                    fid: farmerId,
                    cid: buyerId,
                    bidAmount: bidAmt
                })
            });

            // 2. Read the JSON response
            const data = await response.json();

            if (data.success) {
                setBidAmt(''); // Clear input
                alert("Bid successfully placed!");
                router.refresh(); // This safely updates the highest bid on the screen!
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Failed to connect to the server.");
        } finally {
            setIsPending(false); // Turn off loading state
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