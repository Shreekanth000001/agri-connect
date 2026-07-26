"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ConversationList from './components/ConversationList';
import NegotiationHeader from './components/NegotiationHeader';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';
import ChatInput from './components/ChatInput';
import EmptyChatState from './components/EmptyChatState';
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from './mockData';
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

  const [isTyping, setIsTyping] = useState(false);
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
  }, [activeMessages, isTyping]);

  // 1. Initial Conversations Fetch (REST API Integration)
  const loadConversations = useCallback(async () => {
    setIsConvLoading(true);
    setConvError(null);

    const res = await fetchConversations();

    if (res.error) {
      setConversations(INITIAL_CONVERSATIONS);
      setActiveConvId('conv-1');
      setMessages(INITIAL_MESSAGES);
    } else if (res.data && res.data.length > 0) {
      setConversations(res.data);
      setActiveConvId(res.data[0].id);
    } else {
      setConversations([]);
    }
    setIsConvLoading(false);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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
        setMessages((prev) => {
          if (prev[activeConvId!]) return prev;
          return {
            ...prev,
            [activeConvId!]: INITIAL_MESSAGES[activeConvId!] || [],
          };
        });
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

  // 3. Send Message with OPTIMISTIC UI
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

    // B. Optimistically Update State immediately
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

    // C. Perform API Call in Background
    const apiRes = await sendChatMessage(activeConvId, text, offer ? { ...offer, status: 'PROPOSED' } : undefined);

    if (apiRes.data) {
      // Confirm optimistic message with server response
      const confirmedMsg = apiRes.data;
      setMessages((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map((m) =>
          m.id === tempId ? confirmedMsg : m
        ),
      }));
    } else {
      // Simulate mock reply if API is in fallback mode
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const farmerReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          conversationId: activeConvId,
          senderId: activeConv?.participantId || 15,
          senderName: activeConv?.participantName || 'Farmer',
          senderRole: activeConv?.participantRole || 'FARMER',
          text: offer
            ? `Thank you for the offer of ₹${offer.pricePerKg}/kg! Let me review my harvesting stock and get back to you shortly.`
            : 'Thank you for your message. We can discuss delivery logistics next.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
        };

        setMessages((prev) => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), farmerReply],
        }));
      }, 1500);
    }
  };

  // 4. Accept Negotiation Offer via API
  const handleAcceptOffer = async (offer: ChatMessage['offer']) => {
    if (!activeConvId || !offer) return;

    // Optimistic UI for Offer Acceptance
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

    // Call API service
    await acceptNegotiationOffer(activeConvId, offer);
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
            onRetry={loadConversations}
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
                  Loading messages...
                </div>
              ) : msgError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-xs">
                  {msgError}
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

              {isTyping && <TypingIndicator name={activeConv.participantName} />}
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
            <EmptyChatState />
          </div>
        )}
      </div>
    </div>
  );
}
