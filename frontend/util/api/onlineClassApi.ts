import { BackendLinkType, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

type CreateOnlineClassPayloadResponse = {
  classId: string;
};

export type CreateOnlineClassPayloadRequest = {
  courseId: string;
  title: string;
  description: string;
  startTime: number;
  linkToClass: string;
};

/**
 * Creates an online class
 * @param token
 * @param data
 * @param type
 * @returns
 */
export const createOnlineClass = (
  token: string | null,
  data: CreateOnlineClassPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPost<CreateOnlineClassPayloadRequest, CreateOnlineClassPayloadResponse>(
    `${getBackendLink(type)}/class/schedule`,
    token,
    data,
  );
};

export type StartOnlineClassPayloadResponse = {
  message: string;
};

export type StartOnlineClassPayloadRequest = {
  classId: string;
};

/**
 * Sends a request to start the online class
 * @param token
 * @param classId id of class to start
 * @param type
 * @returns
 */
export const startOnlineClass = (token: string | null, classId: string, type: BackendLinkType) => {
  return apiPut<StartOnlineClassPayloadRequest, StartOnlineClassPayloadResponse>(
    `${getBackendLink(type)}/class/start`,
    token,
    { classId },
  );
};

export type EndOnlineClassPayloadResponse = StartOnlineClassPayloadResponse;
export type EndOnlineClassPayloadRequest = StartOnlineClassPayloadRequest;

export const endOnlineClass = (token: string | null, classId: string, type: BackendLinkType) => {
  return apiPut<EndOnlineClassPayloadRequest, EndOnlineClassPayloadResponse>(
    `${getBackendLink(type)}/class/end`,
    token,
    { classId },
  );
};
