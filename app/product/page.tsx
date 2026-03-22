import { prisma } from '@/lib//prisma';
import Link from "next/link";
import { getUserSession } from '@/lib/session'; 
import MapWrapper from '@/app/product/MapWrapper';

export default async function Home({ searchParams }: { searchParams: Promise<{ id: string | undefined }> }) {
  const param = await searchParams;
  const id = param.id;

  const proddata = await prisma.productAuction.findUnique({ where: { ProdAucId: Number(id) } });
  if (!proddata) {
    return (<p>ntg yo</p>)
  }

  const fdata = await prisma.user.findUnique({ where: { uid: Number(proddata?.fid) } });
  if (!fdata) {
    return (<p>ntg yo</p>)
  }

  function DateEm(date: Date | undefined | null) {
    if (!date) {
      return "yo u are doomed"
    }
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date)
  }

  const session = await getUserSession();
  let buyerLoc = null;
  let distance = null;

  if (session?.uid) {
    const buyerData = await prisma.user.findUnique({ where: { uid: session.uid } });
    if (buyerData?.uloc) {
      buyerLoc = buyerData.uloc;
      // Calculate the distance on the server!
      distance = getDistanceKm(fdata.uloc, buyerLoc);
    }
  }

  // Add this helper function outside your main component
  function getDistanceKm(loc1: string, loc2: string) {
    if (!loc1 || !loc2) return null;

    const [lat1, lon1] = loc1.split(' ').map(Number);
    const [lat2, lon2] = loc2.split(' ').map(Number);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1); // Returns a string like "12.5" km
  }

  return (
    <div className="grow min-h-[65vh] bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        
        {/* Your existing product details layout */}
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">{proddata.title}</h2>
        <p className="mt-2 text-lg text-gray-500">{proddata.description}</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Map Section */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold">Location</h3>
                
                {/* Only show distance if we successfully calculated it */}
                {distance && (
                    <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
                        📍 This farm is approximately **{distance} km** away from your registered location.
                    </div>
                )}
                
                <MapWrapper farmerLoc={fdata.uloc} buyerLoc={buyerLoc} />
            </div>

            {/* Bidding Section (Placeholder for your UI) */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Starting Bid</p>
                <p className="text-3xl font-bold text-gray-900">₹{proddata.startingBid}</p>
                <p className="mt-4 text-sm text-gray-500">Auction ends: {DateEm(proddata.endTime)}</p>
                {/* Add your bidding form here later */}
            </div>
        </div>

      </div>
    </div>
  );
}