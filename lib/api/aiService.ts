import { apiClient, ApiClientResponse } from './apiClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface AIChatResponse {
  thread_id: string;
  response: string;
  message?: string;
}

export interface AIProviderStatus {
  status: string;
  primary_provider?: string;
  fallback_provider?: string;
  active_provider?: string;
}

/**
 * Standard JSON Chat Request (non-streaming)
 */
export async function sendAIChat(
  message: string,
  threadId: string
): Promise<ApiClientResponse<AIChatResponse>> {
  return apiClient.post<AIChatResponse>('/ai/chat', {
    message,
    thread_id: threadId,
    stream: false,
  });
}

/**
 * Real-Time Streaming Chat Request (Server-Sent Events - SSE)
 */
export async function streamAIChat(
  message: string,
  threadId: string,
  onChunk: (chunk: string, isFullText?: boolean) => void,
  onComplete: () => void,
  onError: (err: string) => void
): Promise<void> {
  const url = `${BASE_URL}/ai/chat`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        message,
        thread_id: threadId,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'AI service unavailable');
      onError(`Error ${response.status}: ${errorText || response.statusText}`);
      return;
    }

    if (!response.body) {
      onError('Streaming response body is missing');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          if (jsonStr === '[DONE]') {
            onComplete();
            return;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.chunk) {
              // Incremental token chunk
              onChunk(parsed.chunk, false);
            } else if (parsed.response || parsed.message) {
              // Full response payload (non-chunked or completion)
              onChunk(parsed.response || parsed.message, true);
            }
            if (parsed.done) {
              onComplete();
              return;
            }
          } catch {
            if (jsonStr && !jsonStr.startsWith('{')) {
              onChunk(jsonStr, false);
            }
          }
        }
      }
    }

    onComplete();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error during streaming';
    onError(msg);
  }
}

/**
 * Fetch LLM Health & Provider Status
 */
export async function getAIHealth(): Promise<ApiClientResponse<AIProviderStatus>> {
  return apiClient.get<AIProviderStatus>('/ai/health');
}

export async function getAIProviders(): Promise<ApiClientResponse<AIProviderStatus>> {
  return apiClient.get<AIProviderStatus>('/ai/providers');
}
