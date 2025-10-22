import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';
import { ContractType, MarketingCampaignStatus } from '@/utils/constants';
import { CarWashPosType } from '../pos';

enum MARKETING {
  GET_LOYALTY = 'user/loyalty/client',
  GET_TAG = 'user/loyalty/tag',
  LOYALTY = 'user/loyalty',
  LOYALTY_HUB_REQUESTS = 'user/loyalty/hub-requests',
  APPROVE_REQUEST = 'user/loyalty/requests/approve',
  REJECT_REQUEST = 'user/loyalty/requests/reject',
  PARTICIPANT_REQUEST = 'user/loyalty/participant-request',
  PARTICIPANT_REQUESTS = 'user/loyalty/participant-requests',
  PUBLIC_PROGRAMS = 'user/loyalty/public-programs',
}

export enum UserType {
  PHYSICAL = 'PHYSICAL',
  LEGAL = 'LEGAL',
}

enum StatusUser {
  VERIFICATE = 'VERIFICATE',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

export enum LoyaltyProgramStatus {
  ACTIVE = 'ACTIVE',
  PAUSE = 'PAUSE',
}

export enum BenefitType {
  CASHBACK = 'CASHBACK',
  DISCOUNT = 'DISCOUNT',
  GIFT_POINTS = 'GIFT_POINTS',
}

export enum MarketingCampaignType {
  PROMOCODE = 'PROMOCODE',
  DISCOUNT = 'DISCOUNT',
}

export enum MarketingDiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export type ClientRequestBody = {
  name: string;
  birthday?: Date;
  phone: string;
  email?: string;
  gender?: string;
  type?: UserType;
  contractType?: ContractType;
  inn?: string;
  comment?: string;
  placementId?: number;
  devNumber?: number;
  number?: number;
  monthlyLimit?: number;
  cardId?: number;
};

type ClientResponseBody = {
  id: number;
  name: string;
  birthday?: Date;
  phone: string;
  email?: string;
  gender?: string;
  status: StatusUser;
  contractType: ContractType;
  inn?: string;
  comment?: string;
  refreshTokenId?: string;
  placementId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  type: UserType;
  tags: {
    id: number;
    name: string;
    color: string;
  }[];
  card: {
    id: number;
    balance: number;
    mobileUserId: number;
    devNumber: number;
    number: number;
    monthlyLimit?: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
};

type ClientsParams = {
  placementId: number | string;
  contractType: UserType | string;
  tagIds?: number[];
  phone?: string;
  page?: number;
  size?: number;
  workerCorporateId?: number;
  organizationId?: number;
  registrationFrom?: string;
  registrationTo?: string;
  search?: string;
};

export type ClientsResponse = {
  id: number;
  name: string;
  phone: string;
  status: string;
  type: UserType;
  comment?: string;
  placementId?: number;
  tags: {
    id: number;
    name: string;
    color: string;
  }[];
};

type TagRequest = {
  name: string;
  color: string;
};

type TagResponse = {
  props: {
    id: number;
    name: string;
    color: string;
  };
};

export type TagsType = TagResponse['props'];

type DeleteTagResponse = {
  status: 'SUCCESS';
};

type LoyaltyProgramsRequest = {
  name: string;
  organizationIds: number[];
  ownerOrganizationId: number;
  lifetimeDays?: number;
};

type UpdateLoyaltyRequest = {
  loyaltyProgramId: number;
  name?: string;
  organizationIds?: number[];
};

export type LoyaltyProgramsResponse = {
  props: {
    id: number;
    name: string;
    status: LoyaltyProgramStatus;
    startDate: Date;
    lifetimeDays?: number;
    ownerOrganizationId: number | null;
    isHub: boolean;
    isHubRejected: boolean;
    isHubRequested: boolean;
    isPublic: boolean;
    participantId: number;
  };
};

export type LoyaltyProgramsByIdResponse = {
  id: number;
  name: string;
  status: LoyaltyProgramStatus;
  isHub: boolean;
  isHubRequested: boolean;
  isHubRejected: boolean;
  organizations: {
    id: number;
    name: string;
  }[];
  startDate: Date;
  lifetimeDays?: number;
  description?: string;
  maxLevels?: number;
  burnoutType?: BonusBurnoutType;
  lifetimeBonusDays?: number;
  maxRedeemPercentage?: number;
  hasBonusWithSale?: boolean;
  ownerOrganizationId: number;
};

type TierRequest = {
  name: string;
  description?: string;
  loyaltyProgramId: number;
  limitBenefit: number;
};

type TierResponse = {
  props: {
    id: number;
    name: string;
    description?: string;
    loyaltyProgramId: number;
    limitBenefit: number;
  };
};

type UpdateTierRequest = {
  loyaltyTierId: number;
  description?: string;
  benefitIds: number[];
};

type TierByIdResponse = {
  id: number;
  name: string;
  description?: string;
  loyaltyProgramId: number;
  limitBenefit: number;
  benefitIds: number[];
};

type BenefitRequest = {
  name: string;
  type: BenefitType;
  bonus: number;
  benefitActionTypeId?: number;
  ltyProgramId: number
};

type BenefitResponse = {
  props: {
    id: number;
    name: string;
    benefitType: BenefitType;
    bonus: number;
    benefitActionTypeId?: number;
  };
};

type BenefitActionRequest = {
  name: string;
  description?: string;
};

type BenefitActionResponse = {
  props: {
    id: number;
    name: string;
    description?: string;
  };
};

type AllTiersRequest = {
  programId: number | '*';
};

type UpdateBenefitBody = {
  benefitId: number;
  name?: string;
  bonus?: number;
  benefitType?: BenefitType;
};

export async function createClient(
  body: ClientRequestBody
): Promise<ClientResponseBody> {
  const response: AxiosResponse<ClientResponseBody> = await api.post(
    MARKETING.GET_LOYALTY,
    body
  );
  return response.data;
}

export async function updateClient(
  body: ClientUpdate
): Promise<ClientResponseBody> {
  const response: AxiosResponse<ClientResponseBody> = await api.patch(
    MARKETING.GET_LOYALTY,
    body
  );
  return response.data;
}

export type ClientsPaginatedResponse = {
  data: ClientsResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export async function getClients(
  params: ClientsParams
): Promise<ClientsPaginatedResponse> {
  const response: AxiosResponse<ClientsPaginatedResponse> = await api.get(
    MARKETING.GET_LOYALTY + `s`,
    { params }
  );

  return response.data;
}

export async function getClientById(id: number): Promise<ClientResponseBody> {
  const response: AxiosResponse<ClientResponseBody> = await api.get(
    MARKETING.GET_LOYALTY + `/${id}`
  );

  return response.data;
}

export async function createTag(body: TagRequest): Promise<TagResponse> {
  const response: AxiosResponse<TagResponse> = await api.post(
    MARKETING.GET_TAG,
    body
  );
  return response.data;
}

export async function getTags(): Promise<TagResponse[]> {
  const response: AxiosResponse<TagResponse[]> = await api.get(
    MARKETING.GET_TAG
  );

  return response.data;
}

export async function deleteTag(id: number): Promise<DeleteTagResponse> {
  const response: AxiosResponse<DeleteTagResponse> = await api.delete(
    MARKETING.GET_TAG + `/${id}`
  );

  return response.data;
}

export async function createLoyaltyProgram(
  body: LoyaltyProgramsRequest
): Promise<LoyaltyProgramsResponse> {
  const response: AxiosResponse<LoyaltyProgramsResponse> = await api.post(
    MARKETING.LOYALTY + '/program',
    body
  );
  return response.data;
}

export async function updateLoyaltyProgram(
  body: UpdateLoyaltyRequest
): Promise<LoyaltyProgramsResponse> {
  const response: AxiosResponse<LoyaltyProgramsResponse> = await api.patch(
    MARKETING.LOYALTY + '/program',
    body
  );
  return response.data;
}

export async function getLoyaltyPrograms(
  orgId?: number
): Promise<LoyaltyProgramsResponse[]> {
  const response: AxiosResponse<LoyaltyProgramsResponse[]> = await api.get(
    MARKETING.LOYALTY + `/participant-programs?organizationId=${orgId || ''}`
  );

  return response.data;
}

export async function getLoyaltyProgramById(
  id: number
): Promise<LoyaltyProgramsByIdResponse> {
  const response: AxiosResponse<LoyaltyProgramsByIdResponse> = await api.get(
    MARKETING.LOYALTY + `/program/${id}`
  );

  return response.data;
}

export async function requestHubStatus(
  id: number,
  comment?: string
): Promise<{ success: boolean }> {
  const response: AxiosResponse<{ success: boolean }> = await api.post(
    MARKETING.LOYALTY + `/programs/${id}/request-hub`,
    { comment }
  );

  return response.data;
}

export async function createTier(body: TierRequest): Promise<TierResponse> {
  const response: AxiosResponse<TierResponse> = await api.post(
    MARKETING.LOYALTY + '/tier',
    body
  );
  return response.data;
}

export async function updateTier(
  body: UpdateTierRequest
): Promise<TierResponse> {
  const response: AxiosResponse<TierResponse> = await api.patch(
    MARKETING.LOYALTY + '/tier',
    body
  );
  return response.data;
}

export async function getTiers(
  params: AllTiersRequest
): Promise<TierByIdResponse[]> {
  const response: AxiosResponse<TierByIdResponse[]> = await api.get(
    MARKETING.LOYALTY + '/tiers',
    { params }
  );

  return response.data;
}

export async function getTierById(id: number): Promise<TierByIdResponse> {
  const response: AxiosResponse<TierByIdResponse> = await api.get(
    MARKETING.LOYALTY + `/tier/${id}`
  );

  return response.data;
}

export async function deleteTier(id: number): Promise<{ status: 'SUCCESS' }> {
  const response: AxiosResponse<{ status: 'SUCCESS' }> = await api.delete(
    MARKETING.LOYALTY + `/tier/${id}`
  );
  return response.data;
}

export async function createBenefit(
  body: BenefitRequest
): Promise<BenefitResponse> {
  const response: AxiosResponse<BenefitResponse> = await api.post(
    MARKETING.LOYALTY + '/benefit',
    body
  );
  return response.data;
}

export async function getBenefits(): Promise<BenefitResponse[]> {
  const response: AxiosResponse<BenefitResponse[]> = await api.get(
    MARKETING.LOYALTY + `/benefits`
  );

  return response.data;
}

export async function createBenefitAction(
  body: BenefitActionRequest
): Promise<BenefitActionResponse> {
  const response: AxiosResponse<BenefitActionResponse> = await api.post(
    MARKETING.LOYALTY + '/benefit-action',
    body
  );
  return response.data;
}

export async function getBenefitActions(): Promise<BenefitActionResponse[]> {
  const response: AxiosResponse<BenefitActionResponse[]> = await api.get(
    MARKETING.LOYALTY + `/benefit-actions`
  );

  return response.data;
}

export async function getBenefitById(id: number): Promise<BenefitResponse> {
  const response: AxiosResponse<BenefitResponse> = await api.get(
    MARKETING.LOYALTY + `/benefit/${id}`
  );

  return response.data;
}

export async function updateBenefit(
  body: UpdateBenefitBody
): Promise<BenefitResponse> {
  const response: AxiosResponse<BenefitResponse> = await api.patch(
    MARKETING.LOYALTY + '/benefit',
    body
  );
  return response.data;
}

export type ClientUpdate = {
  clientId: number;
  name?: string;
  type?: UserType;
  inn?: string;
  comment?: string;
  placementId?: number;
  monthlyLimit?: number;
  tagIds?: number[];
  email?: string;
};

export type GetCardsPayload = {
  organizationId?: number;
  unqNumber?: string;
  unnasigned?: boolean;
};

export type GetCardsResponse = {
  id?: number;
  balance: number;
  mobileUserId: number;
  devNumber: string;
  number: string;
  monthlyLimit?: number;
  loyaltyCardTierId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}[];

export async function getCards(
  params: GetCardsPayload
): Promise<GetCardsResponse> {
  const response: { data: { props: GetCardsResponse[0] }[] } = await api.get(
    'user/loyalty/cards',
    { params }
  );
  return response.data.map(d => d.props);
}

export type ClientKeyStatsDto = {
  clientId: number;
  organizationId: number;
};

export type UserKeyStatsResponseDto = {
  clientId: number;
  organizationId: number;
  organizationName: string;
  clientName: string;
  totalAmountSpent: number;
  averageOrderAmount: number;
  totalOrdersCount: number;
  cardBalance: number;
  lastOrderDate?: Date;
  firstOrderDate?: Date;
  cardNumber: string;
  cardDevNumber: string;
};

export async function getUserKeyStatsByOrganizationId(
  params: ClientKeyStatsDto
): Promise<UserKeyStatsResponseDto> {
  const response: AxiosResponse<UserKeyStatsResponseDto> = await api.get(
    'user/loyalty/user-key-stats',
    { params }
  );
  return response.data;
}

export type ClientLoyaltyStatsDto = {
  clientId: number;
  organizationId: number;
};

export type ClientLoyaltyStatsResponseDto = {
  clientId: number;
  organizationId: number;
  organizationName: string;
  clientName: string;
  totalPurchaseAmount: number;
  accumulatedAmount: number;
  amountToNextTier: number;
  activeBonuses: number;
  totalBonusEarned: number;
  cardNumber: string;
  cardDevNumber: string;
  currentTierName?: string;
  nextTierName?: string;
  currentTierId?: number;
  nextTierId?: number;
};

export async function getClientLoyaltyStats(
  params: ClientLoyaltyStatsDto
): Promise<ClientLoyaltyStatsResponseDto> {
  const response: AxiosResponse<ClientLoyaltyStatsResponseDto> = await api.get(
    'user/loyalty/client-loyalty-stats',
    { params }
  );
  return response.data;
}

export type ImportCardsRequest = {
  file: File;
  organizationId: number;
};

export type ImportCardsResponse = {
  success: boolean;
  message: string;
  importedCount: number;
  errors?: string[];
};

export async function importCards(
  request: ImportCardsRequest
): Promise<ImportCardsResponse> {
  console.log('API function called with:', request);
  console.log('File object:', request.file);
  console.log('File size:', request.file.size);
  console.log('File name:', request.file.name);

  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('organizationId', request.organizationId.toString());

  const response: AxiosResponse<ImportCardsResponse> = await api.post(
    'user/loyalty/import-cards',
    formData
  );
  return response.data;
}

export type CorporateClientResponse = {
  id: number;
  name: string;
  inn: string;
  address: string;
  ownerPhone: string;
  ownerName: string;
  ownerEmail: string;
  ownerAvatar: string;
  dateRegistered: string;
  status: string;
  organizationId: number;
};

export type CorporateClientsParams = {
  placementId?: number | string;
  search?: string;
  inn?: string;
  ownerPhone?: string;
  name?: string;
  page?: number;
  size?: number;
  registrationFrom?: string;
  registrationTo?: string;
  organizationId?: number;
};

export type CorporateClientsPaginatedResponse = {
  data: CorporateClientResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export async function getCorporateClients(
  params: CorporateClientsParams
): Promise<CorporateClientsPaginatedResponse> {
  const response: AxiosResponse<CorporateClientsPaginatedResponse> =
    await api.get('user/loyalty/corporate-clients', { params });

  return response.data;
}

export async function getCorporateClientById(
  id: number
): Promise<CorporateClientResponse> {
  const response: AxiosResponse<CorporateClientResponse> = await api.get(
    `user/loyalty/corporate-clients/${id}`
  );

  return response.data;
}

export type CreateCorporateClientRequest = {
  name: string;
  inn: string;
  address: string;
  organizationId: number;
};

export type UpdateCorporateClientRequest = {
  name?: string;
  inn?: string;
  address?: string;
  organizationId: number;
};

type CorporateClientStatsResponse = {
  totalBalance: number;
  numberOfCards: number;
};

type CorporateClientCardsParams = {
  page?: number;
  size?: number;
  search?: string;
};

type CorporateClientCardsResponse = {
  data: {
    id: number;
    ownerName: string;
    cardUnqNumber: string;
    cardNumber: string;
    cardBalance: number;
    cardTier?: {
      name: string;
      limitBenefit: number;
    } | null;
  }[];
  total: number;
  skip: number;
  take: number;
};

type CorporateCardOperationResponse = {
  id: number;
  transactionId: string;
  cardId: number;
  cardUnqNumber: string;
  cardNumber: string;
  ownerName: string;
  sumFull: number;
  sumReal: number;
  sumBonus: number;
  sumDiscount: number;
  sumCashback: number;
  platform: string;
  contractType: string;
  orderData: Date;
  createData: Date;
  orderStatus: string;
  orderHandlerStatus?: string;
  carWashDeviceId: number;
  carWashDeviceName?: string;
};

type CorporateCardsOperationsPaginatedResponse = {
  data: CorporateCardOperationResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type MarketingCampaignResponse = {
  id: number;
  name: string;
  status: string;
  type: string;
  launchDate: string;
  endDate?: string;
  description?: string;
  ltyProgramId?: number;
  ltyProgramName?: string;
  discountType: string;
  discountValue: number;
  promocode?: string;
  maxUsage?: number;
  currentUsage: number;
  posCount: number;
  posIds: number[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
  };
  updatedBy: {
    id: number;
    name: string;
  };
};

export type MarketingCampaignsFilterDto = {
  page?: number;
  size?: number;
  organizationId: number;
  status?: MarketingCampaignStatus;
  search?: string;
};

export type MarketingCampaignsPaginatedResponseDto = {
  data: MarketingCampaignResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type MarketingCampaignRequest = {
  name: string;
  type: MarketingCampaignType;
  launchDate: Date;
  endDate?: Date;
  description?: string;
  ltyProgramId?: number;
  posIds: number[];
  discountType: MarketingDiscountType;
  discountValue: number;
  promocode?: string;
  maxUsage?: number;
  status: MarketingCampaignStatus;
  ltyProgramParticipantId: number;
};

export type UpdateMarketingCampaignRequest = {
  name?: string;
  type?: MarketingCampaignType;
  launchDate?: Date;
  endDate?: Date;
  description?: string;
  ltyProgramId?: number;
  posIds?: number[];
  discountType?: MarketingDiscountType;
  discountValue?: number;
  promocode?: string;
  maxUsage?: number;
  ltyProgramParticipantId: number;
};

export async function createCorporateClient(
  request: CreateCorporateClientRequest
): Promise<CorporateClientResponse> {
  const response: AxiosResponse<CorporateClientResponse> = await api.post(
    'user/loyalty/corporate-clients',
    request
  );
  return response.data;
}

export async function updateCorporateClient(
  id: number,
  request: UpdateCorporateClientRequest
): Promise<CorporateClientResponse> {
  const response: AxiosResponse<CorporateClientResponse> = await api.put(
    `user/loyalty/corporate-clients/${id}`,
    request
  );
  return response.data;
}

export async function getCorporateClientStatsById(
  id: number
): Promise<CorporateClientStatsResponse> {
  const response: AxiosResponse<CorporateClientStatsResponse> = await api.get(
    `user/loyalty/corporate-clients/${id}/stats`
  );

  return response.data;
}

export async function getCorporateClientCardsById(
  id: number,
  params: CorporateClientCardsParams
): Promise<CorporateClientCardsResponse> {
  const response: AxiosResponse<CorporateClientCardsResponse> = await api.get(
    `user/loyalty/corporate-clients/${id}/cards`,
    { params }
  );

  return response.data;
}

export async function getCorporateClientOperationsById(
  id: number,
  params: CorporateClientCardsParams
): Promise<CorporateCardsOperationsPaginatedResponse> {
  const response: AxiosResponse<CorporateCardsOperationsPaginatedResponse> =
    await api.get(`user/loyalty/corporate-clients/${id}/cards/operations`, {
      params,
    });

  return response.data;
}

export async function getMarketingCampaign(
  filters: MarketingCampaignsFilterDto
): Promise<MarketingCampaignsPaginatedResponseDto> {
  const response: AxiosResponse<MarketingCampaignsPaginatedResponseDto> =
    await api.get('user/loyalty/marketing-campaigns', { params: filters });

  return response.data;
}

export async function createMarketingCampaign(
  request: MarketingCampaignRequest
): Promise<MarketingCampaignResponse> {
  const response: AxiosResponse<MarketingCampaignResponse> = await api.post(
    'user/loyalty/marketing-campaigns',
    request
  );
  return response.data;
}

export async function getMarketingCampaignById(
  id: number
): Promise<MarketingCampaignResponse> {
  const response: AxiosResponse<MarketingCampaignResponse> = await api.get(
    `user/loyalty/marketing-campaigns/${id}`
  );

  return response.data;
}

export async function updateMarketingCampaign(
  id: number,
  request: UpdateMarketingCampaignRequest
): Promise<MarketingCampaignResponse> {
  const response: AxiosResponse<MarketingCampaignResponse> = await api.put(
    `user/loyalty/marketing-campaigns/${id}`,
    request
  );
  return response.data;
}

type LoyaltyProgramPermissionsResponse = {
  id: number;
  name: string;
};

export async function getLoyaltyProgramPermissionById(
  userId: number
): Promise<LoyaltyProgramPermissionsResponse[]> {
  const response: AxiosResponse<LoyaltyProgramPermissionsResponse[]> =
    await api.get(`user/permission/loyalty-program/${userId}`);

  return response.data;
}

export async function getLoyaltyProgramPermissionByOrgId(params: {
  organizationId?: string;
}): Promise<LoyaltyProgramPermissionsResponse[]> {
  const response: AxiosResponse<LoyaltyProgramPermissionsResponse[]> =
    await api.get(`user/permission/loyalty-program`, { params });

  return response.data;
}

export async function loyaltyProgramsConnection(
  userId: number,
  request: { loyaltyProgramIds: number[] }
): Promise<{ status: 'SUCCESS' }> {
  const response: AxiosResponse<{ status: 'SUCCESS' }> = await api.patch(
    `user/permission/loyalty-program-user/${userId}`,
    request
  );
  return response.data;
}

// Loyalty Requests Types and Functions
export enum LoyaltyRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LoyaltyRequestType {
  BONUS_POINTS = 'BONUS_POINTS',
  DISCOUNT = 'DISCOUNT',
}

export enum LTYProgramRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type LoyaltyRequest = {
  id: number;
  ltyProgramId: number;
  ltyProgramName: string;
  organizationId: number;
  organizationName: string;
  status: LTYProgramRequestStatus;
  requestedAt: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  reviewedBy?: number;
  reviewerName?: string;
  requestComment?: string;
  responseComment?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LoyaltyHubRequestsParams = {
  page?: number;
  size?: number;
  status?: LoyaltyRequestStatus;
  search?: string;
  organizationId?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type LoyaltyRequestsResponse = {
  data: LoyaltyRequest[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type LoyaltyProgramCreateBody = {
  name: string;
  ownerOrganizationId: number;
  description: string;
  maxLevels: number;
};

export type BonusBurnoutType = 'year' | 'month' | 'custom' | "never";

export type BonusRedemptionUpdate = {
  loyaltyProgramId: number;
  burnoutType: BonusBurnoutType;
  lifetimeBonusDays?: number;
  maxRedeemPercentage: number;
  hasBonusWithSale: boolean;
};

export type BonusRedemptionRules = BonusRedemptionUpdate;

enum LTYProgramStatus {
  ACTIVE = 'ACTIVE',
  PAUSE = 'PAUSE',
}

type LoyaltyProgramResponse = {
  props: {
    id?: number;
    name: string;
    status: LTYProgramStatus;
    ownerOrganizationId: number;
    startDate: Date;
    lifetimeDays?: number;
    isHub?: boolean;
    isHubRequested?: boolean;
    isHubRejected?: boolean;
    isPublic?: boolean;
    programParticipantOrganizationIds?: number[];
    description?: string;
    maxLevels: number;
  };
};

export type PosResponse = {
  id: number;
  name: string;
  slug: string;
  startTime?: string;
  endTime?: string;
  organizationId: number;
  placementId: number;
  posMetaData: string;
  timezone: number;
  image: string;
  rating: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  updatedById: number;
  address: {
    id: number;
    city: string;
    location: string;
    lat: string;
    lon: string;
  };
  posType: {
    id: number;
    name: string;
    slug: string;
    carWashPosType: CarWashPosType;
    minSumOrder: number;
    maxSumOrder: number;
    stepSumOrder: number;
  };
};

export async function getLoyaltyHubRequests(
  params: LoyaltyHubRequestsParams
): Promise<LoyaltyRequestsResponse> {
  const response: AxiosResponse<LoyaltyRequestsResponse> = await api.get(
    MARKETING.LOYALTY_HUB_REQUESTS,
    { params }
  );
  return response.data;
}

export async function approveLoyaltyHubRequest(
  requestId: number,
  comment?: string
): Promise<{ status: 'SUCCESS' }> {
  const response: AxiosResponse<{ status: 'SUCCESS' }> = await api.put(
    `user/loyalty/programs/${requestId}/approve-hub`,
    { comment }
  );
  return response.data;
}

export async function rejectLoyaltyHubRequest(
  requestId: number,
  comment?: string
): Promise<{ status: 'SUCCESS' }> {
  const response: AxiosResponse<{ status: 'SUCCESS' }> = await api.put(
    `user/loyalty/programs/${requestId}/reject-hub`,
    { comment }
  );
  return response.data;
}

// Participant Request Types and Functions
export type LoyaltyProgramParticipantRequestDto = {
  ltyProgramId: number;
  organizationId: number;
  requestComment?: string;
};

export type ParticipantRequestResponse = {
  success: boolean;
  message: string;
};

export async function createParticipantRequest(
  request: LoyaltyProgramParticipantRequestDto
): Promise<ParticipantRequestResponse> {
  const response: AxiosResponse<ParticipantRequestResponse> = await api.post(
    MARKETING.PARTICIPANT_REQUEST,
    request
  );
  return response.data;
}

export type PublicProgramsParams = {
  status?: LoyaltyProgramStatus;
  page?: number;
  size?: number;
};

export type PublicProgramResponse = {
  id: number;
  name: string;
  status: LoyaltyProgramStatus;
  startDate: Date;
  lifetimeDays?: number;
  ownerOrganizationId: number | null;
  ownerOrganizationName?: string;
  description?: string;
};

export type PublicProgramsPaginatedResponse = {
  programs: PublicProgramResponse[];
  total: number;
  page: number;
  size: number;
};

export async function getPublicLoyaltyPrograms(
  params: PublicProgramsParams = {}
): Promise<PublicProgramsPaginatedResponse> {
  const response: AxiosResponse<PublicProgramsPaginatedResponse> =
    await api.get(MARKETING.PUBLIC_PROGRAMS, { params });
  return response.data;
}

export type LoyaltyParticipantRequest = {
  id: number;
  ltyProgramId: number;
  ltyProgramName: string;
  organizationId: number;
  organizationName: string;
  status: LTYProgramRequestStatus;
  requestComment?: string;
  responseComment?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LoyaltyParticipantRequestsParams = {
  page?: number;
  size?: number;
  status?: LTYProgramRequestStatus;
  search?: string;
  organizationId?: number;
  ltyProgramId?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type LoyaltyParticipantRequestsResponse = {
  data: LoyaltyParticipantRequest[];
  totalCount: number;
  page: number;
  size: number;
};

export async function getLoyaltyParticipantRequests(
  params: LoyaltyParticipantRequestsParams
): Promise<LoyaltyParticipantRequestsResponse> {
  const response: AxiosResponse<LoyaltyParticipantRequestsResponse> =
    await api.get(MARKETING.PARTICIPANT_REQUESTS, { params });
  return response.data;
}

export async function approveLoyaltyParticipantRequest(
  requestId: number,
  comment?: string
): Promise<{ status: 'SUCCESS' }> {
  const response: AxiosResponse<{ status: 'SUCCESS' }> = await api.put(
    `user/loyalty/programs/${requestId}/approve-participant`,
    { comment }
  );
  return response.data;
}

export async function rejectLoyaltyParticipantRequest(
  requestId: number,
  comment?: string
): Promise<{ status: 'SUCCESS' }> {
  const response: AxiosResponse<{ status: 'SUCCESS' }> = await api.put(
    `user/loyalty/programs/${requestId}/reject-participant`,
    { comment }
  );
  return response.data;
}

export async function createNewLoyaltyProgram(
  request: LoyaltyProgramCreateBody
): Promise<LoyaltyProgramResponse> {
  const response: AxiosResponse<LoyaltyProgramResponse> = await api.post(
    'user/loyalty/program',
    request
  );
  return response.data;
}

export async function patchBonusRedemption(
  request: BonusRedemptionUpdate
): Promise<LoyaltyProgramResponse> {
  const response: AxiosResponse<LoyaltyProgramResponse> = await api.patch(
    'user/loyalty/program/bonus-redemption-rules',
    request
  );
  return response.data;
}

export async function getBonusRedemptionRules(
  loyaltyProgramId: number
): Promise<BonusRedemptionRules> {
  const response: AxiosResponse<BonusRedemptionRules> = await api.get(
    'user/loyalty/program/bonus-redemption-rules',
    { params: { loyaltyProgramId } }
  );
  return response.data;
}

export async function getPosesParticipants(id: number): Promise<PosResponse[]> {
  const response: AxiosResponse<PosResponse[]> = await api.get(
    `user/loyalty/program/${id}/participant-poses`
  );

  return response.data;
}

export type LoyaltyProgramUpdateBody = {
  loyaltyProgramId: number;
  name?: string;
  description?: string;
  maxLevels?: number;
};

export async function updateNewLoyaltyProgram(
  request: LoyaltyProgramUpdateBody
): Promise<LoyaltyProgramResponse> {
  const response: AxiosResponse<LoyaltyProgramResponse> = await api.patch(
    'user/loyalty/program',
    request
  );
  return response.data;
}

export type LoyaltyProgramAnalyticsResponse = {
  connectedPoses: number;
  engagedClients: number;
  programDurationDays: number;
};

export async function getLoyaltyProgramAnalytics(
  programId: number
): Promise<LoyaltyProgramAnalyticsResponse> {
  const response: AxiosResponse<LoyaltyProgramAnalyticsResponse> = await api.get(
    `user/loyalty/program/${programId}/analytics`
  );
  return response.data;
}

export type TransactionAnalyticsParams = {
  period?: 'custom' | 'lastMonth' | 'lastWeek' | 'lastYear';
  startDate?: string;
  endDate?: string;
};

export type TransactionAnalyticsDataPoint = {
  date: string;
  accruals: number;
  debits: number;
};

export type TransactionAnalyticsResponse = {
  data: TransactionAnalyticsDataPoint[];
  totalAccruals: number;
  totalDebits: number;
  period: string;
};

export async function getLoyaltyProgramTransactionAnalytics(
  programId: number,
  params: TransactionAnalyticsParams = {}
): Promise<TransactionAnalyticsResponse> {
  const response: AxiosResponse<TransactionAnalyticsResponse> = await api.get(
    `user/loyalty/program/${programId}/transaction-analytics`,
    { params }
  );
  return response.data;
}