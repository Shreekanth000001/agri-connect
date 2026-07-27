"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/app/ui/ProductCard";
import { ProductAuctionItem } from "@/lib/definitions";
import { fetchProducts } from "@/lib/api/productService";

const CATEGORIES = ["All", "Vegetables", "Fruits", "Grains", "Pulses", "Spices"];

export default function Home() {
  const [data, setData] = useState<ProductAuctionItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRetryLoading = async () => {
    setIsLoading(true);
    setError(null);
    const categoryParam = selectedCategory === "All" ? undefined : selectedCategory;
    const res = await fetchProducts({ category: categoryParam, page: currentPage, limit: 12 });

    if (res.data) {
      setData(res.data.items);
      setTotalPages(res.data.totalPages || 1);
    } else {
      try {
        const localRes = await fetch(`/productsroute${categoryParam ? `?category=${encodeURIComponent(categoryParam)}` : ''}`);
        if (localRes.ok) {
          const items = await localRes.json();
          setData(items);
        } else {
          setError(res.error || "Failed to load produce listings");
        }
      } catch {
        setError(res.error || "Failed to connect to marketplace service");
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setError(null);
      const categoryParam = selectedCategory === "All" ? undefined : selectedCategory;
      const res = await fetchProducts({ category: categoryParam, page: currentPage, limit: 12 });

      if (!isMounted) return;

      if (res.data) {
        setData(res.data.items);
        setTotalPages(res.data.totalPages || 1);
      } else {
        try {
          const localRes = await fetch(`/productsroute${categoryParam ? `?category=${encodeURIComponent(categoryParam)}` : ''}`);
          if (localRes.ok && isMounted) {
            const items = await localRes.json();
            setData(items);
          } else if (isMounted) {
            setError(res.error || "Failed to load produce listings");
          }
        } catch {
          if (isMounted) setError(res.error || "Failed to connect to marketplace service");
        }
      }
      if (isMounted) setIsLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, currentPage]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="grow min-h-[80vh] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Marketplace Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Marketplace</h1>
            <h2 className="text-xl font-semibold text-[#009C25] mt-1">Direct Farmer Produce Auctions</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 md:mt-0 flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#009C25] text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content State Handling */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 space-y-3 border border-gray-100 shadow-xs">
                <div className="h-44 bg-gray-200 rounded-xl w-full"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-full pt-2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-red-100 p-8 shadow-xs">
            <p className="text-red-600 font-bold text-base mb-2">{error}</p>
            <p className="text-xs text-gray-500 mb-4">Ensure FastAPI backend is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}</p>
            <button
              onClick={handleRetryLoading}
              className="px-4 py-2 bg-[#009C25] text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              Retry Loading
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-500 shadow-xs">
            <p className="text-base font-semibold text-gray-800 mb-1">No active produce listings in this category.</p>
            <p className="text-xs text-gray-400">Check back soon for new farmer harvest auctions.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
              {data.map((item) => (
                <ProductCard key={item.ProdAucId} product={item} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &larr; Previous
                </button>
                <span className="text-xs font-semibold text-gray-600 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}