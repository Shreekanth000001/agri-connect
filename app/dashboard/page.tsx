import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BidActionButtons from '@/app/dashboard/bidActionButtons';
import { apiClient } from '@/lib/api/apiClient';

function formatDate(dateInput: Date | string) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

interface FarmerAuction {
  ProdAucId: number;
  title: string;
  startingBid: number;
  endTime: string;
  auctionStatus: string;
  auc_bid: Array<{
    bidId: number;
    bidAmount: number;
    bidTime: string;
    status: string;
    user_cid: { uname: string };
  }>;
}

interface BuyerBid {
  bidId: number;
  aucId: number;
  bidAmount: number;
  bidTime: string;
  status: string;
  auc_bid: {
    title: string;
    user_fid: { uname: string };
  };
}

export default async function DashboardPage() {
  const session = await getUserSession();
  if (!session?.uid) redirect('/auth/login');

  const user = {
    uid: session.uid,
    uname: session.uname,
    role: session.uname.toLowerCase().includes('farmer') ? 'FARMER' : 'BUYER',
  };

  if (user.role === 'FARMER') {
    const res = await apiClient.get<FarmerAuction[]>('/dashboard/farmer');
    const myAuctions: FarmerAuction[] = res.data || [];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Farmer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your active listings and incoming bids.</p>
          </div>
          <Link href="/productAuc" className="bg-[#009C25] hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors">
            + New Auction
          </Link>
        </div>

        {myAuctions.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500">You haven&apos;t listed any products yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {myAuctions.map((auction) => (
              <div key={auction.ProdAucId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className={`px-6 py-4 border-b flex justify-between items-center ${auction.auctionStatus === 'CLOSED' ? 'bg-gray-100 border-gray-200' : 'bg-green-50 border-green-100'}`}>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{auction.title}</h2>
                    <p className="text-sm text-gray-600">Starting Bid: ₹{auction.startingBid} | Ends: {formatDate(auction.endTime)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${auction.auctionStatus === 'CLOSED' ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-800'}`}>
                    {auction.auctionStatus}
                  </span>
                </div>

                <div className="px-6 py-4">
                  {auction.auc_bid.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No bids yet.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {auction.auc_bid.map((bid) => (
                        <li key={bid.bidId} className="py-4 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-lg text-gray-900">₹{bid.bidAmount}</p>
                            <p className="text-sm text-gray-500">Bid by: {bid.user_cid.uname} • {formatDate(bid.bidTime)}</p>
                          </div>
                          
                          <div>
                            {bid.status === 'PENDING' && auction.auctionStatus === 'OPEN' ? (
                              <BidActionButtons bidId={bid.bidId} aucId={auction.ProdAucId} />
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                                bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {bid.status}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    const res = await apiClient.get<BuyerBid[]>('/dashboard/buyer');
    const myBids: BuyerBid[] = res.data || [];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Bids & Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Track the status of your offers.</p>
        </div>

        {myBids.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">You haven&apos;t placed any bids yet.</p>
            <Link href="/" className="text-[#009C25] font-bold hover:underline">Browse Market</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {myBids.map((bid) => (
                <li key={bid.bidId} className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gray-50 transition-colors">
                  <div className="mb-4 sm:mb-0">
                    <Link href={`/product?id=${bid.aucId}`} className="text-xl font-bold text-gray-900 hover:text-[#009C25] transition-colors">
                      {bid.auc_bid.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">Farmer: {bid.auc_bid.user_fid.uname}</p>
                    <p className="text-xs text-gray-400 mt-1">Placed on {formatDate(bid.bidTime)}</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Your Offer</p>
                      <p className="text-2xl font-black text-gray-900">₹{bid.bidAmount}</p>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border ${
                      bid.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      bid.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {bid.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}