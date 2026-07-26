"use client"
import { useState, useEffect } from "react";
import ProductCard from "@/app/ui/ProductCard";
import { ProductAuctionItem } from "@/lib/definitions";

export default function Home() {
  const [data, setData] = useState<ProductAuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function bringData() {
    fetch('/productsroute')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    bringData();
  }, []);

  return (
    <div className="grow min-h-[80vh] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Marketplace</h1>
          <h2 className="text-xl font-semibold text-[#009C25] mt-1">Fresh Produce Auctions</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading fresh produce...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No active auctions right now.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
            {data.map((item) => (
              <ProductCard key={item.ProdAucId} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}