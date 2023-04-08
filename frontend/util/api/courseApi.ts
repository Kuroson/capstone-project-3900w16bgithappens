import { CourseInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { KudosValuesInterface, KudosValuesType } from "models/kudosValue.model";
import { BackendLinkType, apiGet, apiPost, apiPut } from "./api";
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
  kudosValues?: KudosValuesType;
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

export type UpdateCoursePayloadRequest = {
  courseId: string;
  code?: string;
  title?: string;
  session?: string;
  description?: string;
  icon?: string;
  tags?: Array<string>;
  kudosValues?: KudosValuesType;
};

type UpdateCoursePayloadResponse = {
  courseId: string;
};

export const updateCourse = (
  token: string | null,
  payload: UpdateCoursePayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<UpdateCoursePayloadRequest, UpdateCoursePayloadResponse>(
    `${getBackendLink(type)}/course/update`,
    token,
    payload,
  );
};

type AddStudentPayloadRequest = {
  courseId: string;
  studentEmails: Array<string>;
};

type AddStudentPayloadResponse = {
  invalidEmails: Array<string>;
};

export const addStudentToCourse = (
  token: string | null,
  courseId: string,
  email: string,
  type: BackendLinkType,
) => {
  return apiPut<AddStudentPayloadRequest, AddStudentPayloadResponse>(
    `${getBackendLink(type)}/course/students/add`,
    token,
    { studentEmails: [email], courseId: courseId },
  );
};

type RemoveStudentPayloadRequest = AddStudentPayloadRequest;
type RemoveStudentPayloadResponse = AddStudentPayloadResponse;

export const removeStudentFromCourse = (
  token: string | null,
  courseId: string,
  email: string,
  type: BackendLinkType,
) => {
  return apiPut<RemoveStudentPayloadRequest, RemoveStudentPayloadResponse>(
    `${getBackendLink(type)}/course/students/remove`,
    token,
    { studentEmails: [email], courseId: courseId },
  );
};
