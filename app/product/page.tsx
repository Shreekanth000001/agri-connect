import { prisma } from '@/lib/prisma';
import Link from "next/link";
import BidForm from '@/app/product/ProdUI/BidForm'
import { getUserSession } from '@/lib/session'; 
import MapWrapper from '@/app/product/MapWrapper';
import ImageGallery from '@/app/product/ProdUI/page';

// 1. Helpers moved OUTSIDE the component for better performance
function DateEm(date: Date | undefined | null) {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat('en-IN', { 
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  }).format(date);
}

function getDistanceKm(loc1: string, loc2: string) {
  if (!loc1 || !loc2) return null;
  
  // 1. Bulletproof parsing: handles spaces, commas, or both
  const [lat1, lon1] = loc1.replace(',', ' ').split(/\s+/).map(Number);
  const [lat2, lon2] = loc2.replace(',', ' ').split(/\s+/).map(Number);

  // 2. Safety check: If for some reason the DB string is totally broken, don't crash the page
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;

  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return (R * c).toFixed(1);
}

export default async function Home({ searchParams }: { searchParams: Promise<{ id: string | undefined }> }) {
  const param = await searchParams;
  const id = param.id;
  let userExistingBid = null;

  const proddata = await prisma.productAuction.findUnique({ where: { ProdAucId: Number(id) } });
  if (!proddata) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center text-gray-500">
        <p>Auction not found.</p>
      </div>
    );
  }

  const fdata = await prisma.user.findUnique({ where: { uid: Number(proddata?.fid) } });
  if (!fdata) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center text-gray-500">
        <p>Farmer details not found.</p>
      </div>
    );
  }

  const session = await getUserSession();
  let buyerLoc = null;
  let distance = null;

  if (session?.uid) {
    const buyerData = await prisma.user.findUnique({ where: { uid: session.uid } });
    if (buyerData?.uloc) {
      buyerLoc = buyerData.uloc;
      distance = getDistanceKm(fdata.uloc, buyerLoc);
    }
  }
  userExistingBid = await prisma.bidId.findFirst({
        where: { aucId: Number(id), cid: session?.uid }
    });

  return (
    <div className="bg-white min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* The Master 2-Column Grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
            
          {/* LEFT COLUMN: Image Gallery */}
          <div className="w-full">
            <ImageGallery images={proddata.imageUrl} />
          </div>

          {/* RIGHT COLUMN: Details & Action */}
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            
            {/* Header section */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {proddata.title}
              </h1>
              <p className="mt-4 text-base text-gray-600">
                {proddata.description}
              </p>
            </div>

            {/* Bidding Section */}
            <div className="py-6 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Starting Bid</p>
              <div className="mt-2 flex items-baseline gap-4">
                <p className="text-4xl font-black text-gray-900">₹{proddata.startingBid}</p>
              </div>
              <p className="mt-3 text-sm font-medium text-red-600 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ends: {DateEm(proddata.endTime)}
              </p>

              {/* Unified Input & Button Group */}
              <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
    <label htmlFor='bid' className='block text-sm font-bold text-gray-900 mb-2'>Place Your Bid</label>
    
    {/* Drop the Client Component right here! */}
    <BidForm 
    aucId={proddata.ProdAucId} 
    farmerId={proddata.fid} 
    startingBid={proddata.startingBid} 
    buyerId={session?.uid || null} 
    existingBidAmt={userExistingBid?.bidAmount} 
/>
    
    <p className="mt-2 text-xs text-gray-500">Enter an amount higher than the current bid.</p>
</div>
            </div>

            {/* Map Section */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pickup Location</h3>
              
              {distance && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800 border border-green-200">
                  <span>📍 This farm is approximately <strong>{distance} km</strong> away from your registered location.</span>
                </div>
              )}
              
              <div className="h-64 w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <MapWrapper farmerLoc={fdata.uloc} buyerLoc={buyerLoc} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}