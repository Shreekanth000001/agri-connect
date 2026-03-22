import { prisma } from '@/lib/prisma';
import Link from "next/link";
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
  const [lat1, lon1] = loc1.split(' ').map(Number);
  const [lat2, lon2] = loc2.split(' ').map(Number);

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
                <div className="flex rounded-lg shadow-sm">
                  {/* Currency Prefix */}
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-white px-4 text-gray-500 font-semibold sm:text-sm">
                    ₹
                  </span>
                  <input 
                    id='bid' 
                    type='number' 
                    placeholder={String(proddata.startingBid + 10)} 
                    className="block w-full min-w-0 flex-1 border-gray-300 border px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#009C25] focus:ring-[#009C25] sm:text-base outline-0" 
                  />
                  <button className="relative -ml-px inline-flex items-center space-x-2 rounded-r-lg border border-transparent bg-[#009C25] px-8 py-3 text-sm font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#009C25] focus:ring-offset-2 transition-colors">
                    Bid
                  </button>
                </div>
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