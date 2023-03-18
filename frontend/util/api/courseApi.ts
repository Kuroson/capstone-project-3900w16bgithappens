import { CourseInterface } from "models";
import { BackendLinkType, apiGet } from "./api";
import { getBackendLink } from "./userApi";

type UserCourseDetailsPayloadRequest = {
  courseId: string;
};

type UserCourseDetailsPayloadResponse = Omit<CourseInterface, "students" | "pages" | "creator"> & {
  pages: Omit<PageInterface, "section" | "resources"> &
    {
      section: Omit<SectionInterface, "resources"> &
        {
          resources: ResourceInterface[];
        }[];
      resources: ResourceInterface[];
    }[];
};

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
