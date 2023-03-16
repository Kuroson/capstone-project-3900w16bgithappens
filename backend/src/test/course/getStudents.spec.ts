import Course from "@/models/course.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { getCourse } from "@/routes/course/getCourse.route";
import { getStudents } from "@/routes/course/getStudents.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test getting a list of students from a course", () => {
    const id = uuidv4();
    let courseId: string;

    const userData = [
        genUserTestOnly("first_name1", "last_name1", `admin${id}@email.com`, `acc${id}`),
        genUserTestOnly("first_name2", "last_name2", `student1${id}@email.com`, `acc1${id}`),
    ];

    beforeAll(async () => {
        await initialiseMongoose();

        await registerMultipleUsersTestingOnly(userData);

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

        await addStudents({
            courseId: courseId,
            students: [`student1${id}@email.com`],
        });
    });

    it("Can get student information", async () => {
        const res = await getStudents(courseId);

        expect(res.code).toBe("TEST");
        expect(res.students.length).toBe(1);

        expect(res.students.at(0)?.email).toEqual(`student1${id}@email.com`);
        expect(res.students.at(0)?.first_name).toEqual("first_name2");
        expect(res.students.at(0)?.last_name).toEqual("last_name2");
    });

    it("Invalid course ID should throw", async () => {
        expect(getCourse("FAKE ID")).rejects.toThrow();
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteMany({ email: userData.map((x) => x.email) }).exec();
        await disconnect();
    });
});
