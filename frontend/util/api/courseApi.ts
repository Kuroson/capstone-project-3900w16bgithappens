import { CourseInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { BackendLinkType, apiGet } from "./api";
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
