"use client";

import Link from "next/link";
import { useFormatter } from 'next-intl';
import { ProductAuctionItem } from '@/lib/definitions';

interface ProductCardProps {
  product: ProductAuctionItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const format = useFormatter();

  const formatDate = (dateStr: string) => {
    try {
      const dateTime = new Date(dateStr);
      return format.dateTime(dateTime, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const thumbnail = product.imageUrl?.[0] || '/agri-conn-logo.png';

  return (
    <div 
      className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Image Container */}
      <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={thumbnail}
          alt={product.title}
          loading="lazy"
        />
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#009C25] font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm border border-gray-200/50">
            {product.category}
          </span>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-[#009C25] transition-colors">
          {product.title}
        </h3>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-black text-2xl text-[#009C25]">₹{product.startingBid}</span>
          <span className="text-xs font-medium text-gray-500">/kg starting</span>
        </div>

        <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
          <p className="flex justify-between">
            <span className="font-medium text-gray-600">Starts:</span>
            <span className="font-semibold text-gray-800">{formatDate(product.startTime)}</span>
          </p>
          <p className="flex justify-between">
            <span className="font-medium text-gray-600">Ends:</span>
            <span className="font-semibold text-gray-800">{formatDate(product.endTime)}</span>
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-5 w-full">
          <Link 
            href={`/product?id=${product.ProdAucId}`} 
            className="w-full bg-[#009C25] hover:bg-green-700 active:bg-green-800 text-white font-bold py-2.5 rounded-xl flex items-center justify-center transition-all shadow-sm group-hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Auction
          </Link>
        </div>
      </div>
    </div>
  );
}
