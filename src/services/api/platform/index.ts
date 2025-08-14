import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum LOGIN {
  CREATE_LOGIN = 'user/auth/login',
  CREATE_REGISTER = 'user/auth/register',
  REGISTER_ACTIVATION = 'user/auth/activation',
  PASSWORD_CONFIRM = 'user/auth/password/confirm',
  PASSWORD_VALID = 'user/auth/password/valid/confirm',
  PASSWORD_RESET = 'user/auth/password/reset',
  WORKER = 'user/auth/worker',
  ORGANIZATION = 'user/organization/pre-create',
  LOGOUT = 'user/auth/logout',
}

enum USER {
  USER_AVATAR = 'user/avatar',
  USER_UPDATE = 'user',
  USER_UPDATE_PASSWORD = 'user/password',
}

type LOGINBODY = {
  email: string;
  password: string;
};

type LOGINRESPONSE = {
  admin: {
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
  tokens: {
    accessToken: string;
    accessTokenExp: Date;
    refreshToken: string;
    refreshTokenExp: Date;
  };
  permissionInfo: {
    permissions: Array<{ subject: string; action: string }>;
    role: string;
  };
};

type REGISTERBODY = {
  name: string;
  surname: string;
  middlename?: string;
  birthday: Date;
  phone: string;
  email: string;
  password: string;
};

type REGISTERRESPONSE = {
  statusMail: {
    message: string;
    to: string;
  };
};

type REGISTERACTIVATION = {
  email: string;
  confirmString: string;
};

type REGISTERACTIVATIONRESPONSE = {
  admin: {
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
  tokens: {
    accessToken: string;
    accessTokenExp: Date;
    refreshToken: string;
    refreshTokenExp: Date;
  };
  permissionInfo: {
    permissions: Array<{ subject: string; action: string }>;
    role: string;
  };
};

type FORGOTPASSWORDBODY = {
  email: string;
};

type RESETBODY = {
  email: string;
  confirmString: string;
  newPassword: string;
};

type RESETRESPONSE = {
  status: 'password change';
  correctUser: {
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
};

type UPDATEUSERBODY = {
  name?: string;
  surname?: string;
  middlename?: string;
  phone?: string;
  email?: string;
  receiveNotifications?: number;
  fcmToken?: string;
};

type UPDATEUSERRESPONSE = {
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
    fcmToken?: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

type USERPASSWORDBODY = {
  oldPassword: string;
  newPassword: string;
};

type ValidResponse = {
  status: 'SUCCESS';
};

type WorkerRequest = {
  password: string;
};

type WorkerResponse = {
  user: {
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
  tokens: {
    accessToken: string;
    accessTokenExp: Date;
    refreshToken: string;
    refreshTokenExp: Date;
  };
};

type OrganizationCreateRquest = {
  fullName: string;
  organizationType: string;
  addressRegistration: string;
};

type OrganizationCreateResponse = {
  id: number;
  name: string;
  slug: string;
  address: string;
  organizationStatus: string;
  organizationType: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: number;
};


export async function loginPlatformUser(
  body: LOGINBODY
): Promise<LOGINRESPONSE> {
  const response: AxiosResponse<LOGINRESPONSE> = await api.post(
    LOGIN.CREATE_LOGIN,
    body
  );
  return response.data;
}

export async function registerPlatformUser(
  body: REGISTERBODY
): Promise<REGISTERRESPONSE> {
  const response: AxiosResponse<REGISTERRESPONSE> = await api.post(
    LOGIN.CREATE_REGISTER,
    body
  );
  return response.data;
}

export async function registerActivationUser(
  body: REGISTERACTIVATION
): Promise<REGISTERACTIVATIONRESPONSE> {
  const response: AxiosResponse<REGISTERACTIVATIONRESPONSE> = await api.post(
    LOGIN.REGISTER_ACTIVATION,
    body
  );
  return response.data;
}

export async function forgotPasswordUser(
  body: FORGOTPASSWORDBODY
): Promise<REGISTERRESPONSE> {
  const response: AxiosResponse<REGISTERRESPONSE> = await api.post(
    LOGIN.PASSWORD_CONFIRM,
    body
  );
  return response.data;
}

export async function passwordValidUser(
  body: REGISTERACTIVATION
): Promise<unknown> {
  const response: AxiosResponse<unknown> = await api.post(
    LOGIN.PASSWORD_VALID,
    body
  );
  return response.data;
}

export async function passwordResetUser(
  body: RESETBODY
): Promise<RESETRESPONSE> {
  const response: AxiosResponse<RESETRESPONSE> = await api.post(
    LOGIN.PASSWORD_RESET,
    body
  );
  return response.data;
}

// export async function uploadUserAvatar(body: any): Promise<any> {
// //     const response: AxiosResponse<any> = await api.post(USER.USER_AVATAR, body);
// //     return response.data;
// }

export async function updateUserProfile(
  body: UPDATEUSERBODY,
  file?: File | null
): Promise<UPDATEUSERRESPONSE> {
  const formData = new FormData();

  for (const key in body) {
    const value = body[key as keyof UPDATEUSERBODY];
    if (value !== undefined) {
      // Convert value to a string if it's a number
      formData.append(key, value.toString());
    }
  }

  if (file) {
    formData.append('file', file);
  }

  const response: AxiosResponse<UPDATEUSERRESPONSE> = await api.patch(
    USER.USER_UPDATE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function updateUserPassword(
  body: USERPASSWORDBODY
): Promise<UPDATEUSERRESPONSE> {
  const response: AxiosResponse<UPDATEUSERRESPONSE> = await api.patch(
    USER.USER_UPDATE_PASSWORD,
    body
  );
  return response.data;
}

export async function createUserRole(
  body: WorkerRequest,
  confirm: string
): Promise<WorkerResponse> {
  const response: AxiosResponse<WorkerResponse> = await api.post(
    LOGIN.WORKER + `/${confirm}`,
    body
  );
  return response.data;
}

export async function getWorkerStatus(confirm: string): Promise<ValidResponse> {
  const response: AxiosResponse<ValidResponse> = await api.get(
    LOGIN.WORKER + `/valid/${confirm}`
  );
  return response.data;
}

export async function precreateOrganization(
  body: OrganizationCreateRquest
): Promise<OrganizationCreateResponse> {
  const response: AxiosResponse<OrganizationCreateResponse> = await api.post(
    LOGIN.ORGANIZATION,
    body
  );
  return response.data;
}


export async function logoutPlatformUser(): Promise<void> {
  await api.post(LOGIN.LOGOUT);
}
