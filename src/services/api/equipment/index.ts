import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum EQUIPMENT {
  GET_INCIDENT = 'user/incident',
  GET_POS = 'user/pos/filter',
  GET_POS_DEVICE = 'user/device/filter/pos',
  GET_EQUIPMENT = 'user/equipment/pos',
  GET_INCIDENT_EQUIPMENT = 'user/equipment/incident-info',
  GET_PROGRAMS = 'user/device/program/type',
}

enum TECHTASKS {
  CREATE_TECH_TASK = 'user/tech-task',
  READ_TECH_TASK_ITEM = 'user/tech-task/item',
  GET_CHEMICAL_CONSUMPTION = 'user/tech-task/chemistry-report',
  GET_CONSUMPTION_RATE = 'user/equipment/rate',
}

export enum StatusTechTask {
  PAUSE = 'PAUSE',
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  FINISHED = 'FINISHED',
  OVERDUE = 'OVERDUE',
}

export enum TypeTechTask {
  ONETIME = 'ONETIME',
  REGULAR = 'REGULAR',
}

export enum PeriodType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export enum StatusWorkers {
  BLOCKED = 'BLOCKED',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  VERIFICATE = 'VERIFICATE'
}

type IncidentParam = {
  dateStart: string;
  dateEnd: string;
  posId?: number;
  placementId?: number;
};

export type Incident = {
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
};

export type IncidentBody = {
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
};

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
};

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
  };
};

export type PosResponse = {
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
};

export type WorkerResponse = {
  id: number;
  name: string;
  surname: string;
  middlename: string;
  organizationName: string;
  position: string;
  roleName: string;
  status: string;
  createAt: Date;
};

export type WorkerBlockResponse = {
  id: number;
  name: string;
  surname: string;
  middlename: string;
  email: string;
  position: string;
  userRoleId: number;
  status: StatusWorkers;
  createdAt: Date;
  updatedAt: Date;
};

type DeviceResponse = {
  props: {
    id: number;
    name: string;
    carWashDeviceMetaData: string;
    status: string;
    ipAddress: string;
    carWashDeviceTypeId: number;
    carWashPosId: number;
  };
};

type EquipmentKnotResponse = {
  props: {
    id: number;
    name: string;
    posId: number;
  };
};

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
};

type AllProgramsResponse = {
  props: {
    id: number;
    carWashDeviceTypeId: number;
    name: string;
    code: string;
    description: string;
    orderNum: number;
  };
};

export type TechTaskBody = {
  name: string;
  posId: number;
  type: TypeTechTask;
  periodType?: PeriodType;
  customPeriodDays?: number;
  markdownDescription?: string;
  startDate: Date;
  endSpecifiedDate?: Date;
  techTaskItem: number[];
  tagIds: number[];
};

type UpdateTechTaskBody = {
  techTaskId: number;
  name?: string;
  status?: StatusTechTask;
  periodType?: PeriodType;
  customPeriodDays?: number;
  markdownDescription?: string;
  endSpecifiedDate?: Date;
  techTaskItem?: number[];
  tagIds?: number[];
};

type TechTaskResponse = {
  props: {
    id: number;
    name: string;
    posId: number;
    type: TypeTechTask;
    status: StatusTechTask;
    periodType?: PeriodType;
    customPeriodDays?: number;
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
  };
};

type TechTaskItemResponse = {
  props: {
    id: number;
    title: string;
    code?: string;
    type: string;
    group: string;
  };
};

export type TechTasksItem = {
  id: number;
  title: string;
  type: string;
  group: string;
  code: string;
  value?: string | null;
  image?: string | null;
};

export type TechTasksTags = {
  id: number;
  name: string;
  code?: string;
};

export type TechTaskShapeResponse = {
  id: number;
  name: string;
  posId: number;
  type: TypeTechTask;
  status: StatusTechTask;
  periodType?: PeriodType;
  customPeriodDays?: number;
  markdownDescription?: string;
  endSpecifiedDate?: Date;
  startWorkDate?: Date;
  sendWorkDate?: Date;
  executorId?: number;
  items: TechTasksItem[];
  tags: TechTasksTags[];
};

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
};

export type ChemicalConsumptionResponse = {
  techTaskId: number;
  period: string;
  techRateInfos: {
    code: string;
    spent: string;
    time: string;
    recalculation: string;
    service: string;
  }[];
};

export type ConsumptionRateResponse = {
  id: number;
  programTypeName: string;
  literRate: number;
  concentration: number;
};

type ConsumptionRateCoeffPatch = {
  valueData: {
    programTechRateId: number;
    literRate: number;
    concentration: number;
  }[];
};

type ConsumptionRateCoeffPatchResponse = {
  props: {
    id: number;
    carWashPosId: number;
    carWashDeviceProgramsTypeId: number;
    literRate: number;
    concentration: number;
  };
};

type PosParams = {
  placementId?: number;
  organizationId?: number;
};

type ProgramParams = {
  posId?: number;
};

type CreateTags = {
  name: string;
  code?: string;
};

type CreateTagsResponse = {
  props: {
    id: number;
    name: string;
    code?: string;
  };
};

type TechTasksManageParams = {
  posId?: number;
  page?: number;
  size?: number;
};

type TechTasksManageResponse = {
  techTaskManageInfo: {
    id: number;
    name: string;
    posId: number;
    type: string; 
    status: string; 
    periodType?: string; 
    customPeriodDays?: number;
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
  }[];
  totalCount: number;
};

export type TechTaskManagerInfoRaw =
  TechTasksManageResponse['techTaskManageInfo'][number];

export type TechTaskManagerInfo = {
  id: number;
  name: string;
  posId: number;
  type: TypeTechTask;
  status: StatusTechTask;
  periodType?: PeriodType;
  customPeriodDays?: number;
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
};

export const transformTechTaskManagerInfo = (raw: TechTaskManagerInfoRaw): TechTaskManagerInfo => ({
  ...raw,
  type: raw.type as TypeTechTask,
  status: raw.status as StatusTechTask,
  periodType: raw.periodType as PeriodType | undefined,
});

type TechTasksExecutionParams = {
  posId?: number;
  status?: StatusTechTask;
  page?: number;
  size?: number;
  organizationId?: number;
  name?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  authorId?: number;
};

type TechTasksExecutionResponse = {
  techTaskReadAll: {
    id: number;
    name: string;
    posId: number;
    type: string; 
    status: string;
    periodType?: string;
    customPeriodDays?: number;
    endSpecifiedDate?: Date;
    startWorkDate?: Date;
    sendWorkDate?: Date;
    executorId?: number;
    posName?: string;
    tags: {
      id: number;
      name: string;
      code?: string;
    }[];
    createdBy: {
      firstName: string;
      lastName: string;
      id: number
    } | null;
    executor: {
      firstName: string;
      lastName: string;
      id: number
    } | null;
  }[];
  totalCount: number;
};

export type TechTaskReadAllRaw =
  TechTasksExecutionResponse['techTaskReadAll'][number];

export type TechTaskReadAll = {
  id: number;
  name: string;
  posId: number;
  type: TypeTechTask;
  status: StatusTechTask;
  periodType?: PeriodType;
  customPeriodDays?: number;
  endSpecifiedDate?: Date;
  startWorkDate?: Date;
  sendWorkDate?: Date;
  executorId?: number;
  posName?: string;
  tags: {
    id: number;
    name: string;
    code?: string;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
    id: number
  } | null;
  executor: {
    firstName: string;
    lastName: string;
    id: number
  } | null;
};

export const transformTechTaskReadAll = (raw: TechTaskReadAllRaw): TechTaskReadAll => ({
  ...raw,
  type: raw.type as TypeTechTask,
  status: raw.status as StatusTechTask,
  periodType: raw.periodType as PeriodType | undefined,
});

type TechTasksReportParams = {
  posId?: number;
  type?: TypeTechTask;
  status?: StatusTechTask;
  page?: number;
  size?: number;
  organizationId?: number;
  name?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  executorId?: number;
};

type WorkersParams = {
  page?: number;
  size?: number;
  roleId?: number;
  status?: StatusWorkers;
  name?: string;
};

export async function getIncident(params: IncidentParam): Promise<Incident[]> {
  const response: AxiosResponse<Incident[]> = await api.get(
    EQUIPMENT.GET_INCIDENT,
    { params }
  );

  return response.data;
}

export async function createIncident(
  body: IncidentBody
): Promise<PostIncidentResponse> {
  const response: AxiosResponse<PostIncidentResponse> = await api.post(
    EQUIPMENT.GET_INCIDENT,
    body
  );
  return response.data;
}

export async function updateIncident(
  body: UpdateIncidentBody
): Promise<PostIncidentResponse> {
  const response: AxiosResponse<PostIncidentResponse> = await api.patch(
    EQUIPMENT.GET_INCIDENT,
    body
  );
  return response.data;
}

export async function getPoses(params: PosParams): Promise<PosResponse[]> {
  const response: AxiosResponse<PosResponse[]> = await api.get(
    EQUIPMENT.GET_POS,
    { params }
  );

  return response.data;
}

export async function getWorkers(
  orgId: number,
  params?: WorkersParams
): Promise<WorkerResponse[]> {
  const response: AxiosResponse<WorkerResponse[]> = await api.get(
    `user/permission/worker/${orgId}`,
    { params }
  );

  return response.data;
}

export async function getWorkersCount(
  orgId: number
): Promise<{ count: number }> {
  const response: AxiosResponse<{ count: number }> = await api.get(
    `user/permission/worker-count/${orgId}`
  );

  return response.data;
}

export async function getDevices(
  posId: number | undefined
): Promise<DeviceResponse[]> {
  const response: AxiosResponse<DeviceResponse[]> = await api.get(
    EQUIPMENT.GET_POS_DEVICE + `/${posId}`
  );

  return response.data;
}

export async function getEquipmentKnots(
  posId: number | string
): Promise<EquipmentKnotResponse[]> {
  const response: AxiosResponse<EquipmentKnotResponse[]> = await api.get(
    EQUIPMENT.GET_EQUIPMENT + `/${posId}`
  );

  return response.data;
}

export async function getIncidentEquipmentKnots(
  id: number
): Promise<IncidentEquipmentKnotResponse[]> {
  const response: AxiosResponse<IncidentEquipmentKnotResponse[]> =
    await api.get(EQUIPMENT.GET_INCIDENT_EQUIPMENT + `/${id}`);

  return response.data;
}

export async function getPrograms(
  params: ProgramParams
): Promise<AllProgramsResponse[]> {
  const response: AxiosResponse<AllProgramsResponse[]> = await api.get(
    EQUIPMENT.GET_PROGRAMS,
    { params }
  );

  return response.data;
}

export async function createTechTask(
  body: TechTaskBody
): Promise<TechTaskResponse> {
  const response: AxiosResponse<TechTaskResponse> = await api.post(
    TECHTASKS.CREATE_TECH_TASK,
    body
  );
  return response.data;
}

export async function updateTechTask(
  body: UpdateTechTaskBody
): Promise<TechTaskResponse> {
  const response: AxiosResponse<TechTaskResponse> = await api.patch(
    TECHTASKS.CREATE_TECH_TASK,
    body
  );
  return response.data;
}

export async function getTechTaskItem(): Promise<TechTaskItemResponse[]> {
  const response: AxiosResponse<TechTaskItemResponse[]> = await api.get(
    TECHTASKS.READ_TECH_TASK_ITEM
  );

  return response.data;
}

export async function getTechTaskShapeItem(
  id: number
): Promise<TechTaskShapeResponse> {
  const response: AxiosResponse<TechTaskShapeResponse> = await api.get(
    TECHTASKS.CREATE_TECH_TASK + `/${id}`
  );

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

export async function getChemicalReport(
  params: ChemicalParams
): Promise<ChemicalConsumptionResponse[]> {
  const response: AxiosResponse<ChemicalConsumptionResponse[]> = await api.get(
    TECHTASKS.GET_CHEMICAL_CONSUMPTION,
    { params }
  );

  return response.data;
}

export async function getConsumptionRate(
  posId: number
): Promise<ConsumptionRateResponse[]> {
  const response: AxiosResponse<ConsumptionRateResponse[]> = await api.get(
    TECHTASKS.GET_CONSUMPTION_RATE + `/${posId}`
  );

  return response.data;
}

export async function patchProgramCoefficient(
  id: number,
  body: ConsumptionRateCoeffPatch
): Promise<ConsumptionRateCoeffPatchResponse[]> {
  const response: AxiosResponse<ConsumptionRateCoeffPatchResponse[]> =
    await api.patch(TECHTASKS.GET_CONSUMPTION_RATE + `/${id}`, body);
  return response.data;
}

export async function createTag(body: CreateTags): Promise<CreateTagsResponse> {
  const response: AxiosResponse<CreateTagsResponse> = await api.post(
    TECHTASKS.CREATE_TECH_TASK + '/tag',
    body
  );
  return response.data;
}

export async function getTags(): Promise<CreateTagsResponse[]> {
  const response: AxiosResponse<CreateTagsResponse[]> = await api.get(
    TECHTASKS.CREATE_TECH_TASK + '/tag'
  );

  return response.data;
}

export async function getTechTaskManage(
  params: TechTasksManageParams
): Promise<{ techTaskManageInfo: TechTaskManagerInfo[]; totalCount: number }> {
  const response: AxiosResponse<TechTasksManageResponse> = await api.get(
    TECHTASKS.CREATE_TECH_TASK + '/manage',
    { params }
  );

  return {
    techTaskManageInfo: response.data.techTaskManageInfo.map(transformTechTaskManagerInfo),
    totalCount: response.data.totalCount
  };
}

export async function getTechTaskExecution(
  params: TechTasksExecutionParams
): Promise<{ techTaskReadAll: TechTaskReadAll[]; totalCount: number }> {
  const response: AxiosResponse<TechTasksExecutionResponse> = await api.get(
    TECHTASKS.CREATE_TECH_TASK + '/me',
    { params }
  );

  return {
    techTaskReadAll: response.data.techTaskReadAll.map(transformTechTaskReadAll),
    totalCount: response.data.totalCount
  };
}

export async function getTechTaskReport(
  params: TechTasksReportParams
): Promise<TechTasksExecutionResponse> {
  const response: AxiosResponse<TechTasksExecutionResponse> = await api.get(
    TECHTASKS.CREATE_TECH_TASK + '/report',
    { params }
  );

  return response.data;
}

export async function blockWorker(userId: number): Promise<WorkerBlockResponse> {
  const response: AxiosResponse<WorkerBlockResponse> = await api.patch(
    `user/permission/worker/${userId}/block`
  );
  return response.data;
}

export async function deleteTechTask(id: number): Promise<void> {
  const response: AxiosResponse<void> = await api.delete(
    `user/tech-task/${id}`
  );
  return response.data;
}

export type BulkDeleteTechTasksBody = {
  ids: number[];
  posId?: number;
  organizationId: number;
};

export async function bulkDeleteTechTasks(body: BulkDeleteTechTasksBody): Promise<void> {
  const response: AxiosResponse<void> = await api.delete(
    'user/tech-task/bulk/delete',
    {data: body}
  );
  return response.data;
}
