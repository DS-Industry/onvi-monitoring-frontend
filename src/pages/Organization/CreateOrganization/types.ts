export type PlanId = 'base' | 'space' | 'business' | 'custom';

export type ConnectionType = 'DS_EQUIPMENT' | 'COUPLING_MODULE';

export type DetailsFormData = {
  fullName: string;
  organizationType: string;
  addressRegistration: string;
};

export type DetailsFormFieldType =
  | 'fullName'
  | 'organizationType'
  | 'addressRegistration';

export const PLAN_TO_API: Record<
  PlanId,
  'BASIC' | 'SPACE' | 'BUSINESS' | 'CUSTOM'
> = {
  base: 'BASIC',
  space: 'SPACE',
  business: 'BUSINESS',
  custom: 'CUSTOM',
};

export const PLAN_TO_PARAM: Record<PlanId, string> = {
  base: 'basic',
  space: 'space',
  business: 'business',
  custom: 'custom',
};

export const PARAM_TO_PLAN: Record<string, PlanId> = {
  basic: 'base',
  space: 'space',
  business: 'business',
  custom: 'custom',
};

export const API_CODE_TO_PLAN: Record<string, PlanId> = {
  BASIC: 'base',
  SPACE: 'space',
  BUSINESS: 'business',
  CUSTOM: 'custom',
};

export function buildSearchParams(
  plan: PlanId | null,
  onvi: boolean,
  corpClient: boolean
): URLSearchParams {
  const params = new URLSearchParams();
  if (plan) params.set('plan', PLAN_TO_PARAM[plan]);
  if (onvi) params.set('onvi', 'true');
  if (corpClient) params.set('corp-client', 'true');
  return params;
}

export const CUSTOM_PLAN_DEFAULT_POSES = 5;
export const CUSTOM_PLAN_DEFAULT_USERS = 5;
export const CUSTOM_PLAN_MIN_POSES = 1;
export const CUSTOM_PLAN_MAX_POSES = 999;
export const CUSTOM_PLAN_MIN_USERS = 1;
export const CUSTOM_PLAN_MAX_USERS = 999;

export const PLANS_CONFIG: {
  id: PlanId;
  headerBg: string;
  titleKey: string;
  descKey: string;
  priceKey: string;
  priceValue?: string;
  features: string[];
  allowsCustomCounts?: boolean;
}[] = [
  {
    id: 'base',
    headerBg: 'bg-[#2563eb]',
    titleKey: 'planBase',
    descKey: 'planBaseDesc',
    priceKey: 'priceFree',
    features: [
      'feature1Object',
      'feature2Users',
      'moduleAdmin',
      'moduleAnalytics',
    ],
  },
  {
    id: 'space',
    headerBg: 'bg-[#1a1a1a]',
    titleKey: 'planSpace',
    descKey: 'planSpaceDesc',
    priceKey: 'planSpace',
    priceValue: '₽3000',
    features: [
      'feature3Objects',
      'feature9Users',
      'moduleAdmin',
      'moduleAnalytics',
      'moduleManagement',
      'moduleHr',
      'moduleWarehouse',
    ],
  },
  {
    id: 'business',
    headerBg: 'bg-[#BFFA00]',
    titleKey: 'planBusiness',
    descKey: 'planBusinessDesc',
    priceKey: 'planBusiness',
    priceValue: '₽5000',
    features: [
      'feature5Objects',
      'feature15Users',
      'moduleAdmin',
      'moduleAnalytics',
      'moduleManagement',
      'moduleHr',
      'moduleWarehouse',
      'moduleAnalysis',
      'moduleMarketing',
      'moduleEquipment',
    ],
  },
  {
    id: 'custom',
    headerBg: 'bg-[#2563eb]',
    titleKey: 'planCustom',
    descKey: 'planCustomDesc',
    priceKey: 'priceOnRequest',
    allowsCustomCounts: true,
    features: [
      'moduleAdmin',
      'moduleAnalytics',
      'moduleManagement',
      'moduleHr',
      'moduleWarehouse',
      'moduleAnalysis',
      'moduleMarketing',
      'moduleEquipment',
    ],
  },
];

export const STEPS = [
  { key: 'details', translationKey: 'step1' },
  { key: 'subscription', translationKey: 'step0' },
  { key: 'connection', translationKey: 'step2' },
  { key: 'posRequests', translationKey: 'posRequestsStep' },
  { key: 'offer', translationKey: 'step3' },
  { key: 'payment', translationKey: 'step4' },
] as const;
