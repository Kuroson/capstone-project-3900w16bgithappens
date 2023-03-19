/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException } from "util/HttpExceptions";
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

interface UploadFilePayloadRequest extends Record<string, string> {
  resourceId: string;
}

type UploadFilePayloadResponse = {
  success: boolean;
  file_type: string;
  download_link: string; // i.e., download link
};

export const uploadResourceFile = async (
  token: string | null,
  file: File,
  queryParams: UploadFilePayloadRequest,
  type: BackendLinkType,
): Promise<[UploadFilePayloadResponse | null, null | Error | any]> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    for (const key of Object.keys(queryParams)) {
      formData.append(key, queryParams[key]);
    }

    const res = await fetch(`${getBackendLink(type)}/file/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token ?? "bad"}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const status = res.status;
      const data = await res.json();
      return [null, new HttpException(status, data.message)];
    }
    const data = await res.json();
    return [data, null];
  } catch (err) {
    console.error("Error with posting to example");
    return [null, err];
  }
};
