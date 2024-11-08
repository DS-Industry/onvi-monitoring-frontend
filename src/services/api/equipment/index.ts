import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum EQUIPMENT {
    GET_INCIDENT = 'user/incident',
    GET_POS = 'user/pos/filter',
    GET_WORKER = 'user/permission/worker',
    GET_POS_DEVICE = 'user/device/filter/pos',
    GET_EQUIPMENT = 'user/equipment/pos',
    GET_INCIDENT_EQUIPMENT = 'user/equipment/incident-info',
    GET_PROGRAMS = 'user/device/program/type'
}

type IncidentParam = {
    dateStart: string;
    dateEnd: string;
    posId?: number;
}

type IncidentResponse = {
    id: number;
    posId: number;
    workerId: number;
    appearanceDate: Date;
    startDate: Date;
    finishDate: Date;
    objectName: string;
    equipmentKnot: string;
    incidentName: string;
    incidentReason: string;
    incidentSolution: string;
    repair: string;
    downtime: string;
    comment: string;
    programId: number;
}

type IncidentBody = {
    posId: number;
    workerId: number;
    appearanceDate: string;
    startDate: string;
    finishDate: string;
    objectName: string;
    equipmentKnotId?: number;
    incidentNameId?: number;
    incidentReasonId?: number;
    incidentSolutionId?: number;
    downtime: number;
    comment: string;
    carWashDeviceProgramsTypeId?: number;
}

type UpdateIncidentBody = {
    incidentId: number;
    workerId?: number;
    appearanceDate?: string;
    startDate?: string;
    finishDate?: string;
    objectName?: string;
    equipmentKnotId?: number;
    incidentNameId?: number;
    incidentReasonId?: number;
    incidentSolutionId?: number;
    downtime?: number;
    comment?: string;
    carWashDeviceProgramsTypeId?: number;
}

type PostIncidentResponse = {
    props: {
        id: number;
        posId: number;
        workerId: number;
        appearanceDate: Date;
        startDate: Date;
        finishDate: Date;
        objectName: string;
        equipmentKnotId: number;
        incidentNameId: number;
        incidentReasonId: number;
        incidentSolutionId: number;
        downtime: number;
        comment: string;
        carWashDeviceProgramsTypeId: number;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        updatedById: number;
    }

}

type POSRESPONSE = {
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

type WorkerResponse = {
    id: number;
    name: string;
    surname: string;
    middlename: string;
    organizationName: string;
    position: string;
    roleName: string;
    status: string;
    createAt: Date;
}

type DeviceResponse = {
    props: {
        id: number;
        name: string;
        carWashDeviceMetaData: string;
        status: string;
        ipAddress: string;
        carWashDeviceTypeId: number;
        carWashPosId: number;
    }
}

type EquipmentKnotResponse = {
    props: {
        id: number;
        name: string;
        posId: number;
    }
}

type IncidentEquipmentKnotResponse = {
    id: number;
    problemName: string;
    reason: {
        id: number;
        infoName: string;
    }[];
    solution: {
        id: number;
        infoName: string;
    }[];
}

type AllProgramsResponse = {
    props: {
        id: number;
        carWashDeviceTypeId: number;
        name: string;
        code: string;
        description: string;
        orderNum: number;
    }
}

export async function getIncident(params: IncidentParam): Promise<IncidentResponse[]> {
    const response: AxiosResponse<IncidentResponse[]> = await api.get(EQUIPMENT.GET_INCIDENT, { params });

    return response.data;
}

export async function createIncident(body: IncidentBody): Promise<PostIncidentResponse> {
    console.log(body);
    const response: AxiosResponse<PostIncidentResponse> = await api.post(EQUIPMENT.GET_INCIDENT, body);
    console.log(response.data);
    return response.data;
}

export async function updateIncident(body: UpdateIncidentBody): Promise<PostIncidentResponse> {
    console.log(body);
    const response: AxiosResponse<PostIncidentResponse> = await api.patch(EQUIPMENT.GET_INCIDENT, body);
    console.log(response.data);
    return response.data;
}

export async function getPoses(): Promise<POSRESPONSE[]> {
    const response: AxiosResponse<POSRESPONSE[]> = await api.get(EQUIPMENT.GET_POS);

    return response.data;
}

export async function getWorkers(): Promise<WorkerResponse[]> {
    const response: AxiosResponse<WorkerResponse[]> = await api.get(EQUIPMENT.GET_WORKER);

    return response.data;
}

export async function getDevices(posId: number): Promise<DeviceResponse[]> {
    const response: AxiosResponse<DeviceResponse[]> = await api.get(EQUIPMENT.GET_POS_DEVICE + `/${posId}`);

    return response.data;
}

export async function getEquipmentKnots(posId: number): Promise<EquipmentKnotResponse[]> {
    const response: AxiosResponse<EquipmentKnotResponse[]> = await api.get(EQUIPMENT.GET_EQUIPMENT + `/${posId}`);

    return response.data;
}

export async function getIncidentEquipmentKnots(id: number): Promise<IncidentEquipmentKnotResponse[]> {
    const response: AxiosResponse<IncidentEquipmentKnotResponse[]> = await api.get(EQUIPMENT.GET_INCIDENT_EQUIPMENT + `/${id}`);

    return response.data;
}

export async function getPrograms(): Promise<AllProgramsResponse[]> {
    const response: AxiosResponse<AllProgramsResponse[]> = await api.get(EQUIPMENT.GET_PROGRAMS);

    return response.data;
}
