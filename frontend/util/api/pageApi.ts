import { BackendLinkType, apiDelete, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

type CreateNewPagePayloadRequest = {
  courseId: string;
  title: string;
};

type CreateNewPagePayloadResponse = {
  pageId: string;
};

export const createNewPage = (
  token: string | null,
  courseId: string,
  title: string,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewPagePayloadRequest, CreateNewPagePayloadResponse>(
    `${getBackendLink(type)}/page/create`,
    token,
    { courseId: courseId, title: title },
  );
};

type DeletePagePayloadRequest = {
  courseId: string;
  pageId: string;
};

type DeletePagePayloadResponse = {
  message: string;
};

export const deletePage = (
  token: string | null,
  courseId: string,
  pageId: string,
  type: BackendLinkType,
) => {
  return apiDelete<DeletePagePayloadRequest, DeletePagePayloadResponse>(
    `${getBackendLink(type)}/page`,
    token,
    { courseId: courseId, pageId: pageId },
  );
};

export type UpdatePagePayloadRequest = {
  courseId: string;
  pageId: string;
  title: string;
  sectionId: string | null;
  resourceId: string | null; // This value will exist if we are updating a resource
  description: string;
};

type UpdatePagePayloadResponse = {
  courseId: string;
};

export const updatePageResource = (
  token: string | null,
  payload: UpdatePagePayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<UpdatePagePayloadRequest, UpdatePagePayloadResponse>(
    `${getBackendLink(type)}/page/add/resource`,
    token,
    payload,
  );
};
