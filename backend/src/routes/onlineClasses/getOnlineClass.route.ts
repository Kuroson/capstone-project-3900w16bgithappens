import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import OnlineClass, {
    FullOnlineClassInterface,
    OnlineClassInterface,
} from "@/models/course/onlineClass/onlineClass.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = FullOnlineClassInterface;

type QueryPayload = {
    classId: string;
};

/**
 * GET /class
 * Gets a class based on classId
 * @param req
 * @param res
 */
export const getOnlineClassController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["classId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { classId } = req.query;
            const classData = await getClassFromId(classId);
            return res.status(200).json({ ...classData });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.query, KEYS_TO_CHECK)}`,
            );
        }
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

/**
 * Gets all class information stored in MongoDB
 * @param classId id to query
 * @returns
 */
export const getClassFromId = async (classId: string): Promise<FullOnlineClassInterface> => {
    const onlineClass = OnlineClass.findById(classId).populate("chatMessages");
    return onlineClass as unknown as FullOnlineClassInterface;
};
