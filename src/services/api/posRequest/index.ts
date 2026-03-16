import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

export interface PosRequestResponseDto {
  id: number;
  name: string;
  address: string;
  organizationId: number;
  numberOfBoxes: number | null;
  numberOfVacuums: number | null;
  posMigrationId: number | null;
  status: string;
}

export interface CreatePosRequestBody {
  name: string;
  address: string;
  organizationId: number;
  numberOfBoxes?: number | null;
  numberOfVacuums?: number | null;
  posMigrationId?: number | null;
}

export interface UpdatePosRequestBody {
  name?: string;
  address?: string;
  numberOfBoxes?: number | null;
  numberOfVacuums?: number | null;
  posMigrationId?: number | null;
}

export async function approvePosRequest(
  id: number
): Promise<PosRequestResponseDto> {
  const response: AxiosResponse<PosRequestResponseDto> = await api.patch(
    `user/pos-request/${id}/approve`
  );
  return response.data;
}

export async function getOrganizationPosRequests(
  organizationId: number
): Promise<PosRequestResponseDto[]> {
  const response: AxiosResponse<PosRequestResponseDto[]> = await api.get(
    `user/pos-request/organization/${organizationId}`
  );
  return response.data;
}

export async function createPosRequest(
  body: CreatePosRequestBody
): Promise<PosRequestResponseDto> {
  const response: AxiosResponse<PosRequestResponseDto> = await api.post(
    'user/pos-request',
    body
  );
  return response.data;
}

export async function updatePosRequest(
  id: number,
  body: UpdatePosRequestBody
): Promise<PosRequestResponseDto> {
  const response: AxiosResponse<PosRequestResponseDto> = await api.patch(
    `user/pos-request/${id}`,
    body
  );
  return response.data;
}

