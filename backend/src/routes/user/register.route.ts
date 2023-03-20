import { HttpException } from "@/exceptions/HttpException";
import User, { INSTRUCTOR_ROLE, STUDENT_ROLE } from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    message: string;
};

type QueryPayload = {
    firstName: string;
    lastName: string;
    email: string;
};

/**
 * Register a new user with the given details
 * @param firstName
 * @param lastName
 * @param email
 * @param firebaseUID
 * @throws { HttpException } if it fails to write new user to database
 * @returns
 */
export const registerUser = async (
    firstName: string,
    lastName: string,
    email: string,
    firebaseUID: string,
): Promise<void> => {
    logger.info(`Registering user, email: ${email}, firebaseUID: ${firebaseUID}`);

    const role = email.toLowerCase().includes("admin") ? INSTRUCTOR_ROLE : STUDENT_ROLE;

    const newUser = new User({
        firebase_uid: firebaseUID,
        first_name: firstName,
        last_name: lastName,
        email: email,
        enrolments: [],
        role: role,
        avatar: "", // TODO
    });

    await newUser
        .save()
        .then((res) => {
            logger.verbose(res);
            return res;
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Could not create new user", err);
        });
    return;
};

/**
 * POST /user/register
 * Register a new user
 * @param req
 * @param res
 * @returns
 */
export const registerController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        if (req.method !== "POST") throw new HttpException(405, "Method not allowed");
        logger.info(JSON.stringify(req.body));
        const authUser = await checkAuth(req);
        logger.info("done");
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["firstName", "lastName", "email"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const queryBody = req.body; // Body has been verified
            const { firstName, lastName, email } = queryBody;

            if (email !== authUser.email) {
                logger.warning(`Emails do not match for ${authUser.uid}`);
                throw new HttpException(401, "Email does not match email from JWT token");
            }

            await registerUser(firstName, lastName, email, authUser.uid);

            return res.status(200).json({ message: "Success" });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, KEYS_TO_CHECK)}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(JSON.stringify(error));
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};
