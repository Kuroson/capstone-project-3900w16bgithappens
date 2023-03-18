import { BackendLinkType, apiPost } from "./api";
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
