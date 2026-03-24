import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  // In Next.js 15, searchParams must be treated as a Promise
  searchParams: Promise<{ q?: string }>;
}) {
  // Await the search parameters to extract the query
  const params = await searchParams;
  const query = params.q || '';

  // 1. If the user just goes to /search without typing anything
  if (!query) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Agri-Connect</h1>
        <p>Enter a product name or description in the search bar above.</p>
      </div>
    );
  }

  // 2. Query the database for matching products
  const products = await prisma.productAuction.findMany({
    where: {
      // The OR array lets us search multiple fields at once
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      CreatedAt: 'desc', // Show newest products first
    },
  });

  // 3. Render the UI
  return (
    <div className="bg-white min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-5 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Search Results for <span className="text-[#009C25]">"{query}"</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">Found {products.length} active auctions</p>
        </div>

        {/* Empty State (If nothing matches) */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">We couldn't find anything matching "{query}". Try adjusting your spelling or using a broader term.</p>
            <div className="mt-6">
              <Link href="/" className="text-[#009C25] font-semibold hover:underline">
                &larr; Back to all products
              </Link>
            </div>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <Link key={product.ProdAucId} href={`/product?id=${product.ProdAucId}`} className="group relative flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                
                {/* Image Container */}
                <div className="aspect-square w-full bg-gray-100 overflow-hidden relative">
                  <img
                    // Safely grab the first image, or use a gray placeholder if the array is empty
                    src={product.imageUrl?.[0] || 'https://via.placeholder.com/400?text=No+Image'}
                    alt={product.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                    {product.category}
                  </div>
                </div>

                {/* Details Container */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  
                  {/* Price & Action Button */}
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Starting Bid</p>
                      <p className="text-xl font-black text-gray-900">₹{product.startingBid}</p>
                    </div>
                    <span className="text-sm font-bold text-white bg-[#009C25] px-4 py-2 rounded-lg group-hover:bg-green-700 transition-colors shadow-sm">
                      Bid Now
                    </span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}