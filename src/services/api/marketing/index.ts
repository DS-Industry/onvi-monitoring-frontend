import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum MARKETING {
    GET_LOYALTY = 'user/loyalty/client',
    GET_TAG = 'user/loyalty/tag',
    LOYALTY = 'user/loyalty'
}

enum UserType {
    PHYSICAL = "PHYSICAL",
    LEGAL = "LEGAL"
}

enum StatusUser {
    VERIFICATE = "VERIFICATE",
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    DELETED = "DELETED"
}

enum LoyaltyProgramStatus {
    ACTIVE = "ACTIVE",
    PAUSE = "PAUSE"
}

enum BenefitType {
    CASHBACK = "CASHBACK",
    DISCOUNT = "DISCOUNT",
    GIFT_POINTS = "GIFT_POINTS"
}

type ClientRequestBody = {
    name: string;
    birthday?: Date;
    phone: string;
    email?: string;
    gender?: string;
    type: UserType;
    inn?: string;
    comment?: string;
    placementId?: number;
    devNumber?: number;
    number?: number;
    monthlyLimit?: number;
    tagIds: number[];
}

type ClientResponseBody = {
    id: number;
    name: string;
    birthday?: Date;
    phone: string;
    email?: string;
    gender?: string;
    status: StatusUser;
    type: UserType;
    inn?: string;
    comment?: string;
    refreshTokenId?: string;
    placementId?: number;
    createdAt?: Date;
    updatedAt?: Date;
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
}

type ClientUpdate = {
    clientId: number;
    name?: string;
    type?: UserType;
    inn?: string;
    comment?: string;
    placementId?: number;
    monthlyLimit?: number;
    tagIds?: number[];
}

type ClientsParams = {
    placementId: number | string;
    type: UserType | string;
    tagIds?: number[];
    phone?: string;
    page?: number;
    size?: number;
}

type ClientsResponse = {
    id: number;
    name: string;
    phone: string;
    status: StatusUser;
    type: UserType;
    comment?: string;
    placementId?: number;
    tags: {
        id: number;
        name: string;
        color: string;
    }[];
}

type TagRequest = {
    name: string;
    color: string;
}

type TagResponse = {
    props: {
        id: number;
        name: string;
        color: string;
    }
}

type DeleteTagResponse = {
    status: "SUCCESS"
}

type LoyaltyProgramsRequest = {
    name: string;
    organizationIds: number[];
    lifetimeDays?: number;
}

type UpdateLoyaltyRequest = {
    loyaltyProgramId: number;
    name?: string;
    organizationIds?: number[];
}

type LoyaltyProgramsResponse = {
    props: {
        id: number;
        name: string;
        status: LoyaltyProgramStatus;
        startDate: Date;
        lifetimeDays?: number;
    }
}

type LoyaltyProgramsByIdResponse = {
    id: number;
    name: string;
    status: LoyaltyProgramStatus;
    organizationIds: number[];
    startDate: Date;
    lifetimeDays?: number;
}

type TierRequest = {
    name: string;
    description?: string;
    loyaltyProgramId: number;
    limitBenefit: number;
}

type TierResponse = {
    props: {
        id: number;
        name: string;
        description?: string;
        loyaltyProgramId: number;
        limitBenefit: number;
    }
}

type UpdateTierRequest = {
    loyaltyTierId: number;
    description?: string;
    benefitIds: number[];
}

type TierByIdResponse = {
    id: number;
    name: string;
    description?: string;
    loyaltyProgramId: number;
    limitBenefit: number;
    benefitIds: number[];
}

type BenefitRequest = {
    name: string;
    type: BenefitType;
    bonus: number;
    benefitActionTypeId?: number;
}

type BenefitResponse = {
    props: {
        id: number;
        name: string;
        benefitType: BenefitType;
        bonus: number;
        benefitActionTypeId?: number;
    }
}

type BenefitActionRequest = {
    name: string;
    description?: string;
}

type BenefitActionResponse = {
    props: {
        id: number;
        name: string;
        description?: string;
    }
}

type AllTiersRequest = {
    programId: number | '*';
}

type UpdateBenefitBody = {
    benefitId: number;
    name?: string;
    bonus?: number;
    benefitType?: BenefitType;
}

export async function createClient(body: ClientRequestBody): Promise<ClientResponseBody> {
    const response: AxiosResponse<ClientResponseBody> = await api.post(MARKETING.GET_LOYALTY, body);
    return response.data;
}

export async function updateClient(body: ClientUpdate): Promise<ClientResponseBody> {
    const response: AxiosResponse<ClientResponseBody> = await api.patch(MARKETING.GET_LOYALTY, body);
    return response.data;
}

export async function getClients(params: ClientsParams): Promise<ClientsResponse[]> {
    const response: AxiosResponse<ClientsResponse[]> = await api.get(MARKETING.GET_LOYALTY + `s`, { params });

    return response.data;
}

export async function getClientById(id: number): Promise<ClientResponseBody> {
    const response: AxiosResponse<ClientResponseBody> = await api.get(MARKETING.GET_LOYALTY + `/${id}`);

    return response.data;
}

export async function createTag(body: TagRequest): Promise<TagResponse> {
    const response: AxiosResponse<TagResponse> = await api.post(MARKETING.GET_TAG, body);
    return response.data;
}

export async function getTags(): Promise<TagResponse[]> {
    const response: AxiosResponse<TagResponse[]> = await api.get(MARKETING.GET_TAG);

    return response.data;
}

export async function deleteTag(id: number): Promise<DeleteTagResponse> {
    const response: AxiosResponse<DeleteTagResponse> = await api.delete(MARKETING.GET_TAG + `/${id}`);

    return response.data;
}

export async function createLoyaltyProgram(body: LoyaltyProgramsRequest): Promise<LoyaltyProgramsResponse> {
    const response: AxiosResponse<LoyaltyProgramsResponse> = await api.post(MARKETING.LOYALTY + '/program', body);
    return response.data;
}

export async function updateLoyaltyProgram(body: UpdateLoyaltyRequest): Promise<LoyaltyProgramsResponse> {
    const response: AxiosResponse<LoyaltyProgramsResponse> = await api.patch(MARKETING.LOYALTY + '/program', body);
    return response.data;
}

export async function getLoyaltyPrograms(): Promise<LoyaltyProgramsResponse[]> {
    const response: AxiosResponse<LoyaltyProgramsResponse[]> = await api.get(MARKETING.LOYALTY + `/programs`);

    return response.data;
}

export async function getLoyaltyProgramById(id: number): Promise<LoyaltyProgramsByIdResponse> {
    const response: AxiosResponse<LoyaltyProgramsByIdResponse> = await api.get(MARKETING.LOYALTY + `/program/${id}`);

    return response.data;
}

export async function createTier(body: TierRequest): Promise<TierResponse> {
    const response: AxiosResponse<TierResponse> = await api.post(MARKETING.LOYALTY + '/tier', body);
    return response.data;
}

export async function updateTier(body: UpdateTierRequest): Promise<TierResponse> {
    const response: AxiosResponse<TierResponse> = await api.patch(MARKETING.LOYALTY + '/tier', body);
    return response.data;
}

export async function getTiers(params: AllTiersRequest): Promise<TierByIdResponse[]> {
    const response: AxiosResponse<TierByIdResponse[]> = await api.get(MARKETING.LOYALTY + '/tiers', { params });

    return response.data;
}

export async function getTierById(id: number): Promise<TierByIdResponse> {
    const response: AxiosResponse<TierByIdResponse> = await api.get(MARKETING.LOYALTY + `/tier/${id}`);

    return response.data;
}

export async function createBenefit(body: BenefitRequest): Promise<BenefitResponse> {
    const response: AxiosResponse<BenefitResponse> = await api.post(MARKETING.LOYALTY + '/benefit', body);
    return response.data;
}

export async function getBenefits(): Promise<BenefitResponse[]> {
    const response: AxiosResponse<BenefitResponse[]> = await api.get(MARKETING.LOYALTY + `/benefits`);

    return response.data;
}

export async function createBenefitAction(body: BenefitActionRequest): Promise<BenefitActionResponse> {
    const response: AxiosResponse<BenefitActionResponse> = await api.post(MARKETING.LOYALTY + '/benefit-action', body);
    return response.data;
}

export async function getBenefitActions(): Promise<BenefitActionResponse[]> {
    const response: AxiosResponse<BenefitActionResponse[]> = await api.get(MARKETING.LOYALTY + `/benefit-actions`);

    return response.data;
}

export async function getBenefitById(id: number): Promise<BenefitResponse> {
    const response: AxiosResponse<BenefitResponse> = await api.get(MARKETING.LOYALTY + `/benefit/${id}`);

    return response.data;
}

export async function updateBenefit(body: UpdateBenefitBody): Promise<BenefitResponse> {
    const response: AxiosResponse<BenefitResponse> = await api.patch(MARKETING.LOYALTY + '/benefit', body);
    return response.data;
}