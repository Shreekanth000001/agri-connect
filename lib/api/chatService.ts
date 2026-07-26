import { apiClient, ApiClientResponse } from './apiClient';
import { Conversation, ChatMessage, NegotiationOffer } from '@/app/chat/types';

export async function fetchConversations(): Promise<ApiClientResponse<Conversation[]>> {
  return apiClient.get<Conversation[]>('/chat/conversations');
}

export async function createConversation(
  auctionId: number,
  participantId: number
): Promise<ApiClientResponse<Conversation>> {
  return apiClient.post<Conversation>('/chat/conversations', {
    auctionId,
    participantId,
  });
}

export async function fetchMessages(conversationId: string): Promise<ApiClientResponse<ChatMessage[]>> {
  return apiClient.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`);
}

export async function sendChatMessage(
  conversationId: string,
  text: string,
  offer?: NegotiationOffer
): Promise<ApiClientResponse<ChatMessage>> {
  return apiClient.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
    text,
    offer,
  });
}

export async function acceptNegotiationOffer(
  conversationId: string,
  offer: NegotiationOffer
): Promise<ApiClientResponse<ChatMessage>> {
  return apiClient.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
    text: `Deal Accepted! Agreed on ₹${offer.pricePerKg}/kg for ${offer.quantityKg} kg (Total: ₹${offer.totalAmount.toLocaleString()}).`,
    offer: {
      ...offer,
      status: 'ACCEPTED',
    },
  });
}
