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
    organizationId: number;
}

type LoyaltyProgramsResponse = {
    props: {
        id: number;
        name: string;
        status: LoyaltyProgramStatus;
        startDate: Date;
        organizationId: number;
    }
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
    props: {
        id: number;
        name: string;
        description?: string;
        loyaltyProgramId: number;
        limitBenefit: number;
        benefitId: number[];
    }
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

export async function createClient(body: ClientRequestBody): Promise<ClientResponseBody> {
    console.log(body);
    const response: AxiosResponse<ClientResponseBody> = await api.post(MARKETING.GET_LOYALTY, body);
    console.log(response.data);
    return response.data;
}

export async function updateClient(body: ClientUpdate): Promise<ClientResponseBody> {
    console.log(body);
    const response: AxiosResponse<ClientResponseBody> = await api.patch(MARKETING.GET_LOYALTY, body);
    console.log(response.data);
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
    console.log(body);
    const response: AxiosResponse<TagResponse> = await api.post(MARKETING.GET_TAG, body);
    console.log(response.data);
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
    console.log(body);
    const response: AxiosResponse<LoyaltyProgramsResponse> = await api.post(MARKETING.LOYALTY + '/program', body);
    console.log(response.data);
    return response.data;
}

export async function getLoyaltyPrograms(): Promise<LoyaltyProgramsResponse[]> {
    const response: AxiosResponse<LoyaltyProgramsResponse[]> = await api.get(MARKETING.LOYALTY + `/programs`);

    return response.data;
}

export async function getLoyaltyProgramById(id: number): Promise<LoyaltyProgramsResponse> {
    const response: AxiosResponse<LoyaltyProgramsResponse> = await api.get(MARKETING.LOYALTY + `/program/${id}`);

    return response.data;
}

export async function createTier(body: TierRequest): Promise<TierResponse> {
    console.log(body);
    const response: AxiosResponse<TierResponse> = await api.post(MARKETING.LOYALTY + '/tier', body);
    console.log(response.data);
    return response.data;
}

export async function updateTier(body: UpdateTierRequest): Promise<TierResponse> {
    console.log(body);
    const response: AxiosResponse<TierResponse> = await api.patch(MARKETING.LOYALTY + '/tier', body);
    console.log(response.data);
    return response.data;
}

export async function getTiers(params: AllTiersRequest): Promise<TierResponse[]> {
    const response: AxiosResponse<TierResponse[]> = await api.get(MARKETING.LOYALTY + '/tiers',{ params });

    return response.data;
}

export async function getTierById(id: number): Promise<TierByIdResponse> {
    const response: AxiosResponse<TierByIdResponse> = await api.get(MARKETING.LOYALTY + `/tier/${id}`);

    return response.data;
}

export async function createBenefit(body: BenefitRequest): Promise<BenefitResponse> {
    console.log(body);
    const response: AxiosResponse<BenefitResponse> = await api.post(MARKETING.LOYALTY + '/benefit', body);
    console.log(response.data);
    return response.data;
}

export async function getBenefits(): Promise<BenefitResponse[]> {
    const response: AxiosResponse<BenefitResponse[]> = await api.get(MARKETING.LOYALTY + `/benefits`);

    return response.data;
}

export async function createBenefitAction(body: BenefitActionRequest): Promise<BenefitActionResponse> {
    console.log(body);
    const response: AxiosResponse<BenefitActionResponse> = await api.post(MARKETING.LOYALTY + '/benefit-action', body);
    console.log(response.data);
    return response.data;
}

export async function getBenefitActions(): Promise<BenefitActionResponse[]> {
    const response: AxiosResponse<BenefitActionResponse[]> = await api.get(MARKETING.LOYALTY + `/benefit-actions`);

    return response.data;
}