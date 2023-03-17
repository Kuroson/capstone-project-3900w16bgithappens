import { HttpException } from "@/exceptions/HttpException";
import Course, { CourseInterface } from "@/models/course.model";
import Page, { PageInterface } from "@/models/page.model";
import { UserInterface } from "@/models/user.model";
import { checkAuth, verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = CourseInformation;

type CourseInformation = Omit<CourseInterface, "students" | "pages" | "creator"> & {
    pages: PageInterface[];
};

type QueryPayload = {
    courseCode: string;
};

export const getCourseController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseCode"];
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseCode } = req.query;

            const courseData = await getCourse(courseCode);

            return res.status(200).json({ ...courseData });
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
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

/**
 * Gets the information for a given course including its base info (title, code, etc.) and the pages
 * it contains
 *
 * @param courseId The ID of the course to be recalled
 * @returns Base information on the course based on return requirements in ResponsePayload
 */
export const getCourse = async (courseId: string): Promise<CourseInformation> => {
    const myCourse = await Course.findById(courseId)
        .select("_id title code description session icon pages")
        .populate("pages");

    if (myCourse === null) throw new HttpException(400, `Course of ${courseId} does not exist`);
    return myCourse;
};
