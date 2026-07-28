import BidForm from '@/app/product/ProdUI/BidForm';
import ContactFarmerButton from '@/app/product/ProdUI/ContactFarmerButton';
import { getUserSession } from '@/lib/session'; 
import MapWrapper from '@/app/product/MapWrapper';
import ImageGallery from '@/app/product/ProdUI/page';
import { fetchProductById } from '@/lib/api/productService';

// 1. Helpers moved OUTSIDE the component for better performance
function DateEm(date: Date | string | undefined | null) {
  if (!date) return "N/A";
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) return "N/A";
  return new Intl.DateTimeFormat('en-IN', { 
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  }).format(parsedDate);
}

function getDistanceKm(loc1: string, loc2: string) {
  if (!loc1 || !loc2) return null;
  
  // 1. Bulletproof parsing: handles spaces, commas, or both
  const [lat1Str, lon1Str] = loc1.split(/[,\s]+/).map(s => s.trim());
  const [lat2Str, lon2Str] = loc2.split(/[,\s]+/).map(s => s.trim());
  
  const lat1 = parseFloat(lat1Str);
  const lon1 = parseFloat(lon1Str);
  const lat2 = parseFloat(lat2Str);
  const lon2 = parseFloat(lon2Str);
  
  // 2. Safeguard against invalid coordinates
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return null;
  }
  
  const R = 6371; // Radius of the earth in km
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

  const apiRes = id ? await fetchProductById(id) : { data: undefined };
  const proddata = apiRes.data;

  if (!proddata) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center text-gray-500">
        <p>Auction produce listing not found.</p>
      </div>
    );
  }

  const fdata = {
    uid: proddata.fid || 0,
    uname: proddata.farmerName || `Farmer #${proddata.fid || 0}`,
    uloc: proddata.farmerLocation || proddata.location || 'India',
  };

  const session = await getUserSession();
  const buyerLoc = session?.uloc || null;
  const distance = buyerLoc ? getDistanceKm(fdata.uloc, buyerLoc) : null;

  return (
    <div className="bg-white min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* The Master 2-Column Grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
            
          {/* LEFT COLUMN: Image Gallery */}
          <div className="w-full">
            <ImageGallery images={Array.isArray(proddata.imageUrl) ? proddata.imageUrl : [proddata.imageUrl || '/agri-conn-logo.png']} />
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
              <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <label htmlFor='bid' className='block text-sm font-bold text-gray-900 mb-2'>Place Your Bid</label>
                  
                  <BidForm 
                    aucId={proddata.ProdAucId} 
                    farmerId={proddata.fid || 0} 
                    startingBid={proddata.startingBid} 
                    buyerId={session?.uid || null} 
                    existingBidAmt={undefined} 
                  />
                  
                  <p className="mt-2 text-xs text-gray-500">Enter an amount higher than the current bid.</p>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-4">
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700 block">Have questions or want to negotiate terms?</span>
                    <span>Chat directly with farmer ({fdata.uname}) before bidding.</span>
                  </div>

                  <ContactFarmerButton
                    aucId={proddata.ProdAucId}
                    farmerId={proddata.fid || 0}
                    buyerId={session?.uid || null}
                  />
                </div>
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