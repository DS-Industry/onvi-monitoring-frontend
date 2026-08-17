import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

const BASE = '/user/pos/overview';

export type OverviewDateRange = {
  dateStart: string | Date;
  dateEnd: string | Date;
};

export type OverviewNetworkParams = OverviewDateRange & {
  organizationId?: number;
  countryId?: number;
  placementId?: number;
  placementIds?: number[];
  posId?: number;
  posIds?: number[];
  search?: string;
  page?: number;
  size?: number;
};

export type OverviewDepositsTableParams = OverviewNetworkParams & {
  sortBy?: 'amount';
};

/** Same as monitoring: axios serializes Date to full ISO datetime. */
const toApiDate = (value: string | Date): Date =>
  value instanceof Date ? value : new Date(value);

const serializeDateRange = (params: OverviewDateRange) => ({
  dateStart: toApiDate(params.dateStart),
  dateEnd: toApiDate(params.dateEnd),
});

const serializeOverviewParams = <T extends OverviewNetworkParams>(params: T) => {
  const { placementIds, posIds, dateStart, dateEnd, ...rest } = params;

  return {
    ...rest,
    ...serializeDateRange({ dateStart, dateEnd }),
    placementIds: placementIds?.length ? placementIds.join(',') : undefined,
    posIds: posIds?.length ? posIds.join(',') : undefined,
  };
};

export type NetworkSummaryResponse = {
  revenue: number;
  carsWashed: number;
  planFulfillmentPercent: number;
};

export type NetworkCardItem = {
  id: number;
  name: string;
  city: string;
  carsWashed: number;
  revenue: number;
  planFulfillmentPercent: number;
};

export type NetworkCardsResponse = {
  items: NetworkCardItem[];
  totalCount: number;
};

export type StationSummaryResponse = {
  revenue: number;
  carsWashed: number;
};

export type RevenueSeriesPoint = {
  date: string;
  sum: number;
};

export type RevenueSeriesResponse = {
  points: RevenueSeriesPoint[];
};

export type ServiceStructureItem = {
  name: string;
  sharePercent: number;
  amount?: number;
};

export type ServiceStructureResponse = {
  items: ServiceStructureItem[];
};

export type DepositsSummaryResponse = {
  totalSum: number;
  operationsCount: number;
  averageCheck: number;
};

export type DepositsRefundsResponse = {
  refundSum: number;
};

export type DepositsComparisonItem = {
  posId: number;
  name: string;
  totalSum: number;
};

export type DepositsComparisonResponse = {
  items: DepositsComparisonItem[];
};

export type DepositsTableItem = {
  posId: number;
  name: string;
  city: string;
  cashSum: number;
  virtualSum: number;
  onviSum: number;
  yandexSum: number;
  operationsCount: number;
  cardSum: number;
};

export type DepositsTableResponse = {
  items: DepositsTableItem[];
  totalCount: number;
};

export type LoyaltySummaryResponse = {
  totalSum: number;
  operationsCount: number;
  averageCheck: number;
};

export type LoyaltyCompositionResponse = {
  onviSum: number;
  yandexSum: number;
};

export type LoyaltyVisitsResponse = {
  onviVisits: number;
  cardVisits: number;
};

export type PlanFactSummaryResponse = {
  plan: number;
  fact: number;
  fulfillmentPercent: number;
};

export type PlanFactProgressResponse = {
  plan: number;
  fact: number;
  fulfillmentPercent: number;
  notCompletedPercent: number;
  periodLabel: string;
};

export type OverviewDeviceItem = {
  id: number;
  name: string;
  status: string;
};

export type OverviewDevicesResponse = {
  items: OverviewDeviceItem[];
  totalCount: number;
};

export type CleaningSummaryResponse = {
  programsCount: number;
  totalCleaningMinutes: number;
  averageCycleMinutes: number;
};

export type CleaningByProgramItem = {
  programName: string;
  totalMinutes: number;
};

export type CleaningByProgramResponse = {
  items: CleaningByProgramItem[];
};

export async function getNetworkSummary(
  params: OverviewNetworkParams
): Promise<NetworkSummaryResponse> {
  const response: AxiosResponse<NetworkSummaryResponse> = await api.get(
    `${BASE}/network/summary`,
    { params: serializeOverviewParams(params) }
  );
  return response.data;
}

export async function getNetworkCards(
  params: OverviewNetworkParams
): Promise<NetworkCardsResponse> {
  const response: AxiosResponse<NetworkCardsResponse> = await api.get(
    `${BASE}/network/cards`,
    { params: serializeOverviewParams(params) }
  );
  return response.data;
}

export async function getStationSummary(
  posId: number,
  params: OverviewDateRange
): Promise<StationSummaryResponse> {
  const response: AxiosResponse<StationSummaryResponse> = await api.get(
    `${BASE}/${posId}/summary`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationRevenueSeries(
  posId: number,
  params: OverviewDateRange
): Promise<RevenueSeriesResponse> {
  const response: AxiosResponse<RevenueSeriesResponse> = await api.get(
    `${BASE}/${posId}/revenue-series`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationServiceStructure(
  posId: number,
  params: OverviewDateRange
): Promise<ServiceStructureResponse> {
  const response: AxiosResponse<ServiceStructureResponse> = await api.get(
    `${BASE}/${posId}/service-structure`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationDepositsSummary(
  posId: number,
  params: OverviewDateRange
): Promise<DepositsSummaryResponse> {
  const response: AxiosResponse<DepositsSummaryResponse> = await api.get(
    `${BASE}/${posId}/deposits/summary`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationDepositsRefunds(
  posId: number,
  params: OverviewDateRange
): Promise<DepositsRefundsResponse> {
  const response: AxiosResponse<DepositsRefundsResponse> = await api.get(
    `${BASE}/${posId}/deposits/refunds`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getDepositsComparison(
  params: OverviewNetworkParams
): Promise<DepositsComparisonResponse> {
  const response: AxiosResponse<DepositsComparisonResponse> = await api.get(
    `${BASE}/deposits/comparison`,
    { params: serializeOverviewParams(params) }
  );
  return response.data;
}

export async function getDepositsTable(
  params: OverviewDepositsTableParams
): Promise<DepositsTableResponse> {
  const response: AxiosResponse<DepositsTableResponse> = await api.get(
    `${BASE}/deposits/table`,
    { params: serializeOverviewParams(params) }
  );
  return response.data;
}

export async function getStationLoyaltySummary(
  posId: number,
  params: OverviewDateRange
): Promise<LoyaltySummaryResponse> {
  const response: AxiosResponse<LoyaltySummaryResponse> = await api.get(
    `${BASE}/${posId}/loyalty/summary`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationLoyaltyComposition(
  posId: number,
  params: OverviewDateRange
): Promise<LoyaltyCompositionResponse> {
  const response: AxiosResponse<LoyaltyCompositionResponse> = await api.get(
    `${BASE}/${posId}/loyalty/composition`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationLoyaltyVisits(
  posId: number,
  params: OverviewDateRange
): Promise<LoyaltyVisitsResponse> {
  const response: AxiosResponse<LoyaltyVisitsResponse> = await api.get(
    `${BASE}/${posId}/loyalty/visits`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationPlanFactSummary(
  posId: number,
  params: OverviewDateRange
): Promise<PlanFactSummaryResponse> {
  const response: AxiosResponse<PlanFactSummaryResponse> = await api.get(
    `${BASE}/${posId}/plan-fact/summary`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationPlanFactProgress(
  posId: number,
  params: OverviewDateRange
): Promise<PlanFactProgressResponse> {
  const response: AxiosResponse<PlanFactProgressResponse> = await api.get(
    `${BASE}/${posId}/plan-fact/progress`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationDevices(
  posId: number
): Promise<OverviewDevicesResponse> {
  const response: AxiosResponse<OverviewDevicesResponse> = await api.get(
    `${BASE}/${posId}/devices`
  );
  return response.data;
}

export async function getStationCleaningSummary(
  posId: number,
  params: OverviewDateRange
): Promise<CleaningSummaryResponse> {
  const response: AxiosResponse<CleaningSummaryResponse> = await api.get(
    `${BASE}/${posId}/cleaning/summary`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}

export async function getStationCleaningByProgram(
  posId: number,
  params: OverviewDateRange
): Promise<CleaningByProgramResponse> {
  const response: AxiosResponse<CleaningByProgramResponse> = await api.get(
    `${BASE}/${posId}/cleaning/by-program`,
    { params: serializeDateRange(params) }
  );
  return response.data;
}
