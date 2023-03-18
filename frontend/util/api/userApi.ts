import { CLIENT_BACKEND_URL, apiPost } from "./api";

type RegisterUserPayloadRequest = {
  firstName: string;
  lastName: string;
  email: string;
};

type RegisterUserPayloadResponse = {
  message: string;
};

/**
 * Register new user with payload
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
