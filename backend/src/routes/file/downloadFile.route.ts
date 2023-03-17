import { HttpException } from "@/exceptions/HttpException";
import Resource from "@/models/resource.model";
import { checkAuth, recallFileUrl, verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    linkToFile?: string;
    fileType?: string;
    message?: string;
};

type QueryPayload = {
    resourceId: string;
};

/**
 * GET /file
 * Attempt to get the details of a file based on resourceId
 * @param req
 * @param res
 * @returns
 */
export const downloadFileController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authUser = await checkAuth(req as any);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["resourceId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { resourceId } = req.query;

            // Fetch from database
            const myFile = await Resource.findById(resourceId).catch((err) => null);
            if (myFile === null)
                throw new HttpException(400, `Failed to retrieve resource of ${resourceId}`);

            if (myFile.stored_name === undefined || myFile.stored_name === "") {
                return res.status(200).json({ linkToFile: "", fileType: "" });
            }

            const fileUrl = await recallFileUrl(myFile.stored_name);
            return res.status(200).json({ linkToFile: fileUrl, fileType: myFile.file_type });
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
