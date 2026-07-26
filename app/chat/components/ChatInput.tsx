"use client";

import { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, offer?: { pricePerKg: number; quantityKg: number; totalAmount: number }) => void;
  startingBid?: number;
}

export default function ChatInput({ onSendMessage, startingBid = 100 }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number | ''>(startingBid);
  const [offerQty, setOfferQty] = useState<number | ''>(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleSendOffer = () => {
    if (!offerPrice || !offerQty) return;
    const total = Number(offerPrice) * Number(offerQty);
    const offerMessage = `I would like to propose a counter offer of ₹${offerPrice}/kg for ${offerQty} kg (Total: ₹${total.toLocaleString()}).`;
    
    onSendMessage(offerMessage, {
      pricePerKg: Number(offerPrice),
      quantityKg: Number(offerQty),
      totalAmount: total,
    });

    setShowOfferModal(false);
    setText('');
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200 relative">
      {/* Proposal Modal Overlay */}
      {showOfferModal && (
        <div className="absolute bottom-full left-4 right-4 mb-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <span className="text-[#009C25]">🤝</span> Propose Price Offer
            </h4>
            <button
              onClick={() => setShowOfferModal(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Price / kg (₹)</label>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#009C25] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quantity (kg)</label>
              <input
                type="number"
                value={offerQty}
                onChange={(e) => setOfferQty(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#009C25] outline-none"
              />
            </div>
          </div>

          {offerPrice && offerQty && (
            <div className="mb-3 text-xs bg-green-50 text-green-800 p-2.5 rounded-xl border border-green-200 flex justify-between font-bold">
              <span>Total Offer Value:</span>
              <span>₹{(Number(offerPrice) * Number(offerQty)).toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowOfferModal(false)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendOffer}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#009C25] hover:bg-green-700 rounded-lg transition-colors shadow-sm"
            >
              Send Formal Offer
            </button>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        {/* Quick Offer Button */}
        <button
          type="button"
          onClick={() => setShowOfferModal(!showOfferModal)}
          className="p-2.5 bg-green-50 hover:bg-green-100 text-[#009C25] rounded-xl border border-green-200 transition-colors font-bold text-xs flex items-center gap-1 shrink-0"
          title="Make price offer"
        >
          <span>🏷️</span>
          <span className="hidden sm:inline">Offer</span>
        </button>

        {/* Text Field */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message or negotiation terms..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#009C25] focus:border-transparent outline-none bg-gray-50/50 focus:bg-white transition-colors"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2.5 bg-[#009C25] hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl transition-all shadow-sm shrink-0 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
