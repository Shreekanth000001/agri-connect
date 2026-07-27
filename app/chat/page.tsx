"use client";

import { useState, useRef, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/lib/SessionProvider';
import { useAccessToken } from '@/lib/hooks/useAccessToken';
import { useChatWebSocket } from '@/lib/hooks/useChatWebSocket';
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

function ChatContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const targetAuctionId = searchParams.get('auctionId');
  const user = useUser();
  const { token: accessToken } = useAccessToken();

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
    () => conversations.find((c) => String(c.id) === String(activeConvId)),
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

  // WebSocket: Handle incoming real-time messages
  const handleWsNewMessage = useCallback((msg: ChatMessage) => {
    const convId = msg.conversationId || activeConvId;
    if (!convId) return;

    setMessages((prev) => {
      const existing = prev[convId] || [];
      // Deduplicate: don't add if message ID already exists
      if (existing.some((m) => m.id === msg.id)) return prev;
      return { ...prev, [convId]: [...existing, msg] };
    });

    // Update sidebar last message
    setConversations((prev) =>
      prev.map((c) =>
        String(c.id) === String(convId)
          ? { ...c, lastMessage: msg.text, lastMessageTime: msg.timestamp }
          : c
      )
    );
  }, [activeConvId]);

  // Connect WebSocket to active conversation
  const { isConnected } = useChatWebSocket({
    conversationId: activeConvId,
    accessToken,
    currentUserId: user?.uid ?? null,
    onNewMessage: handleWsNewMessage,
  });

  // 1. Initial Conversations Fetch (Real FastAPI Backend Integration)
  const handleRetryConversations = async () => {
    setIsConvLoading(true);
    setConvError(null);

    const res = await fetchConversations(user?.uid, accessToken);

    if (res.error) {
      setConvError(res.error);
      setConversations([]);
      setActiveConvId(null);
    } else if (res.data && res.data.length > 0) {
      setConversations(res.data);
      const match = res.data.find(
        (c) => String(c.id) === String(targetId) || (targetAuctionId && String(c.auctionId) === String(targetAuctionId))
      );
      setActiveConvId(match ? String(match.id) : (targetId ? String(targetId) : String(res.data[0].id)));
    } else {
      setConversations([]);
      setActiveConvId(null);
    }
    setIsConvLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setConvError(null);

      const res = await fetchConversations(user?.uid, accessToken);
      if (!isMounted) return;

      if (res.error) {
        setConvError(res.error);
        setConversations([]);
        setActiveConvId(null);
        setMessages({});
      } else if (res.data && res.data.length > 0) {
        setConversations(res.data);
        const match = res.data.find(
          (c) => String(c.id) === String(targetId) || (targetAuctionId && String(c.auctionId) === String(targetAuctionId))
        );
        setActiveConvId(match ? String(match.id) : (targetId ? String(targetId) : String(res.data[0].id)));
      } else if (targetId) {
        setActiveConvId(String(targetId));
      } else {
        setConversations([]);
        setActiveConvId(null);
        setMessages({});
      }
      setIsConvLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [targetId, targetAuctionId, user?.uid, accessToken]);

  // 2. Fetch Messages for Active Conversation
  useEffect(() => {
    if (!activeConvId) return;
    let isMounted = true;

    async function loadMsgData() {
      setIsMsgLoading(true);
      setMsgError(null);

      const res = await fetchMessages(activeConvId!, user?.uid, accessToken);
      if (!isMounted) return;

      if (res.error) {
        if (res.error.includes('404') || res.error.includes('Not Found') || res.error.includes('401')) {
          setMsgError('Conversation thread is no longer available.');
          setActiveConvId(null);
        } else {
          setMsgError(res.error);
        }
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
  }, [activeConvId, user?.uid, accessToken]);

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setShowMobileList(false);

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // 3. Send Message via FastAPI API
  const handleSendMessage = async (text: string, offer?: NegotiationOffer) => {
    if (!activeConvId || !text.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      conversationId: activeConvId,
      senderId: user?.uid || 0,
      senderName: 'You',
      senderRole: 'BUYER',
      text,
      timestamp: 'Just now',
      isRead: true,
      offer: offer ? { ...offer, status: 'PROPOSED' } : undefined,
    };

    // A. Optimistic UI Update
    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    // B. Update Sidebar Last Message
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
    const apiRes = await sendChatMessage(
      activeConvId,
      text,
      offer ? { ...offer, status: 'PROPOSED' } : undefined,
      user?.uid,
      accessToken
    );

    if (apiRes.data) {
      const confirmedMsg = {
        ...apiRes.data,
        senderName: 'You',
      };
      setMessages((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map((m) =>
          m.id === tempId ? confirmedMsg : m
        ),
      }));
    } else if (apiRes.error) {
      setMsgError(`Message failed: ${apiRes.error}`);
      setMessages((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).filter((m) => m.id !== tempId),
      }));
    }
  };

  // 4. Accept Negotiation Offer via FastAPI API
  const handleAcceptOffer = async (offer: ChatMessage['offer']) => {
    if (!activeConvId || !offer) return;

    // A. Optimistic Update
    setMessages((prev) => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map((msg) => {
        if (msg.offer) {
          return {
            ...msg,
            offer: { ...msg.offer, status: 'ACCEPTED' },
          };
        }
        return msg;
      }),
    }));

    // B. Call FastAPI Endpoint
    const apiRes = await acceptNegotiationOffer(activeConvId, offer, accessToken);

    if (apiRes.error) {
      setMsgError(`Accept offer failed: ${apiRes.error}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] p-2 sm:p-6 lg:p-8 flex justify-center items-center">
      <div className="w-full max-w-7xl h-[80vh] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar: Conversation List */}
        <div
          className={`${
            showMobileList ? 'block' : 'hidden'
          } md:block w-full md:w-80 lg:w-96 border-r border-gray-200 h-full shrink-0`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeConvId}
            onSelect={handleSelectConv}
            isLoading={isConvLoading}
            error={convError}
            onRetry={handleRetryConversations}
          />
        </div>

        {/* Right Pane: Active Conversation or Empty State */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full min-w-0 bg-gray-50/50">
            {/* Header with WebSocket Status */}
            <NegotiationHeader
              conversation={activeConv}
              onBackMobile={() => setShowMobileList(true)}
            />

            {/* WebSocket Connection Status */}
            {activeConvId && (
              <div className={`px-4 py-1 text-xs flex items-center gap-1.5 border-b ${isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                {isConnected ? 'Live — real-time updates active' : 'Connecting...'}
              </div>
            )}

            {/* Chat Error Banner */}
            {msgError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs border-b border-red-200 flex justify-between items-center">
                <span>⚠️ {msgError}</span>
                <button
                  onClick={() => setMsgError(null)}
                  className="font-bold text-red-800 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {isMsgLoading && activeMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <div className="w-8 h-8 border-3 border-[#009C25] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-gray-500">Loading negotiation history...</p>
                </div>
              ) : activeMessages.length === 0 ? (
                <EmptyChatState
                  title="Start the Negotiation"
                  description="Send a message or submit a counter offer to negotiate produce prices directly."
                />
              ) : (
                activeMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={
                      Boolean(user?.uid) && Number(user?.uid) > 0
                        ? Number(msg.senderId) === Number(user?.uid)
                        : msg.senderName === 'You'
                    }
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

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
