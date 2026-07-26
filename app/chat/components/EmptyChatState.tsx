"use client";

import Link from 'next/link';

interface EmptyChatStateProps {
  title?: string;
  description?: string;
  showExploreButton?: boolean;
}

export default function EmptyChatState({
  title = "No Active Negotiation Selected",
  description = "Select a negotiation conversation from the sidebar to view messages, place price proposals, and communicate directly with farmers and buyers.",
  showExploreButton = true,
}: EmptyChatStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/60 min-h-[500px]">
      <div className="w-20 h-20 bg-green-50 text-[#009C25] rounded-3xl flex items-center justify-center mb-5 border border-green-100 shadow-xs">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {showExploreButton && (
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-[#009C25] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <span>Explore Produce Marketplace</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      )}
    </div>
  );
}
