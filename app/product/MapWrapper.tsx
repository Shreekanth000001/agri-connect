"use client";

import dynamic from 'next/dynamic';

// 1. We do the dynamic import HERE, inside the Client boundary.
const DisplayMap = dynamic(() => import('./DisplayMap'), { 
    ssr: false,
    loading: () => (
        <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center text-gray-500">
            Loading Map...
        </div>
    )
});

// 2. We pass the props through the wrapper down to the actual map
export default function MapWrapper({ farmerLoc, buyerLoc }: { farmerLoc: string, buyerLoc?: string | null }) {
  return <DisplayMap farmerLoc={farmerLoc} buyerLoc={buyerLoc} />;
}