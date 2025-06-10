import { AxiosResponse } from "axios";
import api from "@/config/axiosConfig";

enum NOTIFICATION {
    GET_NOTIFS = 'user/notification'
}

enum UserNotificationType {
    DEFAULT = "DEFAULT",
    FAVORITE = "FAVORITE",
    DELETED = "DELETED",
}

enum ReadStatus {
    READ = "READ",
    NOT_READ = "NOT_READ",
}

type TagRequest = {
    name: string;
    color: string;
}

type TagResponse = {
    props: {
        id: number;
        name: string;
        color: string;
        authorUserId: number;
    }
}

type UpdateTagRequest = {
    tagId: number;
    name?: string;
    color?: string;
}

type GetUserNotifParams = {
    type?: UserNotificationType;
    tagId?: number;
    readStatus?: ReadStatus;
    page?: number;
    size?: number;
}

type UserNotificationResponse = {
    id: number;
    notificationId: number;
    heading: string;
    body: string;
    authorId?: number;
    sendAt: Date;
    openingAt?: Date;
    type?: UserNotificationType;
    tags: {
        id: number;
        name: string;
        color: string;
    }[];
}

type UpdateNotifRequest = {
    userNotificationId: number;
    readStatus?: ReadStatus;
    type?: UserNotificationType;
    tagIds?: number[];
}

type ReadNotifsResponse = {
    status: string;
}

export async function createTag(body: TagRequest): Promise<TagResponse> {
    const response: AxiosResponse<TagResponse> = await api.post(NOTIFICATION.GET_NOTIFS + '/tag', body);
    return response.data;
}

export async function updateTag(body: UpdateTagRequest): Promise<TagResponse> {
    const response: AxiosResponse<TagResponse> = await api.patch(NOTIFICATION.GET_NOTIFS + '/tag', body);
    return response.data;
}

export async function deleteTag(id: number): Promise<ReadNotifsResponse> {
    const response: AxiosResponse<ReadNotifsResponse> = await api.delete(NOTIFICATION.GET_NOTIFS + '/tag' + `/${id}`);
    return response.data;
}

export async function getTags(): Promise<TagResponse[]> {
    const response: AxiosResponse<TagResponse[]> = await api.get(NOTIFICATION.GET_NOTIFS + '/tag');
    return response.data;
}

export async function getNotifications(params: GetUserNotifParams): Promise<UserNotificationResponse[]> {
    const response: AxiosResponse<UserNotificationResponse[]> = await api.get(NOTIFICATION.GET_NOTIFS + '/user-notification', { params });
    return response.data;
}

export async function updateNotifications(body: UpdateNotifRequest): Promise<UserNotificationResponse> {
    const response: AxiosResponse<UserNotificationResponse> = await api.patch(NOTIFICATION.GET_NOTIFS + '/user-notification', body);
    return response.data;
}

export async function readNotifications(): Promise<ReadNotifsResponse> {
    const response: AxiosResponse<ReadNotifsResponse> = await api.patch(NOTIFICATION.GET_NOTIFS + '/read-all');
    return response.data;
}