import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum POS {
    GET_POSES = 'user/organization/pos',
    POST_POS = 'user/pos',
    GET_DEPOSIT = '/user/pos/monitoring',
    GET_PROGRAMS = '/user/pos/program'
}

enum CarWashPosType {
    SelfService = "SelfService",
    Portal = "Portal",
    SelfServiceAndPortal = "SelfServiceAndPortal"
}

type Pos = {
    id: number;
    name: string;
    slug: string;
    monthlyPlan: number;
    timeWork: string;
    organizationId: number;
    posMetaData: string;
    timezone: number;
    image: string;
    rating: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
    address:
    {
        id: number;
        city: string;
        location: string;
        lat: number;
        lon: number;
    };
    posType:
    {
        id: number;
        name: string;
        slug: string;
        carWashPosType: string;
        minSumOrder: number;
        maxSumOrder: number;
        stepSumOrder: number;
    };
}

type PosBody = {
    name: string;
    monthlyPlan: number | null;
    timeWork: string | null;
    posMetaData?: string;
    address:
    {
        city: string;
        location: string;
        lat?: number | null;
        lon?: number | null;
    }
    organizationId: number | null;
    carWashPosType: string;
    minSumOrder: number | null;
    maxSumOrder: number | null;
    stepSumOrder: number | null;

}

type DepositParam = {
    dateStart: Date;
    dateEnd: Date;
    posId: string | number;
    placementId: number | string;
    page?: number;
    size?: number;
}

type DepositResponse = {
    id: number;
    name: string;
    city: string;
    counter: number;
    cashSum: number;
    virtualSum: number;
    yandexSum: number;
    mobileSum: number;
    cardSum: number;
    lastOper: Date;
    discountSum: number;
    cashbackSumCard: number;
    cashbackSumMub: number;
}

type DepositPosResponse = {
    oper: {
        id: number;
        name: string;
        city: string;
        counter: number;
        cashSum: number;
        virtualSum: number;
        yandexSum: number;
        mobileSum: number;
        cardSum: number;
        lastOper: Date;
        discountSum: number;
        cashbackSumCard: number;
        cashbackSumMub: number;
    }[]
    totalCount: number;
}

type DepositDeviceResponse = {
    oper: {
        id: number;
        sumOper: number;
        dateOper: Date;
        dateLoad: Date;
        counter: number;
        localId: number;
        currencyType: string;
    }[];
    totalCount: number;
}

type Program = {
    id: number;
    name: string;
    posType?: CarWashPosType;
    programsInfo:
    {
        programName: string;
        counter: number;
        totalTime: number;
        averageTime: string;
        totalProfit?: number;
        averageProfit?: number;
        lastOper?: Date;
    }[]
}

type ProgramPosResponse = {
    prog: {
        id: number;
        name: string;
        posType?: CarWashPosType;
        programsInfo:
        {
            programName: string;
            counter: number;
            totalTime: number;
            averageTime: string;
            totalProfit?: number;
            averageProfit?: number;
            lastOper?: Date;
        }[]
    }[]
    totalCount: number;
}

type ProgramDevice = {
    prog: {
        id: number;
        name: string;
        dateBegin: Date;
        dateEnd: Date;
        time: string;
        localId: number;
        payType: string;
        isCar: number;
    }[];
    totalCount: number;
}

type DevicesParams = {
    dateStart: Date;
    dateEnd: Date;
}

type DeviceParams = {
    dateStart: Date;
    dateEnd: Date;
    page?: number;
    size?: number;
}

type PlanFactResponse = {
    plan: {
        posId: number;
        plan: number;
        cashFact: number;
        virtualSumFact: number;
        yandexSumFact: number;
        sumFact: number;
        completedPercent: number;
        notCompletedPercent: number;
    }[]
    totalCount: number;
}

export async function getPos(userId: number): Promise<Pos[]> {
    const url = POS.GET_POSES + `/${userId}`;
    const response: AxiosResponse<Pos[]> = await api.get(url);
    return response.data;
}

export async function postPosData(body: PosBody): Promise<Pos> {
    const response: AxiosResponse<Pos> = await api.post(POS.POST_POS, body);
    return response.data;
}

export async function getDeposit(posId: number | string, params: DevicesParams): Promise<DepositResponse[]> {
    const response: AxiosResponse<DepositResponse[]> = await api.get(POS.GET_DEPOSIT + `/${posId}`, { params });
    return response.data;
}

export async function getDepositPos(params: DepositParam): Promise<DepositPosResponse> {
    const response: AxiosResponse<DepositPosResponse> = await api.get(POS.GET_DEPOSIT, { params });
    return response.data;
}

export async function getDepositDevice(deviceId: number, params: DeviceParams): Promise<DepositDeviceResponse> {
    const response: AxiosResponse<DepositDeviceResponse> = await api.get(`/user/device/monitoring/${deviceId}`, { params });
    return response.data;
}

export async function getPrograms(posId: number | string, params: DevicesParams): Promise<Program[]> {
    const response: AxiosResponse<Program[]> = await api.get(POS.GET_PROGRAMS + `/${posId}`, { params });
    return response.data;
}

export async function getProgramPos(params: DepositParam): Promise<ProgramPosResponse> {
    const response: AxiosResponse<ProgramPosResponse> = await api.get(POS.GET_PROGRAMS, { params });
    return response.data;
}


export async function getProgramDevice(deviceId: number, params: DeviceParams): Promise<ProgramDevice> {
    const response: AxiosResponse<ProgramDevice> = await api.get(`/user/device/program/${deviceId}`, { params });
    return response.data;
}

export async function getPlanFact(params: DepositParam): Promise<PlanFactResponse> {
    const response: AxiosResponse<PlanFactResponse> = await api.get(POS.POST_POS + "/plan-fact", { params });
    return response.data;
}


