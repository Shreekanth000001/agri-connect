import { apiClient, ApiClientResponse } from './apiClient';
import { Conversation, ChatMessage, NegotiationOffer } from '@/app/chat/types';

export function formatTimestamp(ts?: string): string {
  if (!ts) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (ts.length < 12 && !ts.includes('T')) return ts;

  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Helper function to safely normalize any raw backend conversation response
export function normalizeConversation(raw: Record<string, unknown>): Conversation {
  const rawLastTime = String(raw.lastMessageTime || raw.last_message_time || raw.created_at || 'Just now');

  return {
    id: String(raw.id || raw.conversation_id || raw.conv_id || `conv-${Date.now()}`),
    auctionId: Number(raw.auctionId || raw.auction_id || raw.aucId || raw.auc_id || 0),
    productTitle: String(raw.productTitle || raw.product_title || raw.title || 'Produce Auction'),
    productImage: String(raw.productImage || raw.product_image || raw.imageUrl || raw.image_url || '/agri-conn-logo.png'),
    participantId: Number(raw.participantId || raw.participant_id || raw.fid || raw.farmer_id || 0),
    participantName: String(raw.participantName || raw.participant_name || raw.farmer_name || raw.uname || raw.name || 'Farmer / Buyer'),
    participantRole: (raw.participantRole || raw.participant_role || raw.role || 'FARMER') as Conversation['participantRole'],
    participantLocation: String(raw.participantLocation || raw.participant_location || raw.location || raw.uloc || 'India'),
    startingBid: Number(raw.startingBid || raw.starting_bid || raw.price || 100),
    lastMessage: String(raw.lastMessage || raw.last_message || raw.message || ''),
    lastMessageTime: formatTimestamp(rawLastTime),
    unreadCount: Number(raw.unreadCount || raw.unread_count || 0),
    status: (raw.status as Conversation['status']) || 'ACTIVE',
  };
}

export function normalizeNegotiationOffer(rawOffer: unknown): NegotiationOffer | undefined {
  if (!rawOffer || typeof rawOffer !== 'object') return undefined;
  const o = rawOffer as Record<string, unknown>;
  const price = Number(o.pricePerKg ?? o.price_per_kg ?? o.price ?? 0);
  const qty = Number(o.quantityKg ?? o.quantity_kg ?? o.quantity ?? 0);
  const total = Number(o.totalAmount ?? o.total_amount ?? price * qty);
  const status = (String(o.status || 'PROPOSED').toUpperCase()) as NegotiationOffer['status'];

  if (!price && !qty && !total) return undefined;

  return {
    pricePerKg: price,
    quantityKg: qty,
    totalAmount: total,
    status,
  };
}

export function normalizeChatMessage(
  raw: Record<string, unknown>,
  currentUserId?: number | null
): ChatMessage {
  const senderId = Number(raw.senderId || raw.sender_id || raw.user_id || 0);
  const rawSenderName = String(raw.senderName || raw.sender_name || raw.uname || '');

  const isMe = Boolean(
    raw.is_me === true ||
    raw.is_me === 'true' ||
    rawSenderName === 'You' ||
    (Boolean(currentUserId) && Number(senderId) === Number(currentUserId))
  );

  const rawTimestamp = String(raw.timestamp || raw.created_at || '');

  return {
    id: String(raw.id || raw.message_id || `msg-${Date.now()}`),
    conversationId: String(raw.conversationId || raw.conversation_id || ''),
    senderId,
    senderName: isMe ? 'You' : (rawSenderName || 'User'),
    senderRole: (raw.senderRole || raw.sender_role || raw.role || 'BUYER') as ChatMessage['senderRole'],
    text: String(raw.text || raw.message || raw.content || ''),
    timestamp: formatTimestamp(rawTimestamp),
    isRead: Boolean(raw.isRead ?? raw.is_read ?? true),
    offer: normalizeNegotiationOffer(raw.offer),
  };
}

export async function fetchConversations(): Promise<ApiClientResponse<Conversation[]>> {
  const res = await apiClient.get<Record<string, unknown>[]>('/chat/conversations');
  if (res.data && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map(normalizeConversation),
    };
  }
  return { ...res, data: res.data ? [] : undefined };
}

export async function createConversation(
  productId: number,
  farmerId: number,
  consumerId?: number | null
): Promise<ApiClientResponse<Conversation>> {
  const payload: Record<string, unknown> = {
    product_id: productId,
    farmer_id: farmerId,
  };
  if (consumerId && consumerId > 0) {
    payload.consumer_id = consumerId;
  }

  const res = await apiClient.post<Record<string, unknown>>('/chat/conversations', payload);

  if (res.data) {
    return {
      ...res,
      data: normalizeConversation(res.data),
    };
  }
  return { ...res, data: undefined };
}

export async function fetchMessages(
  conversationId: string,
  currentUserId?: number | null
): Promise<ApiClientResponse<ChatMessage[]>> {
  const res = await apiClient.get<Record<string, unknown>[]>(`/chat/conversations/${conversationId}/messages`);
  if (res.data && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map((m) => normalizeChatMessage(m, currentUserId)),
    };
  }
  return { ...res, data: res.data ? [] : undefined };
}

export async function sendChatMessage(
  conversationId: string,
  text: string,
  offer?: NegotiationOffer,
  currentUserId?: number | null
): Promise<ApiClientResponse<ChatMessage>> {
  const res = await apiClient.post<Record<string, unknown>>(`/chat/conversations/${conversationId}/messages`, {
    text,
    offer,
  });

  if (res.data) {
    return {
      ...res,
      data: normalizeChatMessage(res.data, currentUserId),
    };
  }
  return { ...res, data: undefined };
}

export async function acceptNegotiationOffer(
  conversationId: string,
  offer: NegotiationOffer,
  currentUserId?: number | null
): Promise<ApiClientResponse<ChatMessage>> {
  const res = await apiClient.post<Record<string, unknown>>(`/chat/conversations/${conversationId}/messages`, {
    text: `Deal Accepted! Agreed on ₹${offer.pricePerKg}/kg for ${offer.quantityKg} kg (Total: ₹${offer.totalAmount.toLocaleString()}).`,
    offer: {
      ...offer,
      status: 'ACCEPTED',
    },
  });

  if (res.data) {
    return {
      ...res,
      data: normalizeChatMessage(res.data, currentUserId),
    };
  }
  return { ...res, data: undefined };
}
