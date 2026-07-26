export interface NegotiationOffer {
  pricePerKg: number;
  quantityKg: number;
  totalAmount: number;
  deliveryDate?: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  senderName: string;
  senderRole: 'FARMER' | 'BUYER';
  text: string;
  timestamp: string;
  isRead: boolean;
  offer?: NegotiationOffer;
}

export interface Conversation {
  id: string;
  auctionId: number;
  productTitle: string;
  productImage: string;
  startingBid: number;
  participantId: number;
  participantName: string;
  participantRole: 'FARMER' | 'BUYER';
  participantAvatar?: string;
  participantLocation: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'ACTIVE' | 'AGREED' | 'CLOSED';
}
