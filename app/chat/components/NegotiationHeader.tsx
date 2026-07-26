"use client";

import Link from 'next/link';
import { Conversation } from '../types';

interface NegotiationHeaderProps {
  conversation: Conversation;
  onBackMobile: () => void;
}

export default function NegotiationHeader({
  conversation,
  onBackMobile,
}: NegotiationHeaderProps) {
  return (
    <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-xs z-10">
      <div className="flex items-center space-x-3 min-w-0">
        {/* Mobile Back Button */}
        <button
          onClick={onBackMobile}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Back to conversations"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Thumbnail */}
        <img
          src={conversation.productImage}
          alt={conversation.productTitle}
          className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
        />

        {/* Participant & Produce Info */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-gray-900 truncate">
              {conversation.participantName}
            </h3>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
              {conversation.participantRole}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
            <span>📍 {conversation.participantLocation}</span>
            <span>•</span>
            <span className="font-semibold text-[#009C25]">{conversation.productTitle}</span>
          </p>
        </div>
      </div>

      {/* Action Link to Product Auction Detail */}
      <Link
        href={`/product?id=${conversation.auctionId}`}
        className="hidden sm:flex items-center space-x-1 text-xs font-bold text-[#009C25] bg-green-50 hover:bg-green-100 px-3 py-2 rounded-xl border border-green-200 transition-colors shrink-0"
      >
        <span>View Auction</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}
