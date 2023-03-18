import { CourseInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { BackendLinkType, apiGet, apiPost } from "./api";
import { getBackendLink } from "./userApi";

type UserCourseDetailsPayloadRequest = {
  courseId: string;
};

type UserCourseDetailsPayloadResponse = UserCourseInformation;

export const getUserCourseDetails = (
  token: string | null,
  courseId: string,
  type: BackendLinkType,
) => {
  return apiGet<UserCourseDetailsPayloadRequest, UserCourseDetailsPayloadResponse>(
    `${getBackendLink(type)}/course`,
    token,
    { courseId: courseId },
  );
};

type CreateNewCoursePayloadRequest = {
  code: string;
  title: string;
  session: string;
  description: string;
  icon: string;
};

type CreateNewCoursePayloadResponse = {
  courseId: string;
};

export const createNewCourse = (
  token: string | null,
  payload: CreateNewCoursePayloadRequest,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewCoursePayloadRequest, CreateNewCoursePayloadResponse>(
    `${getBackendLink(type)}/course/create`,
    token,
    payload,
  );
};
