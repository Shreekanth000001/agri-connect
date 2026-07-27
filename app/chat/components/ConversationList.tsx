"use client";

import { useState } from 'react';
import { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  isLoading?: boolean;
  error?: string | null;
  onSelect: (id: string) => void;
  onRetry?: () => void;
}

export default function ConversationList({
  conversations,
  activeId,
  isLoading = false,
  error = null,
  onSelect,
  onRetry,
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const title = (c?.productTitle || (c as unknown as Record<string, string>)?.title || '').toLowerCase();
    const name = (c?.participantName || (c as unknown as Record<string, string>)?.name || '').toLowerCase();
    const query = (search || '').toLowerCase();
    return title.includes(query) || name.includes(query);
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-80 lg:w-96 shrink-0">
      {/* List Header */}
      <div className="p-4 border-b border-gray-200 space-y-3 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Negotiations</h2>
          <span className="bg-[#009C25]/10 text-[#009C25] font-bold text-xs px-2.5 py-1 rounded-full border border-[#009C25]/20">
            {conversations.length} Active
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <svg
            className="w-4 h-4 absolute left-3 top-3 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search farmer, produce..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#009C25] focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2">
                <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm space-y-3">
            <p className="text-red-600 font-semibold">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors"
              >
                Retry Loading
              </button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No negotiations found matching &quot;{search}&quot;
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full p-4 text-left flex items-start space-x-3 transition-colors ${
                  isActive
                    ? 'bg-green-50/60 border-l-4 border-[#009C25]'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Produce / User Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={conv.productImage}
                    alt={conv.productTitle}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* Info Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-gray-900 truncate">
                      {conv.participantName}
                    </h4>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {conv.lastMessageTime}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#009C25] truncate mb-1">
                    {conv.productTitle}
                  </p>

                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
