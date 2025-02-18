import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum FINANCE {
    POST_CASH_COLLECTION = 'user/finance/cash-collection',
    TIME_STAMP = 'user/finance/time-stamp',
    SHIFT_REPORT = 'user/finance/shift-report'
}

enum TypeWorkDay {
    WORKING = "WORKING",
    WEEKEND = "WEEKEND",
    MEDICAL = "MEDICAL",
    VACATION = "VACATION",
    TIMEOFF = "TIMEOFF",
    TRUANCY = "TRUANCY"
}

enum TypeEstimation {
    NO_VIOLATION = "NO_VIOLATION",
    GROSS_VIOLATION = "GROSS_VIOLATION",
    MINOR_VIOLATION = "MINOR_VIOLATION",
    ONE_REMARK = "ONE_REMARK"
}

type CollectionBody = {
    cashCollectionDate: Date;
    posId: number;
}

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
    }[]
}

type RecalculateCollectionBody = {
    cashCollectionDeviceData: {
        cashCollectionDeviceId: number;
        tookMoneyTime: Date;
    }[]
    cashCollectionDeviceTypeData: {
        cashCollectionDeviceTypeId: number;
        sumCoin?: number;
        sumPaper?: number;
    }[]
}

type ReturnCollectionResponse = {
    status: string
}

type CashCollectionParams = {
    dateStart: Date;
    dateEnd: Date;
    page?: number;
    size?: number;
}

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
}

type TimestampResponse = {
    deviceId: number;
    deviceName: string;
    oldTookMoneyTime?: Date;
}

type TimestampBody = {
    dateTimeStamp: Date;
}

type TimestampResponseBody = {
    deviceId: number;
    tookMoneyTime: Date;
}

type ShiftRequestBody = {
    startDate: Date;
    endDate: Date;
    posId: number;
}

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
    }
}

type ShiftWorkerBody = {
    userId: number;
}

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
            workDayId: number;
            workDate: Date;
            typeWorkDay: TypeWorkDay;
            estimation: TypeEstimation;
            timeWorkedOut?: string;
            prize?: number;
            fine?: number;
        }[];
    }[];
}

type ShiftParamsResponse = {
    shiftReportsData: {
        id: number;
        period: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        updatedById: number;
    }[];
    totalCount: number;
}

type CreateDayShiftBody = {
    shiftReportId: number;
    userId: number;
    workDate: Date;
}

type DayShiftResponse = {
    id: number;
    workerId: number;
    workDate: Date;
    typeWorkDay: TypeWorkDay;
    timeWorkedOut?: string;
    startWorkingTime?: Date;
    endWorkingTime?: Date;
    estimation?: TypeEstimation | null;
    prize?: number | null;
    fine?: number | null;
    comment?: string;
}

type UpdateDayShiftBody = {
    typeWorkDay?: TypeWorkDay;
    timeWorkedOut?: string;
    startWorkingTime?: Date;
    endWorkingTime?: Date;
    estimation?: TypeEstimation | null;
    prize?: number | null;
    fine?: number | null;
    comment?: string;
}

export async function postCollection(body: CollectionBody): Promise<CollectionResponse> {
    console.log(body);
    const response: AxiosResponse<CollectionResponse> = await api.post(FINANCE.POST_CASH_COLLECTION, body);
    console.log(response.data);
    return response.data;
}

export async function recalculateCollection(body: RecalculateCollectionBody, id: number): Promise<CollectionResponse> {
    console.log(body);
    const response: AxiosResponse<CollectionResponse> = await api.post(FINANCE.POST_CASH_COLLECTION + `/recalculate/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function sendCollection(body: RecalculateCollectionBody, id: number): Promise<CollectionResponse> {
    console.log(body);
    const response: AxiosResponse<CollectionResponse> = await api.post(FINANCE.POST_CASH_COLLECTION + `/send/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function returnCollection(id: number): Promise<ReturnCollectionResponse> {
    const response: AxiosResponse<ReturnCollectionResponse> = await api.patch(FINANCE.POST_CASH_COLLECTION + `/return/${id}`);
    console.log(response.data);
    return response.data;
}

export async function getCollectionById(id: number): Promise<CollectionResponse> {
    const response: AxiosResponse<CollectionResponse> = await api.get(FINANCE.POST_CASH_COLLECTION + `/${id}`);
    console.log(response.data);
    return response.data;
}

export async function getCollections(posId: number, params: CashCollectionParams): Promise<CashCollectionsResponse> {
    const response: AxiosResponse<CashCollectionsResponse> = await api.get(FINANCE.POST_CASH_COLLECTION + `s/${posId}`, { params });
    console.log(response.data);
    return response.data;
}

export async function getTimestamp(posId: number): Promise<TimestampResponse[]> {
    const response: AxiosResponse<TimestampResponse[]> = await api.get(FINANCE.TIME_STAMP + `/${posId}`);
    console.log(response.data);
    return response.data;
}

export async function postTimestamp(body: TimestampBody, id: number): Promise<TimestampResponseBody> {
    console.log(body);
    const response: AxiosResponse<TimestampResponseBody> = await api.post(FINANCE.TIME_STAMP + `/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function createShift(body: ShiftRequestBody): Promise<ShiftResponseBody> {
    console.log(body);
    const response: AxiosResponse<ShiftResponseBody> = await api.post(FINANCE.SHIFT_REPORT, body);
    console.log(response.data);
    return response.data;
}

export async function addWorker(body: ShiftWorkerBody, id: number): Promise<ShiftWorkerResponse> {
    console.log(body);
    const response: AxiosResponse<ShiftWorkerResponse> = await api.post(FINANCE.SHIFT_REPORT + `/worker/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function getShifts(posId: number, params: CashCollectionParams): Promise<ShiftParamsResponse> {
    const response: AxiosResponse<ShiftParamsResponse> = await api.get(FINANCE.SHIFT_REPORT + `s/${posId}`, { params });
    console.log(response.data);
    return response.data;
}

export async function getShiftById(id: number): Promise<ShiftWorkerResponse> {
    const response: AxiosResponse<ShiftWorkerResponse> = await api.get(FINANCE.SHIFT_REPORT + `/${id}`);
    console.log(response.data);
    return response.data;
}

export async function createDayShift(body: CreateDayShiftBody): Promise<DayShiftResponse> {
    console.log(body);
    const response: AxiosResponse<DayShiftResponse> = await api.post(FINANCE.SHIFT_REPORT + '/day-report', body);
    console.log(response.data);
    return response.data;
}

export async function getDayShiftById(id: number): Promise<DayShiftResponse> {
    const response: AxiosResponse<DayShiftResponse> = await api.get(FINANCE.SHIFT_REPORT + `/day-report/${id}`);
    console.log(response.data);
    return response.data;
}

export async function updateDayShift(body: UpdateDayShiftBody, id: number): Promise<DayShiftResponse> {
    console.log(body);
    const response: AxiosResponse<DayShiftResponse> = await api.patch(FINANCE.SHIFT_REPORT + `/day-report/${id}`, body);
    console.log(response.data);
    return response.data;
}
