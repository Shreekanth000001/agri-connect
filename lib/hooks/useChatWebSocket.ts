"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { ChatMessage } from '@/app/chat/types';
import { normalizeChatMessage } from '@/lib/api/chatService';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1';

interface UseChatWebSocketOptions {
  conversationId: string | null;
  accessToken: string | null;
  currentUserId: number | null;
  onNewMessage: (msg: ChatMessage) => void;
}

export function useChatWebSocket({
  conversationId,
  accessToken,
  currentUserId,
  onNewMessage,
}: UseChatWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnect on intentional close
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!conversationId || !accessToken) return;

    cleanup();

    const wsUrl = `${WS_BASE}/ws/chat/${conversationId}?token=${accessToken}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Connected to conversation ${conversationId}`);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      // Heartbeat every 30s
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'pong') return; // Heartbeat response

        if (data.type === 'new_message' && data.data) {
          const msg = normalizeChatMessage(data.data, currentUserId ?? undefined);
          onNewMessage(msg);
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log(`[WS] Disconnected from conversation ${conversationId} (code: ${event.code})`);
      setIsConnected(false);

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Auto-reconnect with exponential backoff (only for non-policy violations)
      if (event.code !== 1008 && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      console.warn('[WS] WebSocket connection event error occurred');
    };
  }, [conversationId, accessToken, currentUserId, onNewMessage, cleanup]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content }));
    }
  }, []);

  return { isConnected, sendMessage };
}
