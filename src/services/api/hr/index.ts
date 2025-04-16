import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum HR {
    GET_WORKERS = 'user/hr/worker',
    GET_POSITIONS = 'user/hr/position'
}

type WorkerRequest = {
    name: string;
    hrPositionId: number;
    placementId: number;
    organizationId: number;
    startWorkDate?: Date;
    phone?: string;
    email?: string;
    description?: string;
    monthlySalary: number;
    dailySalary: number;
    percentageSalary: number;
    gender?: string;
    citizenship?: string;
    passportSeries?: string;
    passportNumber?: string;
    passportExtradition?: string;
    passportDateIssue?: Date;
    inn?: string;
    snils?: string;
}

type WorkerResponse = {
    props: {
        id: number;
        name: string;
        hrPositionId: number;
        placementId: number;
        organizationId: number;
        startWorkDate?: Date;
        phone?: string;
        email?: string;
        description?: string;
        avatar?: string;
        monthlySalary: number;
        dailySalary: number;
        percentageSalary: number;
        gender?: string;
        citizenship?: string;
        passportSeries?: string;
        passportNumber?: string;
        passportExtradition?: string;
        passportDateIssue?: Date;
        inn?: string;
        snils?: string;
    }
}

type UpdateWorkerRequest = {
    workerId: number;
    hrPositionId?: number;
    placementId?: number;
    startWorkDate?: Date;
    phone?: string;
    email?: string;
    description?: string;
    monthlySalary?: number;
    dailySalary?: number;
    percentageSalary?: number;
    gender?: string;
    citizenship?: string;
    passportSeries?: string;
    passportNumber?: string;
    passportExtradition?: string;
    passportDateIssue?: Date;
    inn?: string;
    snils?: string;
}

type WorkerParams = {
    placementId: number | string;
    hrPositionId: number | '*';
    organizationId: number | '*';
    name?: string;
    page?: number;
    size?: number;
}

type PositionRequest = {
    name: string;
    description?: string;
}

type PositionResponse = {
    props: {
        id: number;
        name: string;
        description?: string;
    }
}

type UpdatePositionRequest = {
    positionId: number;
    description?: string;
}

export async function createWorker(body: WorkerRequest): Promise<WorkerResponse> {
    console.log(body);
    const response: AxiosResponse<WorkerResponse> = await api.post(HR.GET_WORKERS, body);
    console.log(response.data);
    return response.data;
}

export async function updateWorker(body: UpdateWorkerRequest): Promise<WorkerResponse> {
    console.log(body);
    const response: AxiosResponse<WorkerResponse> = await api.patch(HR.GET_WORKERS, body);
    console.log(response.data);
    return response.data;
}

export async function getWorkers(params: WorkerParams): Promise<WorkerResponse[]> {
    const response: AxiosResponse<WorkerResponse[]> = await api.get(HR.GET_WORKERS + 's', { params });

    return response.data;
}

export async function getWorkerById(id: number): Promise<WorkerResponse> {
    const response: AxiosResponse<WorkerResponse> = await api.get(HR.GET_WORKERS + `/${id}`);

    return response.data;
}

export async function createPosition(body: PositionRequest): Promise<PositionResponse> {
    console.log(body);
    const response: AxiosResponse<PositionResponse> = await api.post(HR.GET_POSITIONS, body);
    console.log(response.data);
    return response.data;
}

export async function updatePosition(body: UpdatePositionRequest): Promise<PositionResponse> {
    console.log(body);
    const response: AxiosResponse<PositionResponse> = await api.patch(HR.GET_POSITIONS, body);
    console.log(response.data);
    return response.data;
}

export async function getPositions(): Promise<PositionResponse[]> {
    const response: AxiosResponse<PositionResponse[]> = await api.get(HR.GET_POSITIONS + 's');

    return response.data;
}

export async function getPositionById(id: number): Promise<PositionResponse> {
    const response: AxiosResponse<PositionResponse> = await api.get(HR.GET_POSITIONS + `/${id}`);

    return response.data;
}