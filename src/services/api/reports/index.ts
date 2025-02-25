import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum REPORTS {
    GET_REPORTS = 'user/report'
}

enum StatusReportTemplate {
    PROGRESS = "PROGRESS",
    DONE = "DONE",
    ERROR = "ERROR"
}

enum CategoryReportTemplate {
    POS = "POS"
}

type ReportParams = {
    category?: CategoryReportTemplate;
    page?: number;
    size?: number;
}

type PostReportResponse = {
    id: number;
    reportTemplateId: number;
    userId: number;
    startTemplateAt: Date;
    endTemplateAt?: Date;
    status: StatusReportTemplate;
    reportKey?: string;
}

type AllReportsResponse = {
    reports: {
        id: number;
        name: string;
        category: CategoryReportTemplate;
        description?: string;
        params: JSON;
    }[];
    count: number;
}

type ReportResponse = {
    id: number;
    name: string;
    category: CategoryReportTemplate;
    description?: string;
    params: JSON;
}

type TransactionParams = {
    page?: number;
    size?: number;
}

type TransactionResponse = {
    transactions: {
        id: number;
        reportTemplateId: number;
        userId: number;
        startTemplateAt: Date;
        endTemplateAt?: Date;
        status: StatusReportTemplate;
        reportKey?: string;
    }[];
    count: number;
}

export async function applyReport(body: { [key: string]: any; }, id: number): Promise<PostReportResponse> {
    console.log(body);
    const response: AxiosResponse<PostReportResponse> = await api.post(REPORTS.GET_REPORTS + `/apply/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function getAllReports(params: ReportParams): Promise<AllReportsResponse> {
    const response: AxiosResponse<AllReportsResponse> = await api.get(REPORTS.GET_REPORTS + '/all', { params });
    return response.data;
}

export async function getReportById(id: number): Promise<ReportResponse> {
    const response: AxiosResponse<ReportResponse> = await api.get(REPORTS.GET_REPORTS + `/${id}`);
    return response.data;
}

export async function getTransactions(params: TransactionParams): Promise<TransactionResponse> {
    const response: AxiosResponse<TransactionResponse> = await api.get(REPORTS.GET_REPORTS + '/transaction', { params });
    return response.data;
}

