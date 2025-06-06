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
    posId: number | string;
    placementId: number | string;
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
    address: string;
    organizationId: number;
    placementId: number;
    timezone: number;
    posStatus: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
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
    period?: number;
    markdownDescription?: string;
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
    tags: {
        id: number;
        name: string;
        code?: string;
    }[];
}

type TechTaskBody = {
    name: string;
    posId: number;
    type: string;
    period?: number;
    markdownDescription?: string;
    startDate: Date;
    endSpecifiedDate?: Date;
    techTaskItem: number[];
    tagIds: number[];
}

type UpdateTechTaskBody = {
    techTaskId: number;
    name?: string;
    status?: string;
    period?: number;
    markdownDescription?: string;
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
        tags: {
            id: number;
            name: string;
            code?: string;
        }[];
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
    tags: {
        id: number;
        name: string;
        code?: string;
    }[]
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
    period?: number;
    markdownDescription?: string;
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
        value?: string | null;
        image?: string | null;
    }[];
    tags: {
        id: number;
        name: string;
        code?: string;
    }[];
}

type TechTaskShapeBody = {
    valueData: {
        itemValueId: number;
        value: string;
    }[];
};


type ChemicalParams = {
    dateStart: string;
    dateEnd: string;
    posId: number | string;
    placementId: number | string;
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

type PosParams = {
    placementId: number | string;
}

type TechTaskParams = {
    posId: number | string;
    placementId: number | string;
}

type ProgramParams = {
    posId: number | string;
}

type CreateTags = {
    name: string;
    code?: string;
}

type CreateTagsResponse = {
    props: {
        id: number;
        name: string;
        code?: string;
    }
}

export async function getIncident(params: IncidentParam): Promise<IncidentResponse[]> {
    const response: AxiosResponse<IncidentResponse[]> = await api.get(EQUIPMENT.GET_INCIDENT, { params });

    return response.data;
}

export async function createIncident(body: IncidentBody): Promise<PostIncidentResponse> {
    const response: AxiosResponse<PostIncidentResponse> = await api.post(EQUIPMENT.GET_INCIDENT, body);
    return response.data;
}

export async function updateIncident(body: UpdateIncidentBody): Promise<PostIncidentResponse> {
    const response: AxiosResponse<PostIncidentResponse> = await api.patch(EQUIPMENT.GET_INCIDENT, body);
    return response.data;
}

export async function getPoses(params: PosParams): Promise<POSRESPONSE[]> {
    const response: AxiosResponse<POSRESPONSE[]> = await api.get(EQUIPMENT.GET_POS, { params });

    return response.data;
}

export async function getWorkers(): Promise<WorkerResponse[]> {
    const response: AxiosResponse<WorkerResponse[]> = await api.get(EQUIPMENT.GET_WORKER);

    return response.data;
}

export async function getDevices(posId: number | string): Promise<DeviceResponse[]> {
    const response: AxiosResponse<DeviceResponse[]> = await api.get(EQUIPMENT.GET_POS_DEVICE + `/${posId}`);

    return response.data;
}

export async function getEquipmentKnots(posId: number | string): Promise<EquipmentKnotResponse[]> {
    const response: AxiosResponse<EquipmentKnotResponse[]> = await api.get(EQUIPMENT.GET_EQUIPMENT + `/${posId}`);

    return response.data;
}

export async function getIncidentEquipmentKnots(id: number): Promise<IncidentEquipmentKnotResponse[]> {
    const response: AxiosResponse<IncidentEquipmentKnotResponse[]> = await api.get(EQUIPMENT.GET_INCIDENT_EQUIPMENT + `/${id}`);

    return response.data;
}

export async function getPrograms(params: ProgramParams): Promise<AllProgramsResponse[]> {
    const response: AxiosResponse<AllProgramsResponse[]> = await api.get(EQUIPMENT.GET_PROGRAMS, { params });

    return response.data;
}

export async function getTechTasks(params: TechTaskParams): Promise<TechTasksResponse[]> {
    const response: AxiosResponse<TechTasksResponse[]> = await api.get(TECHTASKS.GET_TECH_TASKS, { params });

    return response.data;
}

export async function createTechTask(body: TechTaskBody): Promise<TechTaskResponse> {
    const response: AxiosResponse<TechTaskResponse> = await api.post(TECHTASKS.CREATE_TECH_TASK, body);
    return response.data;
}

export async function updateTechTask(body: UpdateTechTaskBody): Promise<TechTaskResponse> {
    const response: AxiosResponse<TechTaskResponse> = await api.patch(TECHTASKS.CREATE_TECH_TASK, body);
    return response.data;
}

export async function readTechTasks(params: TechTaskParams): Promise<ReadTechTasksResponse[]> {
    const response: AxiosResponse<ReadTechTasksResponse[]> = await api.get(TECHTASKS.READ_TECH_TASKS, { params });

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

export async function createTechTaskShape(
    id: number,
    body: TechTaskShapeBody,
    files: { itemValueId: number; file: File }[]
): Promise<TechTaskResponse> {
    const formData = new FormData();

    // Append JSON valueData
    formData.append('valueData', JSON.stringify(body.valueData));

    // Append files with raw itemValueId as key
    files?.forEach(({ itemValueId, file }) => {
        formData.append(`${itemValueId}`, file);
    });

    const response: AxiosResponse<TechTaskResponse> = await api.post(
        `${TECHTASKS.CREATE_TECH_TASK}/${id}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
}

export async function getChemicalReport(params: ChemicalParams): Promise<ChemicalResponse[]> {
    const response: AxiosResponse<ChemicalResponse[]> = await api.get(TECHTASKS.GET_CHEMICAL_CONSUMPTION, { params });

    return response.data;
}

export async function getConsumptionRate(posId: number | string): Promise<ConsumptionRateResponse[]> {
    const response: AxiosResponse<ConsumptionRateResponse[]> = await api.get(TECHTASKS.GET_CONSUMPTION_RATE + `/${posId}`);

    return response.data;
}

export async function patchProgramCoefficient(id: number | string, body: ConsumptionRateCoeffPatch): Promise<ConsumptionRateCoeffPatchResponse[]> {
    const response: AxiosResponse<ConsumptionRateCoeffPatchResponse[]> = await api.patch(TECHTASKS.GET_CONSUMPTION_RATE + `/${id}`, body);
    return response.data;
}

export async function createTag(body: CreateTags): Promise<CreateTagsResponse> {
    const response: AxiosResponse<CreateTagsResponse> = await api.post(TECHTASKS.CREATE_TECH_TASK + '/tag', body);
    return response.data;
}

export async function getTags(): Promise<CreateTagsResponse[]> {
    const response: AxiosResponse<CreateTagsResponse[]> = await api.get(TECHTASKS.CREATE_TECH_TASK + '/tag');

    return response.data;
}
