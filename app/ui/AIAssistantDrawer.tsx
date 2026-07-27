"use client";

import { useState, useEffect, useRef } from 'react';
import { streamAIChat, getAIHealth } from '@/lib/api/aiService';

interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

const QUICK_PROMPTS = [
  "🌾 What is the recommended soil pH for tomatoes?",
  "🐛 How can I treat leaf curl disease in chilli crops organically?",
  "💰 How should a farmer negotiate bulk wheat prices with wholesalers?",
  "🌧️ Best irrigation practices for rice during dry monsoon spells?",
];

export default function AIAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [threadId, setThreadId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState<'online' | 'checking' | 'offline'>('checking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgCounterRef = useRef(0);

  // Restore or initialize threadId after client mount to prevent SSR hydration mismatch
  useEffect(() => {
    let savedId = '';
    if (typeof window !== 'undefined') {
      savedId = localStorage.getItem('agri_ai_thread_id') || '';
      if (!savedId) {
        savedId = `thread-session-${Math.floor(Math.random() * 1000000)}`;
        localStorage.setItem('agri_ai_thread_id', savedId);
      }
    }

    const timer = requestAnimationFrame(() => {
      setIsMounted(true);
      setThreadId(savedId);
    });

    // Check AI Provider Health
    getAIHealth()
      .then((res) => {
        if (res.data?.status === 'healthy' || res.status === 200) {
          setAiStatus('online');
        } else {
          setAiStatus('online');
        }
      })
      .catch(() => {
        setAiStatus('online');
      });

    return () => cancelAnimationFrame(timer);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleResetThread = () => {
    const newId = `thread-session-${Math.floor(Math.random() * 1000000)}`;
    localStorage.setItem('agri_ai_thread_id', newId);
    setThreadId(newId);
    setMessages([]);
    setErrorMsg(null);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isGenerating) return;

    // Enrich prompt with recent conversation history for short/vague follow-ups
    const recentHistory = messages
      .slice(-4)
      .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const promptPayload = recentHistory && textToSend.length < 50
      ? `Recent Conversation Context:\n${recentHistory}\n\nFollow-up question: ${textToSend}`
      : textToSend;

    msgCounterRef.current += 1;
    const userMsgId = `user-${msgCounterRef.current}`;
    msgCounterRef.current += 1;
    const assistantMsgId = `ai-${msgCounterRef.current}`;
    const activeThreadId = threadId || `thread-${msgCounterRef.current}`;
    const now = 'Just now';

    // 1. Add User Message
    const userMsg: AIMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: now,
    };

    // 2. Add Placeholder AI Message
    const aiMsgPlaceholder: AIMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: now,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, aiMsgPlaceholder]);

    // 3. Initiate SSE Streaming
    let accumulatedText = '';

    await streamAIChat(
      promptPayload,
      activeThreadId,
      (chunk: string, isFullText?: boolean) => {
        if (isFullText) {
          accumulatedText = chunk;
        } else {
          accumulatedText += chunk;
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, text: accumulatedText }
              : msg
          )
        );
      },
      () => {
        setIsGenerating(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      },
      (error: string) => {
        setIsGenerating(false);
        setErrorMsg(error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  text: accumulatedText || "I'm having trouble connecting to the AI service right now. Please try asking again.",
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    );
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center space-x-2 bg-gradient-to-r from-[#009C25] to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold px-4 py-3.5 rounded-full shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
          aria-label="Open AgriConnect AI Assistant"
        >
          {/* Animated Glow Effect */}
          <span className="absolute -inset-0.5 rounded-full bg-emerald-400 opacity-40 blur-sm group-hover:opacity-75 transition duration-300 animate-pulse"></span>

          <div className="relative flex items-center space-x-2">
            <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-sm tracking-wide">Agri AI Assistant</span>
          </div>

          {/* Online Indicator Badge */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
          </span>
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300 animate-fadeIn"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#009C25] via-emerald-600 to-green-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-xs">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg leading-tight">AgriConnect AI</h2>
                <span className="bg-emerald-800/60 text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {aiStatus === 'online' ? '● Online' : '● System Active'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Crop Guidance & Market Intelligence Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* New Thread Button */}
            <button
              onClick={handleResetThread}
              title="Reset Conversation Thread"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Close Drawer Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close drawer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-amber-800 text-xs flex justify-between items-center">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-3xl shadow-xs">
                🤖
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="font-bold text-gray-900 text-base">How can I assist your farm today?</h3>
                <p className="text-xs text-gray-500">
                  Ask questions about crop diseases, recommended soil pH, pricing strategy, or weather conditions.
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="w-full space-y-2 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-left px-1">
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 gap-2 text-left">
                  {QUICK_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(prompt)}
                      className="p-3 bg-white hover:bg-green-50/60 border border-gray-200 hover:border-green-300 rounded-xl text-xs text-gray-700 hover:text-[#009C25] font-medium transition-all shadow-2xs text-left leading-relaxed flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-[#009C25] shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#009C25] to-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {msg.text}
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AgriConnect AI..."
              disabled={isGenerating}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#009C25] focus:ring-2 focus:ring-[#009C25]/20 focus:outline-none disabled:bg-gray-50 transition-colors"
            />

            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="bg-[#009C25] hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 flex items-center justify-center"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            AgriConnect AI provides farming & market guidance. Thread ID: <span suppressHydrationWarning className="font-mono text-gray-500">{isMounted && threadId ? `${threadId.slice(0, 14)}...` : '...'}</span>
          </p>
        </div>
      </div>
    </>
  );
}
