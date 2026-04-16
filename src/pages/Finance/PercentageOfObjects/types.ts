import { Dayjs } from 'dayjs';

export interface PartnerDetail {
  id: number;
  partnerId?: number;
  startDate: Dayjs;
  endDate?: Dayjs;
  percent: number;
  partnerName: string;
  comment?: string;
}

export interface ObjectData {
  id: number;
  posId: number;
  city: string;
  carWashName: string;
  cost: number;
  includeInReport: boolean;
  partners: PartnerDetail[];
}

export type SelectOptionString = { value: string; label: string };
export type SelectOptionNumber = { value: number; label: string };
