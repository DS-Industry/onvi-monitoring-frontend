import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';
import { ContractType } from '@/utils/constants';

enum MARKETING {
  GET_LOYALTY = 'user/loyalty/client',
  GET_TAG = 'user/loyalty/tag',
  LOYALTY = 'user/loyalty',
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

enum BenefitType {
  CASHBACK = 'CASHBACK',
  DISCOUNT = 'DISCOUNT',
  GIFT_POINTS = 'GIFT_POINTS',
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
  organizationId?: number
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
  };
};

type LoyaltyProgramsByIdResponse = {
  id: number;
  name: string;
  status: LoyaltyProgramStatus;
  organizations: {
    id: number;
    name: string;
  }[];
  startDate: Date;
  lifetimeDays?: number;
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
    MARKETING.LOYALTY + `/programs?organizationId=${orgId || ''}`
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
  dateRegistered: string; 
  status: string; 
  contractType: ContractType;
  comment?: string;
  placementId?: number;
  createdAt?: string; 
  updatedAt?: string; 
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
  organizationId?: number
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
  const response: AxiosResponse<CorporateClientsPaginatedResponse> = await api.get(
    'user/loyalty/corporate-clients',
    { params }
  );

  return response.data;
}

export async function getCorporateClientById(id: number): Promise<CorporateClientResponse> {
  const response: AxiosResponse<CorporateClientResponse> = await api.get(
    `user/loyalty/corporate-clients/${id}`
  );

  return response.data;
}

export type CreateCorporateClientRequest = {
  name: string;
  inn: string;
  address: string;
};

export type UpdateCorporateClientRequest = {
  name?: string;
  inn?: string;
  address?: string;
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
