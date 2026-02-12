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

export enum StatusUser {  
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

export enum CampaignExecutionType {
  TRANSACTIONAL = 'TRANSACTIONAL',
  BEHAVIORAL = 'BEHAVIORAL',
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

export enum OrderStatus {
  COMPLETED = 'COMPLETED',
  CREATED = 'CREATED',
  CANCELED = 'CANCELED',
  PROCESSING = 'PROCESSING',
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  REFUNDED = 'REFUNDED',
  PAYED = 'PAYED'
}

export enum PlatformType {
  ONVI = 'ONVI',
  YANDEX = 'YANDEX',
  LUKOIL = 'LUKOIL',
  LOCAL_LOYALTY = 'LOCAL_LOYALTY',
}

export enum SignOper {
  REPLENISHMENT = 'REPLENISHMENT',
  DEDUCTION = 'DEDUCTION',
}

export type OrderItem = {
  id: number;
  transactionId: string | null;
  orderData: Date;
  createData: Date;
  sumFull: number;
  sumReal: number;
  sumBonus: number;
  sumDiscount: number;
  sumCashback: number;
  platform: PlatformType;
  contractType: ContractType;
  orderStatus: OrderStatus;
  orderHandlerStatus: string | null;
  executionStatus: string | null;
  
  client: {
    id: number;
    name: string;
    phone: string;
  } | null;
  
  card: {
    id: number;
    unqNumber: string;
    number: string;
    balance: number;
  } | null;
  
  device: {
    id: number;
    name: string;
    carWashDeviceType: {
      id: number;
      name: string;
      code: string;
    } | null;
  } | null;
  
  pos: {
    id: number;
    name: string;
  } | null;
  
  bonusOpers: Array<{
    id: number;
    operDate: Date;
    loadDate: Date;
    sum: number;
    comment: string | null;
    type: {
      id: number;
      name: string;
      signOper: SignOper;
    } | null;
  }>;
};

export type LoyaltyProgramOrdersResponse = {
  orders: OrderItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
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
  ltyProgramId: number;
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

export enum ParticipationRole {
  OWNER = 'owner',
  PARTICIPANT = 'participant',
  ALL = 'all',
}

type LoyaltyProgramParams = {
  organizationId: number;
  status?: LoyaltyProgramStatus;
  participationRole?: ParticipationRole;
  page?: number;
  size?: number;
  search?: string;
};

export type LoyaltyProgramParticipantResponseDto = {
  props: {
    id: number;
    name: string;
    status: string;
    startDate: Date;
    isHub: boolean;
    isHubRequested: boolean;
    isHubRejected: boolean;
    lifetimeDays?: number;
    participantId: number;
    ownerOrganizationId: number;
    connectedPoses: number;
    engagedClients: number;
    description?: string;
  };
};

export type LoyaltyParticipantProgramsPaginatedResponse = {
  data: LoyaltyProgramParticipantResponseDto[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
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

export async function getLoyaltyProgramOrders(
  programId: number,
  params?: {
    page?: number;
    size?: number;
    search?: string;
    orderStatus?: string;
    platform?: string;
    contractType?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<LoyaltyProgramOrdersResponse> {
  const response: AxiosResponse<LoyaltyProgramOrdersResponse> = await api.get(
    `${MARKETING.LOYALTY}/program/${programId}/orders`,
    { params }
  );
  return response.data;
}

export async function getLoyaltyProgramsPaginated(
  params: LoyaltyProgramParams
): Promise<LoyaltyParticipantProgramsPaginatedResponse> {
  const response: AxiosResponse<LoyaltyParticipantProgramsPaginatedResponse> =
    await api.get(MARKETING.LOYALTY + `/participant-programs-paginated`, {
      params,
    });

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

export async function deleteLoyaltyProgram(
  id: number
): Promise<{ message: string }> {
  const response: AxiosResponse<{ message: string }> = await api.delete(
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
  status?: StatusUser;
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

export type GetCardsPaginatedPayload = {
  organizationId: number;
  unqNumber?: string;
  number?: string;
  type?: 'VIRTUAL' | 'PHYSICAL';
  isCorporate?: boolean;
  page?: number;
  size?: number;
};

export type CardTier = {
  id: number;
  name: string;
  description: string;
  limitBenefit: number;
};

export type CardItem = {
  id: number;
  balance: number;
  unqNumber: string;
  number: string;
  type: 'VIRTUAL' | 'PHYSICAL';
  createdAt: string;
  updatedAt: string;
  cardTier?: CardTier;
  isCorporate: boolean;
};

export type GetCardsPaginatedResponse = {
  cards: CardItem[];
  total: number;
  page: number;
  size: number;
};

export async function getCardsPaginated(
  params: GetCardsPaginatedPayload
): Promise<GetCardsPaginatedResponse> {
  const response = await api.get('user/loyalty/cards/paginated', { params });
  return response.data;
}

export type GetCardByIdResponse = {
  id: number;
  balance: number;
  unqNumber: string;
  number: string;
  type: 'VIRTUAL' | 'PHYSICAL';
  createdAt: Date | null;
  updatedAt: Date | null;
  cardTier: {
    id: number;
    name: string;
    description: string | null;
    limitBenefit: number;
    ltyProgramId: number;
  } | null;
  corporate: {
    id: number;
    name: string;
    inn: string;
    address: string;
  } | null;
  status: 'INACTIVE' | null;
  limitBenefit: number | null;
};

export async function getCardById(cardId: number): Promise<GetCardByIdResponse> {
  const response = await api.get(`user/loyalty/card/${cardId}`);
  return response.data;
}

export type UpdateCardRequest = {
  cardTierId?: number;
  status?: 'INACTIVE' | null;
};

export type UpdateCardResponse = {
  id: number;
  balance: number;
  mobileUserId: number | null;
  devNumber: string;
  number: string;
  monthlyLimit: number | null;
  loyaltyCardTierId: number | null;
  corporateId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export async function updateCard(
  cardId: number,
  body: UpdateCardRequest
): Promise<UpdateCardResponse> {
  const response = await api.patch(`user/loyalty/card/${cardId}`, body);
  return response.data;
}

export type AssignCardRequest = {
  cardId: number;
  clientId: number;
};

export type AssignCardResponse = {
  id: number;
  balance: number;
  mobileUserId: number;
  devNumber: string;
  number: string;
  monthlyLimit: number | null;
  loyaltyCardTierId: number | null;
  corporateId: number | null;
  createdAt: string;
  updatedAt: string;
};

export async function assignCard(
  body: AssignCardRequest
): Promise<AssignCardResponse> {
  const response: AxiosResponse<AssignCardResponse> = await api.patch(
    'user/loyalty/card/assign',
    body
  );
  return response.data;
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
  totalBonusBurned: number;
  cardNumber: string;
  cardDevNumber: string;
  currentTierName?: string;
  nextTierName?: string;
  currentTierId?: number;
  nextTierId?: number;
  loyaltyProgramName: string;
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
  corporateClientId?: number;
  tierId?: number;
};

export type ImportCardsResponse = {
  successCount: number;
  errorCount: number;
  errors: string[];
  message: string;
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
  if (request.corporateClientId) {
    formData.append('corporateClientId', request.corporateClientId.toString());
  }
  if (request.tierId) {
    formData.append('tierId', request.tierId.toString());
  }
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
  ltyProgramId: number;
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
  ltyProgramHubPlus: boolean;
  discountType: string;
  discountValue: number;
  promocode?: string;
  maxUsage?: number;
  currentUsage: number;
  posCount: number;
  posIds: number[];
  createdAt: string;
  updatedAt: string;
  executionType?: CampaignExecutionType;
  actionType?: ACTION_TYPE;
  actionPayload?: Record<string, any>;
  actionPromocode?: {
    code: string;
    discountType: string;
    discountValue: number;
    id: number;
    maxUsagePerUser: number;
  };
  activeDays?: number;
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
  ltyProgramParticipantId?: number;
  status?: MarketingCampaignStatus;
  activeDays?: number | null;
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

export type CreateCorporateBonusOperationRequest = {
  typeOperId: number;
  sum: number;
  comment?: string;
  carWashDeviceId: number;
};

export type CreateCorporateBonusOperationResponse = {
  id: number;
  cardMobileUserId: number;
  carWashDeviceId: number;
  typeOperId: number;
  operDate: string;
  loadDate: string;
  sum: number;
  comment: string;
  creatorId: number;
  orderMobileUserId: number;
};

export async function createCorporateBonusOperation(
  corporateClientId: number,
  request: CreateCorporateBonusOperationRequest
): Promise<CreateCorporateBonusOperationResponse> {
  const response: AxiosResponse<CreateCorporateBonusOperationResponse> =
    await api.post(
      `user/loyalty/corporate-clients/${corporateClientId}/bonus-operations`,
      request
    );

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
    `user/loyalty/marketing-campaign/edit/${id}`,
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

export type BonusBurnoutType = 'year' | 'month' | 'custom' | 'never';

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
  const response: AxiosResponse<LoyaltyProgramAnalyticsResponse> =
    await api.get(`user/loyalty/program/${programId}/analytics`);
  return response.data;
}

export async function publishLoyaltyProgram(
  id: number
): Promise<LoyaltyProgramResponse> {
  const response: AxiosResponse<LoyaltyProgramResponse> = await api.patch(
    `user/loyalty/program/${id}/publish`
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

export async function unpublishLoyaltyProgram(
  id: number
): Promise<LoyaltyProgramResponse> {
  const response: AxiosResponse<LoyaltyProgramResponse> = await api.patch(
    `user/loyalty/program/${id}/unpublish`
  );
  return response.data;
}

export type MarketingCampaignRequestBody = {
  name: string;
  launchDate: Date;
  endDate?: Date;
  description?: string;
  ltyProgramId: number;
  ltyProgramParticipantId: number;
};

type MarketingCampaignResponseBody = {
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
  executionType?: CampaignExecutionType;
};

export async function createNewMarketingCampaign(
  request: MarketingCampaignRequestBody
): Promise<MarketingCampaignResponseBody> {
  const response: AxiosResponse<MarketingCampaignResponseBody> = await api.post(
    'user/loyalty/marketing-campaign/create',
    request
  );
  return response.data;
}

export enum MarketingCampaignConditionType {
  TIME_RANGE = 'TIME_RANGE',
  WEEKDAY = 'WEEKDAY',
  BIRTHDAY = 'BIRTHDAY',
  VISIT_COUNT = 'VISIT_COUNT',
  PURCHASE_AMOUNT = 'PURCHASE_AMOUNT',
  PROMOCODE_ENTRY = 'PROMOCODE_ENTRY',
}

export enum Weekday {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export type MarketingCampaignConditionResponseDto = {
  id: number;
  type: MarketingCampaignConditionType;
  order: number;
  startTime?: string;
  endTime?: string;
  weekdays?: Weekday[];
  visitCount?: number;
  minAmount?: number;
  maxAmount?: number;
  promocodeId?: number;
  promocode?: {
    id: number;
    code: string;
  };
  benefitId?: number;
  benefit?: {
    id: number;
    name: string;
  };
};

export type MarketingCampaignConditionsResponseDto = {
  campaignId: number;
  conditions: MarketingCampaignConditionResponseDto[];
};

export async function getMarketingConditionsById(
  id: number
): Promise<MarketingCampaignConditionsResponseDto> {
  const response: AxiosResponse<MarketingCampaignConditionsResponseDto> =
    await api.get(`user/loyalty/marketing-campaigns/${id}/conditions`);
  return response.data;
}

export type CreateMarketingCampaignConditionDto = {
  type: MarketingCampaignConditionType;
  order?: number;
  startTime?: Date;
  endTime?: Date;
  weekdays?: Weekday[];
  visitCount?: number;
  minAmount?: number;
  maxAmount?: number;
  promocodeId?: number;
};

export async function createNewMarketingConditions(
  request: CreateMarketingCampaignConditionDto,
  id: number
): Promise<MarketingCampaignConditionsResponseDto> {
  const response: AxiosResponse<MarketingCampaignConditionsResponseDto> =
    await api.post(
      `user/loyalty/marketing-campaigns/${id}/conditions`,
      request
    );
  return response.data;
}

export async function deleteMarketingCondition(
  id: number,
  index: number
): Promise<{ message: string }> {
  const response: AxiosResponse<{ message: string }> = await api.delete(
    `user/loyalty/marketing-campaigns/${id}/conditions/${index}`
  );
  return response.data;
}

export type MarketingCampaignUpdateDto = {
  name?: string;
  type?: 'PROMOCODE' | 'DISCOUNT';
  launchDate?: Date;
  endDate?: Date;
  description?: string;
  ltyProgramId?: number;
  ltyProgramParticipantId?: number;
  posIds?: number[];
  discountType?: 'FIXED' | 'PERCENTAGE';
  discountValue?: number;
  promocode?: string;
  maxUsage?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  executionType?: CampaignExecutionType;
};

export async function updateMarketingCampaigns(
  request: MarketingCampaignUpdateDto,
  id: number
): Promise<MarketingCampaignResponseBody> {
  const response: AxiosResponse<MarketingCampaignResponseBody> = await api.put(
    `user/loyalty/marketing-campaign/edit/${id}`,
    request
  );
  return response.data;
}

export enum MarketingCampaignMobileDisplayType {
  PersonalPromocode = 'PersonalPromocode',
  Promo = 'Promo',
}

export type UpsertMarketingCampaignMobileDisplayDto = {
  type: MarketingCampaignMobileDisplayType;
  imageLink: string;
  description?: string;
};

export type MarketingCampaignMobileDisplayResponseDto = {
  id: number;
  marketingCampaignId: number;
  imageLink: string;
  description?: string;
  type: MarketingCampaignMobileDisplayType;
  createdAt: string;
  updatedAt: string;
} | null;

export async function getMarketingCampaignMobileDisplay(
  id: number
): Promise<MarketingCampaignMobileDisplayResponseDto> {
  const response: AxiosResponse<MarketingCampaignMobileDisplayResponseDto> =
    await api.get(`user/loyalty/marketing-campaigns/${id}/mobile-display`);
  return response.data;
}

export async function upsertMarketingCampaignMobileDisplay(
  id: number,
  request: UpsertMarketingCampaignMobileDisplayDto
): Promise<void> {
  const response: AxiosResponse<void> = await api.put(
    `user/loyalty/marketing-campaigns/${id}/mobile-display`,
    request
  );
  return response.data;
}

export type ACTION_TYPE =
  | 'DISCOUNT'
  | 'CASHBACK_BOOST'
  | 'GIFT_POINTS'
  | 'PROMOCODE_ISSUE';

export type CreateMarketingCampaignActionDto = {
  campaignId: number;
  actionType: ACTION_TYPE;
};

export async function createMarketingCampaignAction(
  request: CreateMarketingCampaignActionDto
): Promise<void> {
  const response: AxiosResponse<void> = await api.post(
    'user/loyalty/marketing-campaign/action/create',
    request
  );
  return response.data;
}

export type UpdateMarketingCampaignActionDto = {
  actionType?: ACTION_TYPE;
  payload?: any;
};

export async function updateMarketingCampaignAction(
  campaignId: number,
  request: UpdateMarketingCampaignActionDto
): Promise<void> {
  const response: AxiosResponse<void> = await api.put(
    `user/loyalty/marketing-campaign/action/update/${campaignId}`,
    request
  );
  return response.data;
}

export enum PromocodeType {
  CAMPAIGN = 'CAMPAIGN',
  PERSONAL = 'PERSONAL',
  STANDALONE = 'STANDALONE',
}

export enum PromocodeDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SERVICE = 'FREE_SERVICE',
}

export type CreatePromocodeDto = {
  campaignId?: number;
  code: string;
  promocodeType: PromocodeType;
  personalUserId?: number;
  discountType?: PromocodeDiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsage?: number;
  maxUsagePerUser?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  createdReason?: string;
  usageRestrictions?: any;
  organizationId?: number;
  posId?: number;
  placementId?: number;
};

export type PromocodeResponse = {
  id: number;
  code: string;
  promocodeType: PromocodeType;
  discountType?: PromocodeDiscountType;
  discountValue?: number;
  maxUsagePerUser?: number;
  [key: string]: any;
};

export async function createPromocode(
  request: CreatePromocodeDto
): Promise<PromocodeResponse> {
  const response: AxiosResponse<PromocodeResponse> = await api.post(
    'user/loyalty/promocode',
    request
  );
  return response.data;
}

export enum PromocodeFilterType {
  ALL = 'all',
  PERSONAL = 'personal',
  CAMPAIGN = 'campaign',
  STANDALONE = 'standalone',
}

export type PromocodeFilterParams = {
  organizationId: number;
  page?: number;
  size?: number;
  filter?: PromocodeFilterType | 'all' | 'personal' | 'campaign' | 'standalone';
  isActive?: boolean;
  search?: string;
  personalUserId?: number;
};

export type PromocodeFullResponse = {
  id: number;
  code: string;
  promocodeType: PromocodeType;
  discountType?: PromocodeDiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsage?: number;
  maxUsagePerUser?: number;
  currentUsage?: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdReason?: string;
  organizationId?: number;
  posId?: number;
  placementId?: number;
  campaignId?: number;
  personalUserId?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PersonalUser = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
};

export type PersonalPromocodeResponse = {
  id: number;
  campaignId: number | null;
  code: string;
  promocodeType: string;
  personalUserId: number | null;
  discountType: string | null;
  discountValue: number | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  maxUsage: number | null;
  maxUsagePerUser: number;
  currentUsage: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdByManagerId: number | null;
  createdReason: string | null;
  organizationId: number | null;
  posId: number | null;
  placementId: number | null;
  createdAt: string;
  updatedAt: string;
  personalUser: PersonalUser | null;
};

export type PersonalPromocodesParams = {
  organizationId: number;
  page?: number;
  size?: number;
  isActive?: boolean;
  search?: string;
  personalUserId?: number;
};

export type PersonalPromocodesPaginatedResponse = {
  data: PersonalPromocodeResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PromocodesPaginatedResponse = {
  data: PersonalPromocodeResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export async function getPromocodes(
  params: PromocodeFilterParams
): Promise<PromocodesPaginatedResponse> {
  const response: AxiosResponse<PromocodesPaginatedResponse> = await api.get(
    'user/loyalty/promocodes',
    { params }
  );
  return response.data;
}

export async function getPersonalPromocodes(
  params: PersonalPromocodesParams
): Promise<PersonalPromocodesPaginatedResponse> {
  const response: AxiosResponse<PersonalPromocodesPaginatedResponse> =
    await api.get('user/loyalty/personal-promocodes', { params });
  return response.data;
}

export async function getPromocodeById(
  id: number
): Promise<PromocodeFullResponse> {
  const response: AxiosResponse<PromocodeFullResponse> = await api.get(
    `user/loyalty/promocode/${id}`
  );
  return response.data;
}

export type UpdatePromocodeDto = {
  campaignId?: number;
  code?: string;
  promocodeType?: PromocodeType;
  personalUserId?: number | null;
  discountType?: PromocodeDiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsage?: number;
  maxUsagePerUser?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  createdReason?: string;
  usageRestrictions?: any;
  organizationId?: number;
  posId?: number;
  placementId?: number;
};

export async function updatePromocode(
  id: number,
  request: UpdatePromocodeDto
): Promise<PromocodeFullResponse> {
  const response: AxiosResponse<PromocodeFullResponse> = await api.patch(
    `user/loyalty/promocode/${id}`,
    request
  );
  return response.data;
}

export async function deletePromocode(
  id: number
): Promise<{ status: 'SUCCESS' }> {
  const response: AxiosResponse<{ status: 'SUCCESS' }> = await api.delete(
    `user/loyalty/promocode/${id}`
  );
  return response.data;
}

export type ManualTransactionRequest = {
  clientId?: number;
  cardId?: number;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS_ACCRUAL' | 'BONUS_WRITEOFF';
  description?: string;
  organizationId: number;
  posId?: number;
  promocodeId?: number;
};

export type ManualTransactionResponse = {
  id: number;
  transactionId: string;
  clientId?: number;
  cardId?: number;
  amount: number;
  type: string;
  description?: string;
  organizationId: number;
  posId?: number;
  promocodeId?: number;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
  };
};

export async function createManualTransaction(
  request: ManualTransactionRequest
): Promise<ManualTransactionResponse> {
  const response: AxiosResponse<ManualTransactionResponse> = await api.post(
    'user/loyalty/manual-transaction',
    request
  );
  return response.data;
}
