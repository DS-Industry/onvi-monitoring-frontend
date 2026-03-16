import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

const SUBSCRIPTION_REQUEST = 'user/subscription/request';
const SUBSCRIPTION_REQUESTS_LIST = 'user/subscription/requests';
const ACTIVE_SUBSCRIPTION =
  'user/subscription/organization/:organizationId/active-subscription';
const ORGANIZATION_SUBSCRIPTIONS = 'user/subscription/subscriptions';

export type SubscriptionPlanCode =
  | 'BASIC'
  | 'SPACE'
  | 'BUSINESS'
  | 'CUSTOM';

export type SubscriptionRequestConnectionType =
  | 'DS_EQUIPMENT'
  | 'COUPLING_MODULE';

export type CreateSubscriptionRequestBody = {
  subscriptionPlan: SubscriptionPlanCode;
  onviFeature: boolean;
  corporateClientsFeature: boolean;
  connectionType?: SubscriptionRequestConnectionType | null;
  organizationId: number;
  posesCount?: number;
  usersCount?: number;
};

export interface SubscriptionRequestResponse {
  id: number;
  organizationId: number;
  requestedPlanId: number;
  planCode?: SubscriptionPlanCode;
  connectionType: string | null;
  status: string;
  requestedAt: string;
  posesCount: number | null;
  usersCount: number | null;
  onviFeature?: boolean;
  corporateClientsFeature?: boolean;
}

export interface SubscriptionRequestResponseDto {
  id: number;
  organizationId: number;
  requestedPlanId: number;
  planCode?: SubscriptionPlanCode;
  connectionType: string | null;
  status: string;
  requestedAt: string;
  posesCount: number | null;
  usersCount: number | null;
  onviFeature?: boolean;
  corporateClientsFeature?: boolean;
}

export interface SubscriptionRequestItem {
  id: number;
  organizationId: number;
  requestedPlanId: number;
  planCode?: string;
  connectionType: string | null;
  status: string;
  requestedAt: string;
  posesCount: number | null;
  usersCount: number | null;
  onviFeature: boolean;
  corporateClientsFeature: boolean;
  ownerName?: string | null;
  ownerEmail?: string | null;
  posRequests?: Array<{
    id: number;
    name: string;
    address: string;
    organizationId: number;
    numberOfBoxes: number | null;
    numberOfVacuums: number | null;
    posMigrationId: number | null;
    status: string;
  }>;
}

export interface SubscriptionRequestsResponse {
  data: SubscriptionRequestItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type SubscriptionRequestListStatus =
  | 'PENDING'
  | 'READY'
  | 'PAYMENT_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export type SubscriptionRequestStatus = SubscriptionRequestListStatus;

export interface GetSubscriptionRequestsListParams {
  organizationId?: number;
  status?: SubscriptionRequestListStatus;
  page?: number;
  size?: number;
}

export async function getSubscriptionRequestsList(
  params: GetSubscriptionRequestsListParams = {}
): Promise<SubscriptionRequestsResponse> {
  const { organizationId, status, page = 1, size = 10 } = params;
  const response = await api.get<SubscriptionRequestsResponse>(
    SUBSCRIPTION_REQUESTS_LIST,
    {
      params: {
        ...(organizationId != null && organizationId >= 1 && { organizationId }),
        ...(status && { status }),
        page,
        size,
      },
    }
  );
  return response.data;
}

export async function updateSubscriptionRequestStatus(
  id: number,
  status: SubscriptionRequestStatus
): Promise<SubscriptionRequestResponseDto> {
  const response: AxiosResponse<SubscriptionRequestResponseDto> =
    await api.patch(`user/subscription/request/${id}/status`, {
      status,
    });
  return response.data;
}

export async function requestSubscriptionPayment(
  id: number
): Promise<SubscriptionRequestResponseDto> {
  const response: AxiosResponse<SubscriptionRequestResponseDto> =
    await api.patch(`user/subscription/request/${id}/request-payment`);
  return response.data;
}

export interface CreateSubscriptionFromRequestResponse {
  subscriptionId: number;
  invoiceId: number;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
}

export async function createSubscriptionFromRequest(
  id: number
): Promise<CreateSubscriptionFromRequestResponse> {
  const response: AxiosResponse<CreateSubscriptionFromRequestResponse> =
    await api.post(`user/subscription/request/${id}/subscription`);
  return response.data;
}

export async function getSubscriptionRequests(
  organizationId: number
): Promise<SubscriptionRequestResponseDto[]> {
  const response = await api.get(SUBSCRIPTION_REQUEST, {
    params: { organizationId },
  });
  const data = response.data as
    | SubscriptionRequestResponseDto[]
    | SubscriptionRequestResponseDto
    | { data?: SubscriptionRequestResponseDto[] };
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { data?: SubscriptionRequestResponseDto[] }).data))
    return (data as { data: SubscriptionRequestResponseDto[] }).data;
  if (data && typeof data === 'object' && 'id' in data && 'organizationId' in data)
    return [data as SubscriptionRequestResponseDto];
  return [];
}

export interface OrganizationSubscriptionInvoiceShortDto {
  id?: number;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  invoiceLink: string | null;
}

export interface OrganizationSubscriptionResponseDto {
  id: number;
  organizationId: number;
  planId: number;
  planCode?: SubscriptionPlanCode;
  planName: string;
  connectionType: string | null;
  status: string;
  startedAt: string;
  endsAt: string | null;
  posesCount: number | null;
  usersCount: number | null;
  onviFeature: boolean;
  corporateClientsFeature: boolean;
  nextBillingAt: string | null;
  planFeatures: string[];
  invoices?: OrganizationSubscriptionInvoiceShortDto[];
}

export async function getActiveSubscription(
  organizationId: number
): Promise<OrganizationSubscriptionResponseDto | null> {
  try {
    const endpoint = ACTIVE_SUBSCRIPTION.replace(
      ':organizationId',
      String(organizationId)
    );
    const response: AxiosResponse<OrganizationSubscriptionResponseDto> =
      await api.get(endpoint);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export interface SubscriptionInvoiceResponseDto {
  id: number;
  subscriptionId: number;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  createdAt: string;
  invoiceLink?: string;
}

export async function getSubscriptionInvoices(
  subscriptionId: number
): Promise<SubscriptionInvoiceResponseDto[]> {
  const response: AxiosResponse<SubscriptionInvoiceResponseDto[]> =
    await api.get(`user/subscription/subscription/${subscriptionId}/invoices`);
  return response.data;
}

export interface CreateSubscriptionInvoicePayload {
  invoiceLink: string;
}

export async function createSubscriptionInvoice(
  subscriptionId: number,
  payload: CreateSubscriptionInvoicePayload
): Promise<SubscriptionInvoiceResponseDto> {
  const response: AxiosResponse<SubscriptionInvoiceResponseDto> =
    await api.post(
      `user/subscription/subscription/${subscriptionId}/invoice`,
      payload
    );
  return response.data;
}

export async function deleteSubscriptionInvoice(
  invoiceId: number
): Promise<void> {
  await api.delete(`user/subscription/invoice/${invoiceId}`);
}

export async function approveSubscriptionInvoice(
  invoiceId: number
): Promise<void> {
  await api.patch(`user/subscription/invoice/${invoiceId}/approve-payment`);
}

export interface GetOrganizationSubscriptionsParams {
  overdue?: boolean;
}

export async function getOrganizationSubscriptions(
  params: GetOrganizationSubscriptionsParams = {}
): Promise<OrganizationSubscriptionResponseDto[]> {
  const response: AxiosResponse<OrganizationSubscriptionResponseDto[]> =
    await api.get(ORGANIZATION_SUBSCRIPTIONS, {
      params: {
        ...(params.overdue != null && { overdue: params.overdue }),
      },
    });
  return response.data;
}

export type UpdateSubscriptionRequestBody = {
  subscriptionPlan?: SubscriptionPlanCode;
  connectionType?: SubscriptionRequestConnectionType | null;
  onviFeature?: boolean;
  corporateClientsFeature?: boolean;
  posesCount?: number;
  usersCount?: number;
};

export async function createSubscriptionRequest(
  body: CreateSubscriptionRequestBody
): Promise<SubscriptionRequestResponse> {
  const response: AxiosResponse<SubscriptionRequestResponse> = await api.post(
    SUBSCRIPTION_REQUEST,
    body
  );
  return response.data;
}

export async function updateSubscriptionRequest(
  requestId: number,
  body: UpdateSubscriptionRequestBody
): Promise<SubscriptionRequestResponse> {
  const response: AxiosResponse<SubscriptionRequestResponse> = await api.patch(
    `${SUBSCRIPTION_REQUEST}/${requestId}`,
    body
  );
  return response.data;
}
