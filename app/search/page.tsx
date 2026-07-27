import Link from 'next/link';
import ProductCard from '@/app/ui/ProductCard';
import { searchProducts } from '@/lib/api/productService';
import { ProductAuctionItem } from '@/lib/definitions';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category;
  const page = Number(params.page) || 1;

  if (!query && !category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Agri-Connect</h1>
        <p>Enter a product name or category in the search bar above.</p>
      </div>
    );
  }

  const apiRes = await searchProducts(query, category, page, 12);
  const products: ProductAuctionItem[] = apiRes.data?.items || [];

  return (
    <div className="bg-white min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Search Results for <span className="text-[#009C25]">&quot;{query || category}&quot;</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500">Found {products.length} active produce listings</p>
          </div>

          <Link href="/" className="text-sm font-semibold text-[#009C25] hover:underline">
            &larr; View All Produce
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No produce found</h3>
            <p className="mt-1 text-sm text-gray-500">We couldn&apos;t find anything matching &quot;{query || category}&quot;. Try adjusting your term.</p>
            <div className="mt-6">
              <Link href="/" className="text-[#009C25] font-semibold hover:underline">
                &larr; Back to all products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.ProdAucId} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}