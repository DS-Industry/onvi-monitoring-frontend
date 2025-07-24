import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum HR {
    GET_WORKERS = 'user/hr/worker',
    GET_POSITIONS = 'user/hr/position',
    PREPAYMENT = 'user/hr/prepayment',
    PAYMENT = 'user/hr/payment'
}

type WorkerRequest = {
    name: string;
    hrPositionId: string;
    placementId: string;
    organizationId: string;
    startWorkDate?: Date;
    phone?: string;
    email?: string;
    description?: string;
    monthlySalary: string;
    dailySalary: string;
    percentageSalary: string;
    gender?: string;
    citizenship?: string;
    passportSeries?: string;
    passportNumber?: string;
    passportExtradition?: string;
    passportDateIssue?: Date;
    inn?: string;
    snils?: string;
}

export type TWorker = {
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
    workerId: string;
    hrPositionId?: string;
    placementId?: string;
    startWorkDate?: Date;
    phone?: string;
    email?: string;
    description?: string;
    monthlySalary?: string;
    dailySalary?: string;
    percentageSalary?: string;
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
    organizationId: number;
    description?: string;
}

type PositionResponse = {
    props: {
        id: number;
        name: string;
        organizationId: number;
        description?: string;
    }
}

type UpdatePositionRequest = {
    positionId: number;
    description?: string;
}

type PrepaymentCalculateBody = {
    organizationId: number;
    billingMonth: string;
    hrPositionId: number | '*';
}

type PrepaymentCalculateResponse = {
    hrWorkerId: number;
    name: string;
    hrPositionId: number;
    billingMonth: Date;
    monthlySalary: number;
    dailySalary: number;
    percentageSalary: number;
}

type PrepaymentCreateRequest = {
    payments: {
        hrWorkerId: number;
        paymentDate: Date;
        billingMonth: Date;
        countShifts: number;
        sum: number;
    }[]
}

type PrepaymentCreateResponse = {
    status: 'SUCCESS'
}

type PrepaymentFilter = {
    startPaymentDate: Date | string;
    endPaymentDate: Date | string;
    hrWorkerId: number | string;
    billingMonth: Date | string;
    page?: number;
    size?: number;
}

export type PrepaymentResponse = {
    hrWorkerId: number;
    name: string;
    hrPositionId: number;
    billingMonth: Date;
    paymentDate: Date;
    monthlySalary: number;
    dailySalary: number;
    percentageSalary: number;
    countShifts: number;
    sum: number;
    createdAt: Date;
    createdById: number;
}

type PaymentCalculateResponse = {
    hrWorkerId: number;
    name: string;
    hrPositionId: number;
    billingMonth: Date;
    monthlySalary: number;
    dailySalary: number;
    percentageSalary: number;
    prepaymentSum: number;
    prepaymentCountShifts: number;
}

type PaymentCreateRequest = {
    payments: {
        hrWorkerId: number;
        paymentDate: Date;
        billingMonth: Date;
        countShifts: number;
        sum: number;
        prize: number;
        fine: number;
    }[]
}

type PaymentsResponse = {
    hrWorkerId: number;
    name: string;
    hrPositionId: number;
    billingMonth: Date;
    paymentDate: Date;
    monthlySalary: number;
    dailySalary: number;
    percentageSalary: number;
    countShifts: number;
    prepaymentSum: number;
    paymentSum: number;
    prize: number;
    fine: number;
    totalPayment: number;
    createdAt: Date;
    createdById: number;
}

type addWorkerRequest = {
    organizationId: number;
    billingMonth: string;
    workerIds: number[];
}

export async function createWorker(body: TWorker["props"], file?: File | null): Promise<TWorker> {
    const formData = new FormData();

    for (const key in body) {
        const value = body[key as keyof TWorker["props"]];
        if (value !== undefined) {
            // Convert value to a string if it's a number
            formData.append(key, value.toString());
        }
    }

    if (file) {
        formData.append("file", file);
    }

    const response: AxiosResponse<TWorker> = await api.post(HR.GET_WORKERS, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export async function updateWorker(body: UpdateWorkerRequest, file?: File | null): Promise<TWorker> {
    const formData = new FormData();

    for (const key in body) {
        const value = body[key as keyof UpdateWorkerRequest];
        if (value !== undefined) {
            // Convert value to a string if it's a number
            formData.append(key, value.toString());
        }
    }

    if (file) {
        formData.append("file", file);
    }

    const response: AxiosResponse<TWorker> = await api.patch(HR.GET_WORKERS, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export async function getWorkers(params: WorkerParams): Promise<TWorker[]> {
    const response: AxiosResponse<TWorker[]> = await api.get(HR.GET_WORKERS + 's', { params });

    return response.data;
}

export async function getWorkerById(id: number): Promise<TWorker> {
    const response: AxiosResponse<TWorker> = await api.get(HR.GET_WORKERS + `/${id}`);

    return response.data;
}

export async function createPosition(body: PositionRequest): Promise<PositionResponse> {
    const response: AxiosResponse<PositionResponse> = await api.post(HR.GET_POSITIONS, body);
    return response.data;
}

export async function updatePosition(body: UpdatePositionRequest): Promise<PositionResponse> {
    const response: AxiosResponse<PositionResponse> = await api.patch(HR.GET_POSITIONS, body);
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

export async function calculatePrepayment(body: PrepaymentCalculateBody): Promise<PrepaymentCalculateResponse[]> {
    const response: AxiosResponse<PrepaymentCalculateResponse[]> = await api.post(HR.PREPAYMENT + '/calculate', body);
    return response.data;
}

export async function createPrepayment(body: PrepaymentCreateRequest): Promise<PrepaymentCreateResponse> {
    const response: AxiosResponse<PrepaymentCreateResponse> = await api.post(HR.PREPAYMENT, body);
    return response.data;
}

export async function getPrepayments(params: PrepaymentFilter): Promise<PrepaymentResponse[]> {
    const response: AxiosResponse<PrepaymentResponse[]> = await api.get(HR.PREPAYMENT + 's', { params });

    return response.data;
}

export async function calculatePayment(body: PrepaymentCalculateBody): Promise<PaymentCalculateResponse[]> {
    const response: AxiosResponse<PaymentCalculateResponse[]> = await api.post(HR.PAYMENT + '/calculate', body);
    return response.data;
}

export async function createPayment(body: PaymentCreateRequest): Promise<PrepaymentCreateResponse> {
    const response: AxiosResponse<PrepaymentCreateResponse> = await api.post(HR.PAYMENT, body);
    return response.data;
}

export async function getPayments(params: PrepaymentFilter): Promise<PaymentsResponse[]> {
    const response: AxiosResponse<PaymentsResponse[]> = await api.get(HR.PAYMENT + 's', { params });

    return response.data;
}

export async function addWorkerPrePayment(body: addWorkerRequest): Promise<PrepaymentCalculateResponse[]> {
    const response: AxiosResponse<PrepaymentCalculateResponse[]> = await api.post(HR.PREPAYMENT + '/calculate/workers', body);
    return response.data;
}

export async function addWorkerPayment(body: addWorkerRequest): Promise<PaymentCalculateResponse[]> {
    const response: AxiosResponse<PaymentCalculateResponse[]> = await api.post(HR.PAYMENT + '/calculate/workers', body);
    return response.data;
}