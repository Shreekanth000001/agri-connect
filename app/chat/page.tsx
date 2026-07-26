"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import ConversationList from './components/ConversationList';
import NegotiationHeader from './components/NegotiationHeader';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import EmptyChatState from './components/EmptyChatState';
import { ChatMessage, Conversation, NegotiationOffer } from './types';
import {
  fetchConversations,
  fetchMessages,
  sendChatMessage,
  acceptNegotiationOffer,
} from '@/lib/api/chatService';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Loading & Error States
  const [isConvLoading, setIsConvLoading] = useState(true);
  const [convError, setConvError] = useState<string | null>(null);
  const [isMsgLoading, setIsMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  const [showMobileList, setShowMobileList] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId),
    [conversations, activeConvId]
  );

  const activeMessages = useMemo(() => {
    return activeConvId ? messages[activeConvId] || [] : [];
  }, [activeConvId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  // 1. Initial Conversations Fetch (Real FastAPI Backend Integration)
  const handleRetryConversations = async () => {
    setIsConvLoading(true);
    setConvError(null);

    const res = await fetchConversations();

    if (res.error) {
      setConvError(res.error);
      setConversations([]);
    } else if (res.data && res.data.length > 0) {
      setConversations(res.data);
      setActiveConvId(res.data[0].id);
    } else {
      setConversations([]);
    }
    setIsConvLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setConvError(null);

      const res = await fetchConversations();
      if (!isMounted) return;

      if (res.error) {
        setConvError(res.error);
        setConversations([]);
      } else if (res.data && res.data.length > 0) {
        setConversations(res.data);
        setActiveConvId(res.data[0].id);
      } else {
        setConversations([]);
      }
      setIsConvLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Messages for Active Conversation
  useEffect(() => {
    if (!activeConvId) return;
    let isMounted = true;

    async function loadMsgData() {
      setIsMsgLoading(true);
      setMsgError(null);

      const res = await fetchMessages(activeConvId!);
      if (!isMounted) return;

      if (res.error) {
        setMsgError(res.error);
      } else if (res.data) {
        setMessages((prev) => ({
          ...prev,
          [activeConvId!]: res.data || [],
        }));
      }
      setIsMsgLoading(false);
    }

    loadMsgData();
    return () => {
      isMounted = false;
    };
  }, [activeConvId]);

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setShowMobileList(false);

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // 3. Send Message via FastAPI Backend with OPTIMISTIC UI
  const handleSendMessage = async (
    text: string,
    offer?: NegotiationOffer
  ) => {
    if (!activeConvId) return;

    // A. Create Optimistic Message
    const tempId = `optimistic-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversationId: activeConvId,
      senderId: 10,
      senderName: 'You',
      senderRole: 'BUYER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      offer: offer
        ? {
            ...offer,
            status: 'PROPOSED',
          }
        : undefined,
    };

    // B. Optimistically Update State
    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), optimisticMessage],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTime: 'Just now',
            }
          : c
      )
    );

    // C. FastAPI API Call
    const apiRes = await sendChatMessage(activeConvId, text, offer ? { ...offer, status: 'PROPOSED' } : undefined);

    if (apiRes.data) {
      // Replace optimistic message with confirmed server payload
      const confirmedMsg = apiRes.data;
      setMessages((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map((m) =>
          m.id === tempId ? confirmedMsg : m
        ),
      }));
    } else if (apiRes.error) {
      setMsgError(`Message failed: ${apiRes.error}`);
      // Revert optimistic message on error
      setMessages((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).filter((m) => m.id !== tempId),
      }));
    }
  };

  // 4. Accept Negotiation Offer via FastAPI API
  const handleAcceptOffer = async (offer: ChatMessage['offer']) => {
    if (!activeConvId || !offer) return;

    const acceptText = `Deal Accepted! Agreed on ₹${offer.pricePerKg}/kg for ${offer.quantityKg} kg (Total: ₹${offer.totalAmount.toLocaleString()}).`;
    
    const optimisticAcceptMsg: ChatMessage = {
      id: `accept-opt-${Date.now()}`,
      conversationId: activeConvId,
      senderId: 10,
      senderName: 'You',
      senderRole: 'BUYER',
      text: acceptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      offer: {
        ...offer,
        status: 'ACCEPTED',
      },
    };

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), optimisticAcceptMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              status: 'AGREED',
              lastMessage: 'Deal Agreed!',
              lastMessageTime: 'Just now',
            }
          : c
      )
    );

    const apiRes = await acceptNegotiationOffer(activeConvId, offer);
    if (apiRes.error) {
      setMsgError(`Offer acceptance failed: ${apiRes.error}`);
    }
  };

  return (
    <div className="grow min-h-[85vh] bg-gray-100 flex flex-col">
      <div className="max-w-7xl w-full mx-auto my-0 md:my-6 flex-1 flex bg-white border border-gray-200 shadow-xl rounded-none md:rounded-2xl overflow-hidden min-h-[75vh]">
        {/* Sidebar Conversation List */}
        <div
          className={`${
            showMobileList || !activeConvId ? 'block' : 'hidden md:block'
          } w-full md:w-auto shrink-0`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeConvId}
            isLoading={isConvLoading}
            error={convError}
            onSelect={handleSelectConv}
            onRetry={handleRetryConversations}
          />
        </div>

        {/* Main Chat Conversation View */}
        {activeConv ? (
          <div
            className={`${
              !showMobileList ? 'flex' : 'hidden md:flex'
            } flex-col flex-1 bg-gray-50/60 min-w-0`}
          >
            {/* Active Header */}
            <NegotiationHeader
              conversation={activeConv}
              onBackMobile={() => setShowMobileList(true)}
            />

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {isMsgLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                  <div className="w-5 h-5 border-2 border-[#009C25] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Fetching messages from backend...
                </div>
              ) : msgError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-xs font-semibold">
                  {msgError}
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No messages yet. Send a message or propose a counter offer to start negotiating!
                </div>
              ) : (
                activeMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={msg.senderName === 'You'}
                    onAcceptOffer={handleAcceptOffer}
                  />
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Component */}
            <ChatInput
              onSendMessage={handleSendMessage}
              startingBid={activeConv.startingBid}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1">
            <EmptyChatState
              title={
                convError
                  ? convError.includes('401') || convError.toLowerCase().includes('unauthorized')
                    ? 'Authentication Required'
                    : 'Backend Service Notice'
                  : 'No Active Negotiation Selected'
              }
              description={
                convError
                  ? convError.includes('401') || convError.toLowerCase().includes('unauthorized')
                    ? 'You are currently not logged in. Please log in to your account to view your active negotiations.'
                    : `Notice: ${convError}. (Ensure FastAPI server is running at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'})`
                  : 'Select a negotiation conversation from the sidebar to view messages, place price proposals, and communicate directly with farmers and buyers.'
              }
              buttonText={
                convError && (convError.includes('401') || convError.toLowerCase().includes('unauthorized'))
                  ? 'Log In Now'
                  : 'Explore Produce Marketplace'
              }
              buttonLink={
                convError && (convError.includes('401') || convError.toLowerCase().includes('unauthorized'))
                  ? '/auth/login'
                  : '/'
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
