import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { verifyIdToken, verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { Nullable } from "@/utils/util";
import { Request, Response } from "express";

type ErrorPayload = {
    message: string;
};

type ResponsePayload = {
    firstName: string;
    lastName: string;
    email: string;
    role: number;
    avatar: string;
};

export const getUserDetails = async (email?: string): Promise<Nullable<ResponsePayload>> => {
    if (email === undefined) throw new HttpException(401, "Bad token. No email");

    logger.info(`Getting user details for ${email}`);
    const res = await User.find({ email: email }).exec();
    if (res.length === 0)
        throw new HttpException(400, `Email associated with token doesn't exist: ${email}`);
    const user = res.at(0);
    return {
        firstName: user?.first_name ?? null,
        lastName: user?.last_name ?? null,
        email: user?.email ?? null,
        role: user?.role ?? null,
        avatar: null, // TODO return avatar once implemented
    };
};

export const userDetailsController = async (
    req: Request,
    res: Response<Nullable<ResponsePayload> | ErrorPayload>,
) => {
    try {
        if (req.method !== "GET") throw new HttpException(405, "Method not allowed");

        if (req.headers.authorization === undefined)
            throw new HttpException(401, "No authorization header found");

        // Verify token
        const token = req.headers.authorization.split(" ")[1];
        const authUser = await verifyIdTokenValid(token);
        const userDetails = await getUserDetails(authUser.email);
        return res.status(200).json({ ...userDetails });
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};
