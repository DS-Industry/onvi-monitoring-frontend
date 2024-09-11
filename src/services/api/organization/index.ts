import {AxiosResponse} from "axios";
import {api} from "../../../utils/axiosConfig.ts";
import {data} from "autoprefixer";

enum ORGANIZATION {
    GET_ORGANIZATIONS = 'organization/filter',
    CREATE_ORGANIZATION = 'organization',
    GET_RATING = 'organization/rating',
    GET_STATISTIC = 'organization/statistics',
}

export async function getOrganization(userId: number): Promise<Organization[]> {
    const url = ORGANIZATION.GET_ORGANIZATIONS + `/${userId}`;
    const response: AxiosResponse<any> = await api.get(url);

    //console.log(JSON.stringify(response, null, 2));
    return response.data;
}

export async function postCreateOrganization(body: any, options: any): Promise<any> {
    console.log(body);
    const response: AxiosResponse<any> = await api.post(ORGANIZATION.CREATE_ORGANIZATION, body, options);

    return response.data;
}

export async function getRating(organizationId: number, params: any): Promise<Rating[]> {
    const url = ORGANIZATION.GET_RATING + `/${organizationId}`;
    const response: AxiosResponse<any> = await api.get(url, {params});
    return response.data;
}

export async function getStatistic(organizationId: number, params: any): Promise<Statistic> {
    const url = ORGANIZATION.GET_STATISTIC + `/${organizationId}`;
    const response: AxiosResponse<any> = await api.get(url, {params});
    return response.data;
}