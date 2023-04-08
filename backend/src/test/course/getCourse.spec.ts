/* eslint-disable @typescript-eslint/no-explicit-any */
import Course from "@/models/course/course.model";
import Post from "@/models/course/forum/post.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import Page from "@/models/course/page/page.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { getCourse } from "@/routes/course/getCourse.route";
import { getPage } from "@/routes/course/getCoursePage.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import { updatePage } from "@/routes/page/updatePage.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test getting course details", () => {
    const id = uuidv4();
    let courseId: string;

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
        courseId = await createCourse(
            {
                code: "TEST",
                title: "Test",
                session: "T1",
                description: "This is a test course",
                icon: "",
            },
            `acc${id}`,
        );
    });

    it("Test kudosValues exists in courseDetails", async () => {
        Page;
        OnlineClass;
        Post;
        const courseData = await getCourse(courseId, `acc${id}`);
        expect(courseData.kudosValues).toBeDefined();
        expect(courseData.kudosValues.forumPostAnswer).toEqual(100); // default value of 100
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await disconnect();
    });
});
