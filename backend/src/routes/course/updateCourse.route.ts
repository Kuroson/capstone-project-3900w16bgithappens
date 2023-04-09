import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    courseId: string;
};

type QueryPayload = {
    courseId: string;
    code?: string;
    title?: string;
    session?: string;
    description?: string;
    icon?: string;
    tags?: Array<string>;
    archived?: boolean;
};

/**
 * PUT /course/update
 * Update a course with new information
 * @param req
 * @param res
 * @returns
 */
export const updateCourseController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const courseId = await updateCourse(queryBody, authUser.uid);

            logger.info(`courseId: ${courseId}`);
            return res.status(200).json({ courseId });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [])}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res
                .status(error.getStatusCode())
                .json({ message: error.getMessage(), courseId: "" });
        } else {
            logger.error(error);
            return res
                .status(500)
                .json({ message: "Internal server error. Error was not caught", courseId: "" });
        }
    }
};

/**
 * Updates the specified fields within the specified course
 *
 * @param queryBody Fields that should be updated for the course in the format of
 * QueryPayload defined above
 * @throws { HttpException } If user is not admin, or courseId is invalid
 * @returns The ID of the course updated
 */
export const updateCourse = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to update course");
    }

    const { courseId, code, title, session, description, icon, tags, archived } = queryBody;

    const myCourse = await Course.findById(courseId).exec();

    if (myCourse === null) throw new HttpException(400, `Failed to retrieve course of ${courseId}`);

    if (code !== undefined) {
        myCourse.code = code;
    }

    if (title !== undefined) {
        myCourse.title = title;
    }

    if (session !== undefined) {
        myCourse.session = session;
    }

    if (description !== undefined) {
        myCourse.description = description;
    }

    if (icon !== undefined) {
        myCourse.icon = icon;
    }

    if (tags !== undefined && tags.length !== 0) {
        myCourse.tags.length = 0;
        tags.forEach((tag) => myCourse.tags.addToSet(tag));
    }

    if (archived !== undefined) {
        myCourse.archived = archived;
    }

    const retCourseId = await myCourse
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to update course", err);
        });

    return retCourseId;
};
