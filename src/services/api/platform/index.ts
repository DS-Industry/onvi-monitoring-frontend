import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum LOGIN {
    CREATE_LOGIN = 'user/auth/login',
    CREATE_REGISTER = 'user/auth/register',
    REGISTER_ACTIVATION = 'user/auth/activation',
    PASSWORD_CONFIRM = 'user/auth/password/confirm',
    PASSWORD_VALID = 'user/auth/password/valid/confirm',
    PASSWORD_RESET = 'user/auth/password/reset'
}

enum USER {
    USER_AVATAR = 'user/avatar',
    USER_UPDATE = 'user',
    USER_UPDATE_PASSWORD = 'user/password'
}

type LOGINBODY = {
    email: string;
    password: string;
}

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
        }
    },
    tokens: {
        accessToken: string;
        accessTokenExp: Date;
        refreshToken: string;
        refreshTokenExp: Date;
    },
    permissionInfo: {
        permissions: Array<{ subject: string; action: string; }>;
        role: string;
    }
}

type REGISTERBODY = {
    name: string;
    surname?: string;
    middlename?: string;
    birthday: Date;
    phone: string;
    email: string;
    password: string;
    gender?: string;
    avatar?: string;
    country?: string;
    countryCode?: number;
    timezone?: number;
}

type REGISTERRESPONSE = {
    statusMail: {
        message: string,
        to: string,
    }
}

type REGISTERACTIVATION = {
    email: string;
    confirmString: string;
}

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
        }
    },
    tokens: {
        accessToken: string;
        accessTokenExp: Date;
        refreshToken: string;
        refreshTokenExp: Date;
    },
    permissionInfo: {
        permissions: Array<{ subject: string; action: string; }>;
        role: string;
    }
}

type FORGOTPASSWORDBODY = {
    email: string;
}

type RESETBODY = {
    email: string;
    confirmString: string;
    newPassword: string;
}

type RESETRESPONSE = {
    status: "password change",
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
        }
    }
}

type UPDATEUSERBODY = {
    name?: string;
    surname?: string;
    middlename?: string;
    phone?: string;
    email?: string;
    receiveNotifications?: number;
}

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
        createdAt: Date;
        updatedAt: Date;
    }
}

type USERPASSWORDBODY = {
    oldPassword: string;
    newPassword: string;
}

export async function loginPlatformUser(body: LOGINBODY): Promise<LOGINRESPONSE> {
    console.log(body);
    const response: AxiosResponse<LOGINRESPONSE> = await api.post(LOGIN.CREATE_LOGIN, body);
    console.log(response.data);
    return response.data;
}

export async function registerPlatformUser(body: REGISTERBODY): Promise<REGISTERRESPONSE> {
    console.log(body);
    const response: AxiosResponse<REGISTERRESPONSE> = await api.post(LOGIN.CREATE_REGISTER, body);
    console.log(response.data);
    return response.data;
}

export async function registerActivationUser(body: REGISTERACTIVATION): Promise<REGISTERACTIVATIONRESPONSE> {
    console.log(body);
    const response: AxiosResponse<REGISTERACTIVATIONRESPONSE> = await api.post(LOGIN.REGISTER_ACTIVATION, body);
    console.log(response.data);
    return response.data;
}

export async function forgotPasswordUser(body: FORGOTPASSWORDBODY): Promise<REGISTERRESPONSE> {
    console.log(body);
    const response: AxiosResponse<REGISTERRESPONSE> = await api.post(LOGIN.PASSWORD_CONFIRM, body);
    console.log(response.data);
    return response.data;
}

export async function passwordValidUser(body: REGISTERACTIVATION): Promise<unknown> {
    console.log(body);
    const response: AxiosResponse<unknown> = await api.post(LOGIN.PASSWORD_VALID, body);
    console.log(response.data);
    return response.data;
}

export async function passwordResetUser(body: RESETBODY): Promise<RESETRESPONSE> {
    console.log(body);
    const response: AxiosResponse<RESETRESPONSE> = await api.post(LOGIN.PASSWORD_RESET, body);
    console.log(response.data);
    return response.data;
}


// export async function uploadUserAvatar(body: any): Promise<any> {
//     console.log(body);
//     const response: AxiosResponse<any> = await api.post(USER.USER_AVATAR, body);
//     console.log(response.data);
//     return response.data;
// }

export async function updateUserProfile(body: UPDATEUSERBODY, file?: File | null): Promise<UPDATEUSERRESPONSE> {
    console.log(body);
    const formData = new FormData();

    for (const key in body) {
        const value = body[key as keyof UPDATEUSERBODY];
        if (value !== undefined) {
            // Convert value to a string if it's a number
            formData.append(key, value.toString());
        }
    }

    if (file) {
        formData.append("file", file);
    }

    const response: AxiosResponse<UPDATEUSERRESPONSE> = await api.patch(USER.USER_UPDATE, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    console.log(response.data);
    return response.data;
}

export async function updateUserPassword(body: USERPASSWORDBODY): Promise<UPDATEUSERRESPONSE> {
    console.log(body);
    const response: AxiosResponse<UPDATEUSERRESPONSE> = await api.patch(USER.USER_UPDATE_PASSWORD, body);
    console.log(response.data);
    return response.data;
}
