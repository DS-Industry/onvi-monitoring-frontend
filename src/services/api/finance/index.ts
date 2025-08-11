import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum FINANCE {
  POST_CASH_COLLECTION = 'user/finance/cash-collection',
  TIME_STAMP = 'user/finance/time-stamp',
  SHIFT_REPORT = 'user/finance/shift-report',
  SHIFT_REPORT_CREATE = 'user/finance/shift/create',
  MANAGER_PAPER = 'user/manager-paper',
  GET_WORKER = 'user/permission/worker-by-pos',
}

enum ManagerReportPeriodStatus {
  SAVE = 'SAVE',
  SENT = 'SENT',
}

export enum TypeWorkDay {
  WORKING = 'WORKING',
  WEEKEND = 'WEEKEND',
  MEDICAL = 'MEDICAL',
  VACATION = 'VACATION',
  TIMEOFF = 'TIMEOFF',
  TRUANCY = 'TRUANCY',
}

export enum TypeEstimation {
  NO_VIOLATION = 'NO_VIOLATION',
  GROSS_VIOLATION = 'GROSS_VIOLATION',
  MINOR_VIOLATION = 'MINOR_VIOLATION',
  ONE_REMARK = 'ONE_REMARK',
}

export enum StatusWorkDayShiftReport {
  CREATED = 'CREATED',
  SAVED = 'SAVED',
  SENT = 'SENT',
}

export enum TypeWorkDayShiftReportCashOper {
  REFUND = 'REFUND',
  REPLENISHMENT = 'REPLENISHMENT',
}

enum ManagerPaperGroup {
  RENT = 'RENT',
  REVENUE = 'REVENUE',
  WAGES = 'WAGES',
  INVESTMENT_DEVIDENTS = 'INVESTMENT_DEVIDENTS',
  UTILITY_BILLS = 'UTILITY_BILLS',
  TAXES = 'TAXES',
  ACCOUNTABLE_FUNDS = 'ACCOUNTABLE_FUNDS',
  REPRESENTATIVE_EXPENSES = 'REPRESENTATIVE_EXPENSES',
  SALE_EQUIPMENT = 'SALE_EQUIPMENT',
  MANUFACTURE = 'MANUFACTURE',
  OTHER = 'OTHER',
  SUPPLIES = 'SUPPLIES',
  P_C = 'P_C',
  WAREHOUSE = 'WAREHOUSE',
  CONSTRUCTION = 'CONSTRUCTION',
  MAINTENANCE_REPAIR = 'MAINTENANCE_REPAIR',
  TRANSPORTATION_COSTS = 'TRANSPORTATION_COSTS',
}

enum ManagerPaperTypeClass {
  RECEIPT = 'RECEIPT',
  EXPENDITURE = 'EXPENDITURE',
}

type CollectionBody = {
  cashCollectionDate: Date;
  posId: number;
};

type CollectionResponse = {
  id: number;
  cashCollectionDate: Date;
  oldCashCollectionDate: Date;
  status: string;
  sumFact: number;
  virtualSum: number;
  sumCard: number;
  shortage: number;
  countCar: number;
  countCarCard: number;
  averageCheck: number;
  cashCollectionDeviceType: {
    id: number;
    typeName: string;
    sumCoinDeviceType: number;
    sumPaperDeviceType: number;
    sumFactDeviceType: number;
    shortageDeviceType: number;
    virtualSumDeviceType: number;
  }[];
  cashCollectionDevice: {
    id: number;
    deviceId: number;
    deviceName: string;
    deviceType: string;
    oldTookMoneyTime: Date;
    tookMoneyTime: Date;
    sumDevice: number;
    sumCoinDevice: number;
    sumPaperDevice: number;
    virtualSumDevice: number;
  }[];
};

type RecalculateCollectionBody = {
  cashCollectionDeviceData: {
    cashCollectionDeviceId: number;
    tookMoneyTime: Date;
  }[];
  cashCollectionDeviceTypeData: {
    cashCollectionDeviceTypeId: number;
    sumCoin?: number;
    sumPaper?: number;
  }[];
};

type ReturnCollectionResponse = {
  status: string;
};

type CashCollectionParams = {
  dateStart: Date;
  dateEnd: Date;
  placementId?: number;
  posId?: number;
  page?: number;
  size?: number;
};

type GetShiftReportsParams = {
  dateStart: Date;
  dateEnd: Date;
  posId: number;
};

type CashCollectionsResponse = {
  cashCollectionsData: {
    id: number;
    posId: number;
    period: string;
    sumFact: number;
    sumCard: number;
    sumVirtual: number;
    profit: number;
    status: string;
    shortage: number;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
    cashCollectionDeviceType: {
      typeName: string;
      typeShortage: number;
    }[];
  }[];
  totalCount: number;
};

type TimestampResponse = {
  deviceId: number;
  deviceName: string;
  oldTookMoneyTime?: Date;
};

type TimestampBody = {
  dateTimeStamp: Date;
};

type TimestampResponseBody = {
  deviceId: number;
  tookMoneyTime: Date;
};

type ShiftRequestBody = {
  startDate: Date;
  endDate: Date;
  posId: number;
};

type ShiftResponseBody = {
  props: {
    id: number;
    posId: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
  };
};

type ShiftWorkerBody = {
  userId: number;
};

type ShiftWorkerResponse = {
  id: number;
  posId: number;
  startDate: Date;
  endDate: Date;
  workers: {
    workerId: number;
    name: string;
    surname: string;
    middlename: string;
    position: string;
    workDays: {
      comment: string;
      workDayId: number;
      workDate: Date;
      typeWorkDay: TypeWorkDay;
      startWorkingTime?: Date;
      endWorkingTime?: Date;
      estimation: TypeEstimation;
      timeWorkedOut?: string;
      prize?: number;
      fine?: number;
    }[];
  }[];
};

export type ShiftItem = {
  props: {
    id: number;
    posId: number;
    workerId: number;
    workDate: string;
    typeWorkDay: string;
    timeWorkedOut: string;
    startWorkingTime: string;
    endWorkingTime: string;
    estimation: string;
    status: string;
    cashAtStart: number;
    cashAtEnd: number | null;
    prize: number;
    fine: number;
    createdAt: string;
    updatedAt: string;
    createdById: number;
    updatedById: number;
  };
};

export type ShiftParamsResponse = ShiftItem[];

export type CreateDayShiftBody = {
  workerId: number;
  workDate: Date;
  posId: number;
  typeWorkDay: TypeWorkDay;
  startWorkingTime?: Date;
  endWorkingTime?: Date;
};

type GradingParameter = {
  id: number;
  name: string;
  estimationId: number | null;
};

type Estimation = {
  id: number;
  name: string;
};

type GradingParameterInfo = {
  parameters: GradingParameter[];
  allEstimations: Estimation[];
};

type DayShiftResponse = {
  id: number;
  workerId: number;
  workDate: Date;
  typeWorkDay: TypeWorkDay;
  timeWorkedOut?: string;
  startWorkingTime?: Date;
  endWorkingTime?: Date;
  estimation?: TypeEstimation | null;
  status?: StatusWorkDayShiftReport;
  cashAtStart?: number;
  cashAtEnd?: number;
  prize?: number | null;
  fine?: number | null;
  comment?: string;
  totalCar: number;
  workerName: string;
  gradingParameterInfo?: GradingParameterInfo;
};

export type UpdateDayShiftBody = {
  typeWorkDay?: TypeWorkDay;
  timeWorkedOut?: string;
  startWorkingTime?: Date;
  endWorkingTime?: Date;
  estimation?: TypeEstimation | null;
  prize?: number | null;
  fine?: number | null;
  comment?: string;
  gradingData?: {
    parameterId: number;
    estimationId: number | null;
  }[];
};

export type CreateCashOperBody = {
  type: TypeWorkDayShiftReportCashOper;
  sum: number;
  carWashDeviceId?: number;
  eventData?: Date;
  comment?: string;
};

type CreateCashOperResponse = {
  props: {
    id: number;
    workDayShiftReportId: number;
    carWashDeviceId?: number;
    eventDate?: Date;
    type: TypeWorkDayShiftReportCashOper;
    sum: number;
    comment?: string;
  };
};

export type GetDataOperResponse = {
  cashAtStart: number;
  replenishmentSum: number;
  expenditureSum: number;
  cashAtEnd: number;
};

type GetDayReportCleanResponse = {
  deviceId: number;
  programData: {
    programName: string;
    countProgram: number;
    time: string;
  }[];
};

type GetDayReportSuspResponse = {
  deviceId: number;
  programName: string;
  programDate: Date;
  programTime: string;
  lastProgramName: string;
  lastProgramDate: Date;
  lastProgramTime: string;
};

type ReturnCashCollectionResponse = {
  status: string;
};

type ManagerPaperBody = {
  group: ManagerPaperGroup;
  posId: number;
  paperTypeId: number;
  eventDate: Date;
  sum: number;
  userId: number;
  comment?: string;
};

type ManagerPaperResponse = {
  props: {
    id: number;
    group: ManagerPaperGroup;
    posId: number;
    paperTypeId: number;
    eventDate: Date;
    sum: number;
    userId: number;
    imageProductReceipt?: string;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
    reatedById: number;
    updatedById: number;
  };
};

type UpdateManagerBody = {
  managerPaperId: number;
  group?: ManagerPaperGroup;
  posId?: number;
  paperTypeId?: number;
  eventDate?: Date;
  sum?: number;
  userId?: number;
  comment?: string;
};

export type ManagerParams = {
  group: ManagerPaperGroup | '*';
  posId: number | '*';
  paperTypeId: number | '*';
  userId: number | '*';
  dateStartEvent?: Date;
  dateEndEvent?: Date;
  page?: number;
  size?: number;
};

type ManagersResponse = {
  managerPapers: {
    props: {
      id: number;
      group: ManagerPaperGroup;
      posId: number;
      paperTypeId: number;
      eventDate: Date;
      sum: number;
      userId: number;
      imageProductReceipt?: string;
      comment?: string;
      createdAt: Date;
      updatedAt: Date;
      createdById: number;
      updatedById: number;
    };
  }[];
  totalCount: number;
};

type ManagerPaperTypeResponse = {
  props: {
    id: number;
    name: string;
    type: ManagerPaperTypeClass;
  };
};

type ManagerPaperPeriodBody = {
  startPeriod: Date;
  endPeriod: Date;
  sumStartPeriod: number;
  sumEndPeriod: number;
  userId: number;
};

type ManagerPaperPeriodResponse = {
  props: {
    id: number;
    status: ManagerReportPeriodStatus;
    startPeriod: Date;
    endPeriod: Date;
    sumStartPeriod: number;
    sumEndPeriod: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    createdById?: number;
    updatedById?: number;
  };
};

type ManagerPeriodUpdateBody = {
  managerReportPeriodId: number;
  startPeriod?: Date;
  endPeriod?: Date;
  sumStartPeriod?: number;
  sumEndPeriod?: number;
};

type ManagerPeriodParams = {
  startPeriod: Date;
  endPeriod: Date;
  userId: number;
  page?: number;
  size?: number;
};

type ManagersPeriodResponse = {
  managerReportPeriods: {
    id: number;
    period: string;
    sumStartPeriod: number;
    sumEndPeriod: number;
    shortage: number;
    userId: number;
    status: ManagerReportPeriodStatus;
  }[];
  totalCount: number;
};

type ManagerPeriodIdResponse = {
  id: number;
  status: ManagerReportPeriodStatus;
  startPeriod: Date;
  endPeriod: Date;
  sumStartPeriod: number;
  sumEndPeriod: number;
  shortage: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  createdById?: number;
  updatedById?: number;
  managerPaper: {
    group: ManagerPaperGroup;
    posId: number;
    paperTypeId: number;
    paperTypeName: string;
    paperTypeType: ManagerPaperTypeClass;
    eventDate: Date;
    sum: number;
    imageProductReceipt?: string;
  }[];
};

type AllWorkersResponse = {
  props: {
    id: number;
    userRoleId: number;
    name: string;
    surname: string;
    middlename?: string;
    birthday?: Date;
    phone?: string;
    email: string;
    password: string;
    gender: string;
    position: string;
    status: string;
    avatar?: string;
    country: string;
    countryCode: number;
    timezone: number;
    refreshTokenId: string;
    receiveNotifications: number;
    createdAt: Date;
    updatedAt: Date;
  };
};

type ManagerGraphParams = {
  group: ManagerPaperGroup | '*';
  posId: number | '*';
  paperTypeId: number | '*';
  userId: number | '*';
  dateStartEvent?: Date;
  dateEndEvent?: Date;
};

type ManagerGraphResponse = {
  receipt: number;
  expenditure: number;
  balance: number;
};

type ManagerPaperTypeBody = {
  name: string;
  type: ManagerPaperTypeClass;
};

type UpdateManagerPaperTypeBody = {
  id: number;
  name?: string;
  type?: ManagerPaperTypeClass;
};

type DeleteManagerPapersBody = {
  ids: number[];
};

export async function postCollection(
  body: CollectionBody
): Promise<CollectionResponse> {
  const response: AxiosResponse<CollectionResponse> = await api.post(
    FINANCE.POST_CASH_COLLECTION,
    body
  );
  return response.data;
}

export async function recalculateCollection(
  body: RecalculateCollectionBody,
  id: number
): Promise<CollectionResponse> {
  const response: AxiosResponse<CollectionResponse> = await api.post(
    FINANCE.POST_CASH_COLLECTION + `/recalculate/${id}`,
    body
  );
  return response.data;
}

export async function sendCollection(
  body: RecalculateCollectionBody,
  id: number
): Promise<CollectionResponse> {
  const response: AxiosResponse<CollectionResponse> = await api.post(
    FINANCE.POST_CASH_COLLECTION + `/send/${id}`,
    body
  );
  return response.data;
}

export async function returnCollection(
  id: number
): Promise<ReturnCollectionResponse> {
  const response: AxiosResponse<ReturnCollectionResponse> = await api.patch(
    FINANCE.POST_CASH_COLLECTION + `/return/${id}`
  );
  return response.data;
}

export async function getCollectionById(
  id: number
): Promise<CollectionResponse> {
  const response: AxiosResponse<CollectionResponse> = await api.get(
    FINANCE.POST_CASH_COLLECTION + `/${id}`
  );
  return response.data;
}

export async function getCollections(
  params: CashCollectionParams
): Promise<CashCollectionsResponse> {
  const response: AxiosResponse<CashCollectionsResponse> = await api.get(
    FINANCE.POST_CASH_COLLECTION + `s`,
    { params }
  );
  return response.data;
}

export async function getTimestamp(
  posId: number | string
): Promise<TimestampResponse[]> {
  const response: AxiosResponse<TimestampResponse[]> = await api.get(
    FINANCE.TIME_STAMP + `/${posId}`
  );
  return response.data;
}

export async function postTimestamp(
  body: TimestampBody,
  id: number
): Promise<TimestampResponseBody> {
  const response: AxiosResponse<TimestampResponseBody> = await api.post(
    FINANCE.TIME_STAMP + `/${id}`,
    body
  );
  return response.data;
}

export async function createShift(
  body: ShiftRequestBody
): Promise<ShiftResponseBody> {
  const response: AxiosResponse<ShiftResponseBody> = await api.post(
    FINANCE.SHIFT_REPORT_CREATE,
    body
  );
  return response.data;
}

export async function addWorker(
  body: ShiftWorkerBody,
  id: number
): Promise<ShiftWorkerResponse> {
  const response: AxiosResponse<ShiftWorkerResponse> = await api.post(
    FINANCE.SHIFT_REPORT + `/worker/${id}`,
    body
  );
  return response.data;
}

export async function getShifts(
  params: GetShiftReportsParams
): Promise<ShiftParamsResponse> {
  const response: AxiosResponse<ShiftParamsResponse> = await api.get(
    FINANCE.SHIFT_REPORT + `s`,
    { params }
  );
  return response.data;
}

export async function getShiftById(id: number): Promise<ShiftWorkerResponse> {
  const response: AxiosResponse<ShiftWorkerResponse> = await api.get(
    FINANCE.SHIFT_REPORT + `/${id}`
  );
  return response.data;
}

export async function createDayShift(
  body: CreateDayShiftBody
): Promise<DayShiftResponse> {
  const response: AxiosResponse<DayShiftResponse> = await api.post(
    FINANCE.SHIFT_REPORT_CREATE,
    body
  );
  return response.data;
}

export async function getDayShiftById(id: number): Promise<DayShiftResponse> {
  const response: AxiosResponse<DayShiftResponse> = await api.get(
    FINANCE.SHIFT_REPORT + `/${id}`
  );
  return response.data;
}

export async function updateDayShift(
  body: UpdateDayShiftBody,
  id: number
): Promise<DayShiftResponse> {
  const response: AxiosResponse<DayShiftResponse> = await api.patch(
    FINANCE.SHIFT_REPORT + `/${id}`,
    body
  );
  return response.data;
}

export async function sendDayShift(id: number): Promise<DayShiftResponse> {
  const response: AxiosResponse<DayShiftResponse> = await api.post(
    FINANCE.SHIFT_REPORT + `/send/${id}`
  );
  return response.data;
}

export async function returnDayShift(
  id: number
): Promise<ReturnCashCollectionResponse> {
  const response: AxiosResponse<ReturnCashCollectionResponse> = await api.patch(
    FINANCE.SHIFT_REPORT + `/return/${id}`
  );
  return response.data;
}

export async function createCashOper(
  body: CreateCashOperBody,
  id: number
): Promise<CreateCashOperResponse> {
  const response: AxiosResponse<CreateCashOperResponse> = await api.post(
    FINANCE.SHIFT_REPORT + `/oper/${id}`,
    body
  );
  return response.data;
}

export async function getCashOperById(
  id: number
): Promise<GetDataOperResponse> {
  const response: AxiosResponse<GetDataOperResponse> = await api.get(
    FINANCE.SHIFT_REPORT + `/oper/${id}`
  );
  return response.data;
}

export async function getCashOperRefundById(
  id: number
): Promise<CreateCashOperResponse[]> {
  const response: AxiosResponse<CreateCashOperResponse[]> = await api.get(
    FINANCE.SHIFT_REPORT + `/refund/${id}`
  );
  return response.data;
}

export async function getCashOperCleanById(
  id: number
): Promise<GetDayReportCleanResponse[]> {
  const response: AxiosResponse<GetDayReportCleanResponse[]> = await api.get(
    FINANCE.SHIFT_REPORT + `/clean/${id}`
  );
  return response.data;
}

export async function getCashOperSuspiciousById(
  id: number
): Promise<GetDayReportSuspResponse[]> {
  const response: AxiosResponse<GetDayReportSuspResponse[]> = await api.get(
    FINANCE.SHIFT_REPORT + `/suspiciously/${id}`
  );
  return response.data;
}

export async function createManagerPaper(
  body: ManagerPaperBody,
  file?: File | null
): Promise<ManagerPaperResponse> {
  const formData = new FormData();

  for (const key in body) {
    const value = body[key as keyof ManagerPaperBody];
    if (value !== undefined) {
      // Convert value to a string if it's a number
      formData.append(key, value.toString());
    }
  }

  if (file) {
    formData.append('file', file);
  }

  const response: AxiosResponse<ManagerPaperResponse> = await api.post(
    FINANCE.MANAGER_PAPER,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function updateManagerPaper(
  body: UpdateManagerBody,
  file?: File | null
): Promise<ManagerPaperResponse> {
  const formData = new FormData();

  for (const key in body) {
    const value = body[key as keyof UpdateManagerBody];
    if (value !== undefined) {
      // Convert value to a string if it's a number
      formData.append(key, value.toString());
    }
  }

  if (file) {
    formData.append('file', file);
  }

  const response: AxiosResponse<ManagerPaperResponse> = await api.patch(
    FINANCE.MANAGER_PAPER,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function getAllManagerPaper(
  params: ManagerParams
): Promise<ManagersResponse> {
  const response: AxiosResponse<ManagersResponse> = await api.get(
    FINANCE.MANAGER_PAPER,
    { params }
  );
  return response.data;
}

export async function deleteManagerPapers(
  body: DeleteManagerPapersBody
): Promise<ReturnCashCollectionResponse> {
  const response: AxiosResponse<ReturnCashCollectionResponse> =
    await api.delete(FINANCE.MANAGER_PAPER + '/many', { data: body });
  return response.data;
}

export async function getAllManagerPaperTypes(): Promise<
  ManagerPaperTypeResponse[]
> {
  const response: AxiosResponse<ManagerPaperTypeResponse[]> = await api.get(
    FINANCE.MANAGER_PAPER + '/type'
  );
  return response.data;
}

export async function createManagerPaperPeriod(
  body: ManagerPaperPeriodBody
): Promise<ManagerPaperPeriodResponse> {
  const response: AxiosResponse<ManagerPaperPeriodResponse> = await api.post(
    FINANCE.MANAGER_PAPER + `/period`,
    body
  );
  return response.data;
}

export async function updateManagerPaperPeriod(
  body: ManagerPeriodUpdateBody
): Promise<ManagerPaperPeriodResponse> {
  const response: AxiosResponse<ManagerPaperPeriodResponse> = await api.patch(
    FINANCE.MANAGER_PAPER + `/period`,
    body
  );
  return response.data;
}

export async function sendManagerPaperPeriod(
  id: number
): Promise<ManagerPaperPeriodResponse> {
  const response: AxiosResponse<ManagerPaperPeriodResponse> = await api.patch(
    FINANCE.MANAGER_PAPER + `/period/send/${id}`
  );
  return response.data;
}

export async function returnManagerPaperPeriod(
  id: number
): Promise<ManagerPaperPeriodResponse> {
  const response: AxiosResponse<ManagerPaperPeriodResponse> = await api.patch(
    FINANCE.MANAGER_PAPER + `/period/return/${id}`
  );
  return response.data;
}

export async function getAllManagerPeriods(
  params: ManagerPeriodParams
): Promise<ManagersPeriodResponse> {  
  const response: AxiosResponse<ManagersPeriodResponse> = await api.get(
    FINANCE.MANAGER_PAPER + `/period`,
    { params }
  );
  return response.data;
}

export async function deleteManagerPaperPeriod(
  id: number
): Promise<ReturnCashCollectionResponse> {
  const response: AxiosResponse<ReturnCashCollectionResponse> =
    await api.delete(FINANCE.MANAGER_PAPER + `/period/${id}`);
  return response.data;
}

export async function getManagerPeriodById(
  id: number
): Promise<ManagerPeriodIdResponse> {
  const response: AxiosResponse<ManagerPeriodIdResponse> = await api.get(
    FINANCE.MANAGER_PAPER + `/period/${id}`
  );
  return response.data;
}

export async function getAllWorkers(id: number): Promise<AllWorkersResponse[]> {
  const response: AxiosResponse<AllWorkersResponse[]> = await api.get(
    FINANCE.GET_WORKER + `/${id}`
  );
  return response.data;
}

export async function getAllManagerPaperGraph(
  params: ManagerGraphParams
): Promise<ManagerGraphResponse> {
  const response: AxiosResponse<ManagerGraphResponse> = await api.get(
    FINANCE.MANAGER_PAPER + '/statistic',
    { params }
  );
  return response.data;
}

export async function createManagerPaperType(
  body: ManagerPaperTypeBody
): Promise<ManagerPaperTypeResponse> {
  const response: AxiosResponse<ManagerPaperTypeResponse> = await api.post(
    FINANCE.MANAGER_PAPER + `/type`,
    body
  );
  return response.data;
}

export async function updateManagerPaperType(
  body: UpdateManagerPaperTypeBody
): Promise<ManagerPaperTypeResponse> {
  const response: AxiosResponse<ManagerPaperTypeResponse> = await api.patch(
    FINANCE.MANAGER_PAPER + `/type`,
    body
  );
  return response.data;
}
