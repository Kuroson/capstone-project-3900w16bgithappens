import { UserDetails } from "models/user.model";
import { CLIENT_BACKEND_URL, SSR_BACKEND_URL, apiGet, apiPost } from "./api";

type RegisterUserPayloadRequest = {
  firstName: string;
  lastName: string;
  email: string;
};

type RegisterUserPayloadResponse = {
  message: string;
};

type UserDetailsRequestPayload = {
  email: string;
};

type UserDetailsResponsePayload = {
  userDetails: UserDetails;
};

type BackendLinkType = "client" | "ssr";

export const getBackendLink = (type: BackendLinkType) => {
  return type === "client" ? CLIENT_BACKEND_URL : SSR_BACKEND_URL;
};

/**
 * Register new user with payload
 * @precondition Must only be called on the client side
 * @param token JWT token from firebase
 * @param payload payload to register new user
 * @returns
 */
export const registerNewUser = (token: string, payload: RegisterUserPayloadRequest) => {
  return apiPost<RegisterUserPayloadRequest, RegisterUserPayloadResponse>(
    `${CLIENT_BACKEND_URL}/user/register`,
    token,
    payload,
  );
};

export const getUserDetails = (token: string | null, email: string, type: BackendLinkType) => {
  return apiGet<UserDetailsRequestPayload, UserDetailsResponsePayload>(
    `${getBackendLink(type)}/user/details`,
    token,
    { email: email },
  );
};

// type UserCoursesRequestPayload = {};

// type UserCourseResponsePayload = {};

// /**
//  * Get all of the courses associated with a user via the JWT token identifier
//  * @param token
//  * @param type
//  * @returns
//  */
// export const getUserCourses = (token: string | null, type: BackendLinkType) => {
//   return apiGet<UserCoursesRequestPayload, UserCourseResponsePayload>(
//     `${getBackendLink(type)}/user/courses`,
//     null,
//     {},
//   );
// };
