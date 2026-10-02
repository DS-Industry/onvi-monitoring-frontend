import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

const BASE = '/user/pos/fiscal';

export type FiscalDateRange = {
  dateStart: string | Date;
  dateEnd: string | Date;
};

export type FiscalListParams = FiscalDateRange & {
  organizationId: number;
  page?: number;
  size?: number;
  warning?: 'all' | 'warning';
};

const toApiDate = (value: string | Date): Date =>
  value instanceof Date ? value : new Date(value);

const serializeDateRange = (params: FiscalDateRange) => ({
  dateStart: toApiDate(params.dateStart),
  dateEnd: toApiDate(params.dateEnd),
});

export type FiscalWarning =
  | 'Расходится время'
  | 'Расходятся суммы'
  | 'Нарушение связи с ОФД';

export type FiscalLastCredit = {
  deviceName: string;
  amount: number;
  operationTime: string;
  paymentType: string;
};

export type FiscalShiftCode = 'OPEN' | 'CLOSED' | 'EXPIRED';

export type FiscalStateView = {
  statusLine: string;
  receivedAt: string;
  treasurerLinkOpen: boolean;
  shiftStatus: FiscalShiftCode;
  receiptAttemptSucceeded: boolean;
  driverErrorStep: string | null;
  driverErrorCode: number | null;
  driverErrorText: string | null;
  fnMemoryOverflow: boolean;
  fnResourceExhausted: boolean;
  fnReplacementRequired: boolean;
  ofdUnsentDocumentsCount: number;
};

export type FiscalListItem = {
  posId: number;
  posName: string;
  objectLast: FiscalLastCredit | null;
  miniPcLast: FiscalLastCredit | null;
  objectCount: number;
  objectSum: number;
  miniPcCount: number;
  miniPcSum: number;
  state: FiscalStateView | null;
  warnings: FiscalWarning[];
};

export type FiscalListResult = {
  page: number;
  size: number;
  total: number;
  items: FiscalListItem[];
};

export type FiscalHistoryRow = {
  operationTime: string;
  deviceName: string;
  amount: number;
  paymentType: string;
};

export type FiscalMiniPcHistoryRow = FiscalHistoryRow & { qr: string };

export type FiscalCard = {
  posId: number;
  posName: string;
  objectCount: number;
  objectSum: number;
  miniPcCount: number;
  miniPcSum: number;
  state: FiscalStateView | null;
  objectHistory: FiscalHistoryRow[];
  miniPcHistory: FiscalMiniPcHistoryRow[];
};

export async function listFiscal(
  params: FiscalListParams
): Promise<FiscalListResult> {
  const { dateStart, dateEnd, ...rest } = params;
  const response: AxiosResponse<FiscalListResult> = await api.get(BASE, {
    params: {
      ...rest,
      ...serializeDateRange({ dateStart, dateEnd }),
    },
  });
  return response.data;
}

export async function getFiscalCard(
  posId: number,
  params: FiscalDateRange
): Promise<FiscalCard> {
  const response: AxiosResponse<FiscalCard> = await api.get(
    `${BASE}/${posId}`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getFiscalIntegration(
  posId: number
): Promise<{ posId: number; enabled: boolean }> {
  const response: AxiosResponse<{ posId: number; enabled: boolean }> =
    await api.get(`${BASE}/${posId}/integration`);
  return response.data;
}

export async function setFiscalIntegration(
  posId: number,
  enabled: boolean
): Promise<{ posId: number; enabled: boolean }> {
  const response: AxiosResponse<{ posId: number; enabled: boolean }> =
    await api.patch(`${BASE}/${posId}`, { enabled });
  return response.data;
}
