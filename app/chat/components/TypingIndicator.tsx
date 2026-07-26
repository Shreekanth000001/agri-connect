"use client";

export default function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4 ml-1 animate-fade-in">
      <span className="font-semibold text-gray-600">{name} is typing</span>
      <div className="flex items-center space-x-1 bg-gray-200/80 px-2 py-1 rounded-full">
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
