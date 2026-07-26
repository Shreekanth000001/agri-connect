"use client";

import { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  onAcceptOffer?: (offer: ChatMessage['offer']) => void;
}

export default function MessageBubble({
  message,
  isMe,
  onAcceptOffer,
}: MessageBubbleProps) {
  const offer = message.offer;

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4 space-y-1`}>
      {/* Sender Header Name if not me */}
      {!isMe && (
        <span className="text-[11px] font-semibold text-gray-500 ml-1">
          {message.senderName}
        </span>
      )}

      {/* Main Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-xs text-sm ${
          isMe
            ? 'bg-[#009C25] text-white rounded-br-none'
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
        }`}
      >
        {/* Text Body */}
        <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>

        {/* Negotiation Offer Card Attachment */}
        {offer && (
          <div
            className={`mt-3 p-3 rounded-xl border text-xs ${
              isMe
                ? 'bg-green-800/30 border-green-400/30 text-white'
                : 'bg-green-50 border-green-200 text-gray-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1 border-b border-current/10 pb-1">
              <span>Negotiation Proposal</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${
                  offer.status === 'ACCEPTED'
                    ? 'bg-emerald-500 text-white'
                    : offer.status === 'COUNTERED'
                    ? 'bg-amber-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {offer.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              <div>
                <span className="opacity-75 block text-[10px]">Price / kg</span>
                <span className="font-extrabold text-sm">₹{offer.pricePerKg}</span>
              </div>
              <div>
                <span className="opacity-75 block text-[10px]">Quantity</span>
                <span className="font-extrabold text-sm">{offer.quantityKg} kg</span>
              </div>
            </div>

            <div className="pt-1 border-t border-current/10 flex items-center justify-between">
              <span className="opacity-75">Total Estimated:</span>
              <span className="font-black text-base">₹{offer.totalAmount.toLocaleString()}</span>
            </div>

            {/* Accept Button for Received Offer */}
            {!isMe && offer.status === 'COUNTERED' && onAcceptOffer && (
              <button
                onClick={() => onAcceptOffer(offer)}
                className="mt-2.5 w-full bg-[#009C25] hover:bg-green-700 text-white font-bold py-1.5 rounded-lg transition-colors text-center text-xs"
              >
                Accept Offer (₹{offer.totalAmount.toLocaleString()})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Timestamp & Status */}
      <div className="flex items-center space-x-1 px-1">
        <span className="text-[10px] text-gray-400 font-medium">{message.timestamp}</span>
        {isMe && (
          <svg className="w-3.5 h-3.5 text-[#009C25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
}
