import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum SYSTEM {
  INVALIDATE_CACHE = 'admin/system/cache/invalidate',
  SYSTEM_STATUS = 'system/status',
}

export interface CacheInvalidationRequest {
  path: string;
}

export interface CacheInvalidationResponse {
  success: boolean;
  message: string;
  invalidatedPaths: string[];
}

export interface SystemStatusResponse {
  status: string;
  timestamp: string;
  version: string;
}

export async function invalidateCache(
  request: CacheInvalidationRequest
): Promise<CacheInvalidationResponse> {
  const response: AxiosResponse<CacheInvalidationResponse> = await api.post(
    SYSTEM.INVALIDATE_CACHE,
    request
  );
  return response.data;
}

export async function getSystemStatus(): Promise<SystemStatusResponse> {
  const response: AxiosResponse<SystemStatusResponse> = await api.get(
    SYSTEM.SYSTEM_STATUS
  );
  return response.data;
}
