import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum REPORTS {
  GET_REPORTS = 'user/report',
}

enum StatusReportTemplate {
  PROGRESS = 'PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export enum CategoryReportTemplate {
  POS = 'POS',
}

type ReportParams = {
  category?: CategoryReportTemplate;
  page?: number;
  size?: number;
};

type PostReportResponse = {
  id: number;
  reportTemplateId: number;
  userId: number;
  startTemplateAt: Date;
  endTemplateAt?: Date;
  status: StatusReportTemplate;
  reportKey?: string;
};

type AllReportsResponse = {
  reports: {
    id: number;
    name: string;
    category: CategoryReportTemplate;
    description?: string;
    params: JSON;
    applyParams: JSON;
  }[];
  count: number;
};

export type AllReportsParams = AllReportsResponse["reports"][0]

export type ReportParam = {
  name: string;
  type: string;
  description: string;
  required?: string | boolean;
};

type ReportResponse = {
  id: number;
  name: string;
  category: CategoryReportTemplate;
  description?: string;
  params: {
    params: ReportParam[];
  };
};

export type TransactionApplyParams = {
  endDate?: string;
  startDate?: string;
  organizationId?: number;
  carWashPosId?: number;
};

type TransactionParams = {
  page?: number;
  size?: number;
  applyParams?: TransactionApplyParams;
};

type TransactionItem = {
  id: number;
  reportTemplateId: number;
  userId: number;
  startTemplateAt: Date;
  endTemplateAt?: Date;
  status: StatusReportTemplate;
  reportKey?: string;
  applyParams?: TransactionApplyParams | Record<string, unknown>;
};

type TransactionResponse = {
  transactions: TransactionItem[];
  count: number;
};

export async function applyReport(
  body: { [key: string]: any },
  id: number
): Promise<PostReportResponse> {
  const response: AxiosResponse<PostReportResponse> = await api.post(
    REPORTS.GET_REPORTS + `/apply/${id}`,
    body
  );
  return response.data;
}

export async function getAllReports(
  params: ReportParams
): Promise<AllReportsResponse> {
  const response: AxiosResponse<AllReportsResponse> = await api.get(
    REPORTS.GET_REPORTS + '/all',
    { params }
  );
  return response.data;
}

export async function getReportById(id: number): Promise<ReportResponse> {
  const response: AxiosResponse<ReportResponse> = await api.get(
    REPORTS.GET_REPORTS + `/${id}`
  );
  return response.data;
}

export async function getTransactions(
  params: TransactionParams
): Promise<TransactionResponse> {
  const response: AxiosResponse<TransactionResponse> = await api.get(
    REPORTS.GET_REPORTS + '/transaction',
    { params }
  );
  return response.data;
}

export async function deleteTransaction(
  transactionId: number
): Promise<void> {
  await api.delete(`${REPORTS.GET_REPORTS}/transaction/${transactionId}`);
}
