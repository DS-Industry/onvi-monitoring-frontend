import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum ORGANIZATION {
    GET_ORGANIZATIONS = 'user/organization/filter',
    GET_RATING = 'user/organization/rating',
    GET_STATISTIC = 'user/organization/statistics',
    UPDATE_ORGANIZATION = 'user/organization',
}

type Organization = {
    id: number;
    name: string;
    slug: string;
    address: string;
    organizationStatus: string;
    organizationType: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: number;
}

type OrganizationBody = {
    fullName: string;
    organizationType: string;
    rateVat: string;
    inn: string;
    okpo: string;
    kpp?: string;
    addressRegistration: string;
    ogrn: string;
    bik: string;
    correspondentAccount: string;
    bank: string;
    settlementAccount: string;
    addressBank: string;
    certificateNumber?: string;
    dateCertificate?: Date;
}

type OrganizationPostResponse = {
    props: {
        id: number;
        name: string;
        slug: string;
        address: string;
        organizationDocumentId: number;
        organizationStatus: string;
        organizationType: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: number;
    }
}

type OrganizationUpdateBody = {
    organizationId: number;
    fullName?: string;
    rateVat?: string;
    inn?: string;
    okpo?: string;
    kpp?: string;
    addressRegistration?: string;
    ogrn?: string;
    bik?: string;
    correspondentAccount?: string;
    bank?: string;
    settlementAccount?: string;
    addressBank?: string;
    certificateNumber?: string;
    dateCertificate?: Date;
}

type Statistic = {
    sum: number;
    cars: number;
}

type RatingParams = {
    dateStart: Date;
    dateEnd: Date;
}

type Rating = {
    posName: string;
    sum: number;
}

export async function getOrganization(): Promise<Organization[]> {
    const url = ORGANIZATION.GET_ORGANIZATIONS;
    const response: AxiosResponse<Organization[]> = await api.get(url);

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function createUserOrganization(body: OrganizationBody): Promise<OrganizationPostResponse> {
    console.log(body);
    const response: AxiosResponse<OrganizationPostResponse> = await api.post(ORGANIZATION.UPDATE_ORGANIZATION, body);
    console.log(response.data);
    return response.data;
}

export async function getRating(params: RatingParams): Promise<Rating[]> {
    const url = ORGANIZATION.GET_RATING;
    const response: AxiosResponse<Rating[]> = await api.get(url, { params });
    return response.data;
}

export async function getStatistic(): Promise<Statistic> {
    const url = ORGANIZATION.GET_STATISTIC;
    const response: AxiosResponse<Statistic> = await api.get(url);
    return response.data;
}

export async function postUpdateOrganization(body: OrganizationUpdateBody): Promise<OrganizationPostResponse> {
    console.log(body);
    const response: AxiosResponse<OrganizationPostResponse> = await api.patch(ORGANIZATION.UPDATE_ORGANIZATION, body);

    return response.data;
}
