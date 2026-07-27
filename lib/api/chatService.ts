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
    auctionId: Number(raw.auctionId || raw.auction_id || raw.product_id || raw.aucId || raw.auc_id || 0),
    productTitle: String(raw.productTitle || raw.product_title || raw.title || 'Produce Auction'),
    productImage: String(raw.productImage || raw.product_image || raw.imageUrl || raw.image_url || '/agri-conn-logo.png'),
    participantId: Number(raw.participantId || raw.participant_id || raw.partner_id || raw.farmer_id || 0),
    participantName: String(raw.participantName || raw.participant_name || raw.partner_name || raw.farmer_name || raw.uname || raw.name || 'Negotiation Partner'),
    participantRole: (raw.participantRole || raw.participant_role || raw.partner_role || raw.role || 'FARMER') as Conversation['participantRole'],
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
    currentUserId && Number(currentUserId) > 0
      ? Number(senderId) === Number(currentUserId)
      : (raw.is_me === true || rawSenderName === 'You')
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

/** Build auth headers: prefer Bearer token, fallback to X-User-Id */
function authHeaders(accessToken?: string | null, currentUserId?: number | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else if (currentUserId) {
    headers['X-User-Id'] = String(currentUserId);
  }
  return headers;
}

export async function fetchConversations(
  currentUserId?: number | null,
  accessToken?: string | null
): Promise<ApiClientResponse<Conversation[]>> {
  const headers = authHeaders(accessToken, currentUserId);
  const res = await apiClient.get<Record<string, unknown>[]>('/chat/conversations', headers);

  if (res.status === 404 || res.status === 401 || !res.data) {
    return { data: [], status: 200, error: undefined };
  }

  if (Array.isArray(res.data)) {
    return {
      status: 200,
      data: res.data.map(normalizeConversation),
      error: undefined,
    };
  }

  return { data: [], status: 200, error: undefined };
}

export async function createConversation(
  productId: number,
  farmerId: number,
  accessToken?: string | null
): Promise<ApiClientResponse<Conversation>> {
  const payload: Record<string, unknown> = {
    product_id: productId,
    farmer_id: farmerId,
  };

  const headers = authHeaders(accessToken);
  const res = await apiClient.post<Record<string, unknown>>('/chat/conversations', payload, headers);

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
  currentUserId?: number | null,
  accessToken?: string | null
): Promise<ApiClientResponse<ChatMessage[]>> {
  const headers = authHeaders(accessToken, currentUserId);
  const res = await apiClient.get<Record<string, unknown>[]>(
    `/chat/conversations/${conversationId}/messages`,
    headers
  );
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
  currentUserId?: number | null,
  accessToken?: string | null
): Promise<ApiClientResponse<ChatMessage>> {
  const payload: Record<string, unknown> = {
    text,
    message: text,
    offer: offer ? {
      pricePerKg: offer.pricePerKg,
      quantityKg: offer.quantityKg,
      totalAmount: offer.totalAmount,
      status: offer.status || 'PROPOSED',
    } : undefined,
  };

  const headers = authHeaders(accessToken, currentUserId);

  const res = await apiClient.post<Record<string, unknown>>(
    `/chat/conversations/${conversationId}/messages`,
    payload,
    headers
  );

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
  accessToken?: string | null
): Promise<ApiClientResponse<{ success: boolean }>> {
  const headers = authHeaders(accessToken);
  const res = await apiClient.post<{ success: boolean }>(
    `/chat/conversations/${conversationId}/accept-offer`,
    {
      offer: {
        ...offer,
        status: 'ACCEPTED',
      },
    },
    headers
  );
  return res;
}
