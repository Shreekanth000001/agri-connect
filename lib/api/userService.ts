import { apiClient, ApiClientResponse } from './apiClient';
import { getCachedAccessToken } from '@/lib/hooks/useAccessToken';

export interface UserUpdateParams {
  uname?: string;
  uphone?: string;
  ugeo?: string;
  uloc?: string;
}

export interface UserProfileResponse {
  uid: number;
  uname: string;
  uemail: string;
  uphone?: string;
  ugeo?: string;
  uloc?: string;
  role: string;
}

/**
 * Directly update user profile on FastAPI backend using centralized apiClient
 */
export async function updateUserProfile(
  params: UserUpdateParams,
  accessToken?: string | null
): Promise<ApiClientResponse<UserProfileResponse>> {
  const token = accessToken || getCachedAccessToken() || (typeof window !== 'undefined' ? localStorage.getItem('agri_access_token') : null);
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return apiClient.put<UserProfileResponse>('/users/me', params, headers);
}
