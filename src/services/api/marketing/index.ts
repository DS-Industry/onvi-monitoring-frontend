import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum MARKETING {
    GET_LOYALTY = 'user/loyalty/client',
    GET_TAG = 'user/loyalty/tag'
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
    tagIds: number[];
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