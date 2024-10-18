import {AxiosResponse} from "axios";
import api from "@/config/axiosConfig";
import {data} from "autoprefixer";

enum ORGANIZATION {
    GET_ORGANIZATIONS = 'user/organization/filter',
    CREATE_ORGANIZATION = 'organization',
    GET_RATING = 'user/organization/rating',
    GET_STATISTIC = 'organization/statistics',
    UPDATE_ORGANIZATION = 'user/organization',
    POST_POS = 'user/pos'
}

export async function getOrganization(userId: number): Promise<Organization[]> {
    const url = ORGANIZATION.GET_ORGANIZATIONS;
    const response: AxiosResponse<any> = await api.get(url);

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function postCreateOrganization(body: any, options: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(ORGANIZATION.CREATE_ORGANIZATION, body, options);

    return response.data;
}

export async function getRating(params: any): Promise<Rating[]> {
    const url = ORGANIZATION.GET_RATING;
    const response: AxiosResponse<any> = await api.get(url, {params});
    return response.data;
}

export async function getStatistic(organizationId: number, params: any): Promise<Statistic> {
    const url = ORGANIZATION.GET_STATISTIC + `/${organizationId}`;
    const response: AxiosResponse<any> = await api.get(url, {params});
    return response.data;
}

export async function postUpdateOrganization(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.patch(ORGANIZATION.UPDATE_ORGANIZATION, body);

    return response.data;
}

export async function postPosData(body: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(ORGANIZATION.POST_POS, body);
    console.log(response.data);
    return response.data;
}