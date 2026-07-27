const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiClientResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiClientResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Automatically passes Next.js session cookie to FastAPI backend on browser fetches
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) {
            errorMessage = errorJson.detail;
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Response body was not JSON
        }
        return { error: errorMessage, status: response.status };
      }

      const data: T = await response.json();
      return { data, status: response.status };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error occurred';
      return { error: message, status: 0 };
    }
  }

  public async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public async post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient(BASE_URL);
