import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function FarmerDashboard() {
    // 1. Secure the page - ensure only logged-in users can see this
    const session = await getUserSession();
    if (!session?.uid) {
        redirect('/auth/login');
    }

    const farmerId = session.uid;

    // 2. Fetch all products belonging to this specific farmer
    // We 'include' the auc_bid relation so we can count bids and find the highest offer
    const myProducts = await prisma.productAuction.findMany({
        where: { fid: farmerId },
        include: { 
            auc_bid: true 
        },
        orderBy: { CreatedAt: 'desc' }
    });

    // 3. Calculate Dashboard Metrics
    const totalAuctions = myProducts.length;
    const activeAuctions = myProducts.filter(p => p.auctionStatus === 'OPEN').length;
    const totalBidsReceived = myProducts.reduce((total, product) => total + product.auc_bid.length, 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">My Farm Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your auctions and track incoming bids.</p>
                    </div>
                    <Link 
                        href="/product/new" 
                        className="inline-flex items-center justify-center rounded-lg bg-[#009C25] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#009C25] focus:ring-offset-2 transition-colors"
                    >
                        + Create New Auction
                    </Link>
                </div>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                    <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Active Auctions</dt>
                        <dd className="mt-2 text-4xl font-black text-gray-900">{activeAuctions}</dd>
                    </div>
                    <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Total Auctions</dt>
                        <dd className="mt-2 text-4xl font-black text-gray-900">{totalAuctions}</dd>
                    </div>
                    <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Total Bids Received</dt>
                        <dd className="mt-2 text-4xl font-black text-[#009C25]">{totalBidsReceived}</dd>
                    </div>
                </div>

                {/* Products Table/List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Your Listings</h3>
                    </div>
                    
                    {myProducts.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 mb-4">You haven't posted any products yet.</p>
                            <Link href="/product/new" className="text-[#009C25] font-semibold hover:underline">
                                Start your first auction &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Starting Bid</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Highest Bid</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {myProducts.map((product) => {
                                        // Calculate the highest bid for this specific product
                                        const highestBid = product.auc_bid.length > 0 
                                            ? Math.max(...product.auc_bid.map(b => b.bidAmount)) 
                                            : 0;

                                        return (
                                            <tr key={product.ProdAucId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                            <img 
                                                                src={product.imageUrl?.[0] || 'https://via.placeholder.com/40'} 
                                                                alt={product.title} 
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-900">{product.title}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        product.auctionStatus === 'OPEN' ? 'bg-green-100 text-green-800' : 
                                                        product.auctionStatus === 'CLOSED' ? 'bg-gray-100 text-gray-800' : 
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.auctionStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ₹{product.startingBid}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {highestBid > 0 ? `₹${highestBid}` : 'No bids yet'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/product?id=${product.ProdAucId}`} className="text-[#009C25] hover:text-green-900 mr-4">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}