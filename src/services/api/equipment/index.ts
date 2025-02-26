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

enum TECHTASKS {
    GET_TECH_TASKS = 'user/tech-task/manage',
    CREATE_TECH_TASK = 'user/tech-task',
    READ_TECH_TASKS = 'user/tech-task/read',
    READ_TECH_TASK_ITEM = 'user/tech-task/item',
    GET_CHEMICAL_CONSUMPTION = 'user/tech-task/chemistry-report',
    GET_CONSUMPTION_RATE = 'user/equipment/rate'
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

type TechTasksResponse = {
    id: number;
    name: string;
    posId: number;
    type: string;
    status: string;
    period: string;
    nextCreateDate?: Date;
    endSpecifiedDate?: Date;
    startDate: Date;
    items: {
        id: number;
        title: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
}

type TechTaskBody = {
    name: string;
    posId: number;
    type: string;
    period: string;
    startDate: Date;
    endSpecifiedDate?: Date;
    techTaskItem: number[];
}

type UpdateTechTaskBody = {
    techTaskId: number;
    name?: string;
    type?: string;
    status?: string;
    period?: string;
    endSpecifiedDate?: Date;
    techTaskItem?: number[];
}

type TechTaskResponse = {
    props: {
        id: number;
        name: string;
        posId: number;
        type: string;
        status: string;
        period: string;
        nextCreateDate?: Date;
        endSpecifiedDate?: Date;
        startDate: Date;
        startWorkDate?: Date;
        sendWorkDate?: Date;
        executorId?: number;
        createdAt?: Date;
        updatedAt?: Date;
        createdById: number;
        updatedById: number;
    }
}

type ReadTechTasksResponse = {
    id: number;
    name: string;
    posId: number;
    type: string;
    status: string;
    endSpecifiedDate?: Date;
    startWorkDate?: Date;
    sendWorkDate?: Date;
    executorId?: number;
}

type TechTaskItemResponse = {
    props: {
        id: number;
        title: string;
        code?: string;
        type: string;
        group: string;
    }
}

type TechTaskShapeResponse = {
    id: number;
    name: string;
    posId: number;
    type: string;
    status: string;
    endSpecifiedDate?: Date;
    startWorkDate?: Date;
    sendWorkDate?: Date;
    executorId?: number;
    items: {
        id: number;
        title: string;
        type: string;
        group: string;
        code: string;
        value?: string;
    }[];
}

type TechTaskShapeBody = {
    valueData: {
        itemValueId: number;
        value: string;
    }[]
}

type ChemicalParams = {
    posId: number;
    dateStart: string;
    dateEnd: string;
}

type ChemicalResponse = {
    techTaskId: number;
    period: string;
    techRateInfos: {
        code: string;
        spent: string;
        time: string;
        recalculation: string;
        service: string;
    }[]
}

type ConsumptionRateResponse = {
    id: number;
    programTypeName: string;
    literRate: number;
    concentration: number;
}

type ConsumptionRateCoeffPatch = {
    valueData: {
        programTechRateId: number;
        literRate: number;
        concentration: number;
    }[]
}

type ConsumptionRateCoeffPatchResponse = {
    props: {
        id: number;
        carWashPosId: number;
        carWashDeviceProgramsTypeId: number;
        literRate: number;
        concentration: number;
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

export async function getTechTasks(posId: number): Promise<TechTasksResponse[]> {
    const response: AxiosResponse<TechTasksResponse[]> = await api.get(TECHTASKS.GET_TECH_TASKS + `/${posId}`);

    return response.data;
}

export async function createTechTask(body: TechTaskBody): Promise<TechTaskResponse> {
    console.log(body);
    const response: AxiosResponse<TechTaskResponse> = await api.post(TECHTASKS.CREATE_TECH_TASK, body);
    console.log(response.data);
    return response.data;
}

export async function updateTechTask(body: UpdateTechTaskBody): Promise<TechTaskResponse> {
    console.log(body);
    const response: AxiosResponse<TechTaskResponse> = await api.patch(TECHTASKS.CREATE_TECH_TASK, body);
    console.log(response.data);
    return response.data;
}

export async function readTechTasks(posId: number): Promise<ReadTechTasksResponse[]> {
    const response: AxiosResponse<ReadTechTasksResponse[]> = await api.get(TECHTASKS.READ_TECH_TASKS + `/${posId}`);

    return response.data;
}

export async function getTechTaskItem(): Promise<TechTaskItemResponse[]> {
    const response: AxiosResponse<TechTaskItemResponse[]> = await api.get(TECHTASKS.READ_TECH_TASK_ITEM);

    return response.data;
}

export async function getTechTaskShapeItem(id: number): Promise<TechTaskShapeResponse> {
    const response: AxiosResponse<TechTaskShapeResponse> = await api.get(TECHTASKS.CREATE_TECH_TASK + `/${id}`);

    return response.data;
}

export async function createTechTaskShape(id: number, body: TechTaskShapeBody): Promise<TechTaskResponse> {
    console.log(body);
    const response: AxiosResponse<TechTaskResponse> = await api.post(TECHTASKS.CREATE_TECH_TASK + `/${id}`, body);
    console.log(response.data);
    return response.data;
}

export async function getChemicalReport(params: ChemicalParams, posId: number): Promise<ChemicalResponse[]> {
    const response: AxiosResponse<ChemicalResponse[]> = await api.get(TECHTASKS.GET_CHEMICAL_CONSUMPTION + `/${posId}`, { params });

    return response.data;
}

export async function getConsumptionRate(posId: number): Promise<ConsumptionRateResponse[]> {
    const response: AxiosResponse<ConsumptionRateResponse[]> = await api.get(TECHTASKS.GET_CONSUMPTION_RATE + `/${posId}`);

    return response.data;
}

export async function patchProgramCoefficient(id: number, body: ConsumptionRateCoeffPatch): Promise<ConsumptionRateCoeffPatchResponse[]> {
    console.log(body);
    const response: AxiosResponse<ConsumptionRateCoeffPatchResponse[]> = await api.patch(TECHTASKS.GET_CONSUMPTION_RATE + `/${id}`, body);
    console.log(response.data);
    return response.data;
}
