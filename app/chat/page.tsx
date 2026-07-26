"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import ConversationList from './components/ConversationList';
import NegotiationHeader from './components/NegotiationHeader';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';
import ChatInput from './components/ChatInput';
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from './mockData';
import { ChatMessage, Conversation } from './types';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeConvId, setActiveConvId] = useState<string | null>('conv-1');
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeMessages = useMemo(() => {
    return activeConvId ? messages[activeConvId] || [] : [];
  }, [activeConvId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping]);

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setShowMobileList(false);

    // Clear unread count for selected conversation
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (
    text: string,
    offer?: { pricePerKg: number; quantityKg: number; totalAmount: number }
  ) => {
    if (!activeConvId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
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

    // Add user message
    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMessage],
    }));

    // Update conversation last message preview
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

    // Simulate mock reply & typing indicator after 1.5 seconds
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
    }, 2000);
  };

  const handleAcceptOffer = (offer: ChatMessage['offer']) => {
    if (!activeConvId || !offer) return;

    const acceptMessage: ChatMessage = {
      id: `msg-accept-${Date.now()}`,
      conversationId: activeConvId,
      senderId: 10,
      senderName: 'You',
      senderRole: 'BUYER',
      text: `Deal Accepted! Agreed on ₹${offer.pricePerKg}/kg for ${offer.quantityKg} kg (Total: ₹${offer.totalAmount.toLocaleString()}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      offer: {
        ...offer,
        status: 'ACCEPTED',
      },
    };

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), acceptMessage],
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
            onSelect={handleSelectConv}
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
              {activeMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={msg.senderName === 'You'}
                  onAcceptOffer={handleAcceptOffer}
                />
              ))}

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
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm bg-gray-50">
            Select a negotiation from the list to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
