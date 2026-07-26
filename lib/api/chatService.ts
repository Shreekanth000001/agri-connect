import { Conversation, ChatMessage, NegotiationOffer } from '@/app/chat/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchConversations(): Promise<ApiResponse<Conversation[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || `Failed to fetch conversations (${res.status})` };
    }

    const data: Conversation[] = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error while fetching conversations';
    return { error: message };
  }
}

export async function fetchMessages(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || `Failed to fetch messages (${res.status})` };
    }

    const data: ChatMessage[] = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error while fetching messages';
    return { error: message };
  }
}

export async function sendChatMessage(
  conversationId: string,
  text: string,
  offer?: NegotiationOffer
): Promise<ApiResponse<ChatMessage>> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        offer,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || `Failed to send message (${res.status})` };
    }

    const data: ChatMessage = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error while sending message';
    return { error: message };
  }
}

export async function acceptNegotiationOffer(
  conversationId: string,
  offer: NegotiationOffer
): Promise<ApiResponse<ChatMessage>> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Deal Accepted! Agreed on ₹${offer.pricePerKg}/kg for ${offer.quantityKg} kg (Total: ₹${offer.totalAmount.toLocaleString()}).`,
        offer: {
          ...offer,
          status: 'ACCEPTED',
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || `Failed to accept offer (${res.status})` };
    }

    const data: ChatMessage = await res.json();
    return { data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error while accepting offer';
    return { error: message };
  }
}
