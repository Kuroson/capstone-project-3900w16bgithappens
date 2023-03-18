import { HttpException } from "@/exceptions/HttpException";
import Course, { CourseInterface } from "@/models/course.model";
import { PageInterface } from "@/models/page.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
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

/**
 * GET /course
 * Gets the course's information. Must be enrolled in said course or be an admin
 *
 * NOTE: untested atm
 * @param req
 * @param res
 * @returns
 */
export const getCourseController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseCode"];
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseCode } = req.query;

            const courseData = await getCourse(courseCode, authUser.uid);

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
 * @param firebaseUID The firebaseUID of the user requesting the course
 * @returns Base information on the course based on return requirements in ResponsePayload
 */
export const getCourse = async (
    courseId: string,
    firebaseUID: string,
): Promise<CourseInformation> => {
    // Find user first
    const user = await User.findOne({ firebase_uid: firebaseUID }).catch(() => null);
    if (user === null) throw new HttpException(400, `User of ${firebaseUID} does not exist`);

    // Check if user is enrolled in course
    const myCourse = await Course.findById(courseId)
        .select("_id title code description session icon pages")
        .populate("pages");

    if (myCourse === null) throw new HttpException(400, `Course of ${courseId} does not exist`);
    if (!myCourse.students.includes(user._id))
        throw new HttpException(400, "User is not enrolled in course");

    return myCourse;
};
