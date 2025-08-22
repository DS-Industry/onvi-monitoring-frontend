import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum ORGANIZATION {
  GET_ORGANIZATIONS = 'user/organization/filter',
  GET_RATING = 'user/organization/rating',
  GET_STATISTIC = 'user/organization/statistics',
  UPDATE_ORGANIZATION = 'user/organization',
  GET_ORGANIZATION_DOC = 'user/organization/document',
  GET_ROLES = 'user/permission/roles',
  POS_PERMISSION = 'user/permission/pos',
  UPDATE_ROLE = 'user/permission',
  ADD_ROLE = 'user/organization/worker',
  GET_CONTACT = 'user/contact',
}

export type Organization = {
  id: number;
  name: string;
  slug: string;
  address: string;
  organizationDocumentId: number | null;
  organizationStatus: string;
  organizationType: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: number;
};

export type OrganizationBody = {
  fullName: string;
  organizationType: string;
  rateVat: string;
  inn: string;
  okpo: string;
  kpp?: string;
  addressRegistration: string;
  ogrn: string;
  bik: string;
  correspondentAccount: string;
  bank: string;
  settlementAccount: string;
  addressBank: string;
  certificateNumber?: string;
  dateCertificate?: Date;
};

type OrganizationPostResponse = {
  props: {
    id: number;
    name: string;
    slug: string;
    address: string;
    organizationDocumentId: number;
    organizationStatus: string;
    organizationType: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: number;
  };
};

type OrganizationUpdateBody = {
  organizationId: number;
  fullName?: string;
  rateVat?: string;
  inn?: string;
  okpo?: string;
  kpp?: string;
  addressRegistration?: string;
  ogrn?: string;
  bik?: string;
  correspondentAccount?: string;
  bank?: string;
  settlementAccount?: string;
  addressBank?: string;
  certificateNumber?: string;
  dateCertificate?: Date;
};

type Statistic = {
  sum: number;
  cars: number;
};

type RatingParams = {
  dateStart: Date;
  dateEnd: Date;
};

type Rating = {
  posName: string;
  sum: number;
};

type OrganizationDocResponse = {
  props: {
    id: number;
    rateVat: string;
    inn: string;
    okpo: string;
    kpp?: string;
    ogrn: string;
    bik: string;
    correspondentAccount: string;
    bank: string;
    settlementAccount: string;
    addressBank: string;
    documentDoc?: string;
    certificateNumber?: string;
    dateCertificate?: string;
  };
};

export type OrganizationOtherDetailsResponse = OrganizationDocResponse['props'];

type RolesResponse = {
  id: number;
  name: string;
  description?: string;
};

type PosPermissionsResponse = {
  id: number;
  name: string;
};

type ConnectionPosBody = {
  posIds: number[];
};

type ConnectionPosResponse = {
  status: string;
};

type UpdateRoleRequest = {
  userId: number;
  roleId: number;
};

type UpdateRoleResponse = {
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

type AddressParams = {
  placementId?: number;
  noLoyaltyProgram?: boolean;
};

export type RoleRequestBody = {
  name: string;
  surname?: string;
  middlename?: string;
  birthday: Date;
  phone: string;
  email: string;
  organizationId: number;
  roleId: number;
  position: string;
};

type RoleResponse = {
  statusMail: {
    message: string;
    to: string;
  };
};

type OrgContactResponse = {
  name: string;
  address: string;
  status: string;
  type: string;
};

type ContactResponse = {
  name: string;
  surname: string;
  middlename: string;
  email: string;
  position: string;
};

type StatGraphRequest = {
  dateStart: Date;
  dateEnd: Date;
};

type StatGraphResponse = {
  date: Date;
  sum: number;
};

export async function getOrganization(
  params: AddressParams
): Promise<Organization[]> {
  const url = ORGANIZATION.GET_ORGANIZATIONS;
  const response: AxiosResponse<Organization[]> = await api.get(url, {
    params,
  });
  return response.data;
}

export async function createUserOrganization(
  body: OrganizationBody
): Promise<OrganizationPostResponse> {
  const response: AxiosResponse<OrganizationPostResponse> = await api.post(
    ORGANIZATION.UPDATE_ORGANIZATION,
    body
  );
  return response.data;
}

export async function getRating(params: RatingParams): Promise<Rating[]> {
  const url = ORGANIZATION.GET_RATING;
  const response: AxiosResponse<Rating[]> = await api.get(url, { params });
  return response.data;
}

export async function getStatistic(): Promise<Statistic> {
  const url = ORGANIZATION.GET_STATISTIC;
  const response: AxiosResponse<Statistic> = await api.get(url);
  return response.data;
}

export async function postUpdateOrganization(
  body: OrganizationUpdateBody
): Promise<OrganizationPostResponse> {
  const response: AxiosResponse<OrganizationPostResponse> = await api.patch(
    ORGANIZATION.UPDATE_ORGANIZATION,
    body
  );

  return response.data;
}

export async function getOrganizationDocument(
  orgId: number
): Promise<OrganizationDocResponse> {
  const response: AxiosResponse<OrganizationDocResponse> = await api.get(
    ORGANIZATION.GET_ORGANIZATION_DOC + `/${orgId}`
  );

  return response.data;
}

export async function getRoles(): Promise<RolesResponse[]> {
  const response: AxiosResponse<RolesResponse[]> = await api.get(
    ORGANIZATION.GET_ROLES
  );
  return response.data;
}

export async function getPosPermissionUser(
  userId: number
): Promise<PosPermissionsResponse[]> {
  const response: AxiosResponse<PosPermissionsResponse[]> = await api.get(
    ORGANIZATION.POS_PERMISSION + `/${userId}`
  );
  return response.data;
}

export async function getPosPermission(): Promise<PosPermissionsResponse[]> {
  const response: AxiosResponse<PosPermissionsResponse[]> = await api.get(
    ORGANIZATION.POS_PERMISSION
  );
  return response.data;
}

export async function connectPosPermission(
  body: ConnectionPosBody,
  userId: number
): Promise<ConnectionPosResponse> {
  const response: AxiosResponse<ConnectionPosResponse> = await api.patch(
    ORGANIZATION.POS_PERMISSION + `-user/${userId}`,
    body
  );
  return response.data;
}

export async function updateRole(
  body: UpdateRoleRequest
): Promise<UpdateRoleResponse> {
  const response: AxiosResponse<UpdateRoleResponse> = await api.patch(
    ORGANIZATION.UPDATE_ROLE,
    body
  );
  return response.data;
}

export async function addRole(body: RoleRequestBody): Promise<RoleResponse> {
  const response: AxiosResponse<RoleResponse> = await api.post(
    ORGANIZATION.ADD_ROLE,
    body
  );

  return response.data;
}

export async function getOrganizationContactById(
  id: number
): Promise<OrgContactResponse> {
  const url = ORGANIZATION.UPDATE_ORGANIZATION + `/contact/${id}`;
  const response: AxiosResponse<OrgContactResponse> = await api.get(url);
  return response.data;
}

export async function getContactById(id: number): Promise<ContactResponse> {
  const url = ORGANIZATION.GET_CONTACT + `/${id}`;
  const response: AxiosResponse<ContactResponse> = await api.get(url);
  return response.data;
}

export async function getStatisticsGraph(
  params: StatGraphRequest
): Promise<StatGraphResponse[]> {
  const url = ORGANIZATION.GET_STATISTIC + '-graf';
  const response: AxiosResponse<StatGraphResponse[]> = await api.get(url, {
    params,
  });
  return response.data;
}
