"use client"
import { useState, useEffect } from "react";
import { useFormatter } from 'next-intl';
import Link from "next/link";

export default function Home() {
  const format = useFormatter();
  const [data, setData] = useState([]);

  // 1. FIXED: Added a loading state so the screen doesn't look broken while fetching
  const [isLoading, setIsLoading] = useState(true);

  function bringData() {
    // 2. FIXED: Removed localhost:3000 so this works in production!
    // (Update this path if your route is inside an /api folder)
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

  function dateFormat(date: string) {
    const dateTime = new Date(date);
    return format.dateTime(dateTime, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
          <h2 className="text-xl font-semibold text-[#009C25] mt-1">Fresh Fruits</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading fresh produce...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No active auctions right now.</div>
        ) : (
          /* 3. FIXED: Added gap-6 and gap-y-10 for perfect spacing */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
            {
              data.map((item: any) =>
                /* 4. FIXED: Removed hardcoded w-56, used flex-col to push button to bottom */
                <div key={item.ProdAucId} className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">

                  {/* Image Container */}
                  <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={item.imageUrl?.[0] || '/agri-conn-logo.png'}
                      alt={item.title}
                    />
                  </div>

                  {/* Content Container */}
                  <div className="p-5 flex flex-col flex-1" >
                    <p className="font-bold text-lg text-gray-900 line-clamp-1">{item.title}</p>
                    <p className="font-black text-xl text-[#009C25] mt-1">₹{item.startingBid}<span className="text-sm font-medium text-gray-500">/kg</span></p>

                    <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-100">
                      <p><span className="font-semibold text-gray-700">Starts:</span> {dateFormat(item.startTime)}</p>
                      <p><span className="font-semibold text-gray-700">Ends:</span> {dateFormat(item.endTime)}</p>
                    </div>

                    {/* Button pushed to the bottom using mt-auto */}
                    <div className="mt-auto pt-5 w-full">
                      <Link href={`/product?id=${item.ProdAucId}`} className="w-full bg-[#009C25] hover:bg-green-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Auction
                      </Link>
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
  );
}