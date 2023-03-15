import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { getCourse } from "@/routes/course/getCourse.route";
import { getStudents } from "@/routes/course/getStudents.route";
import initialiseMongoose from "../testUtil";

describe("Test getting a list of students from a course", () => {
    const id = Date.now();
    let courseId: string;

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name1", "last_name1", `admin${id}@email.com`, `acc${id}`);
        await registerUser("first_name2", "last_name2", `student1${id}@email.com`, `acc1${id}`);
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
            students: Array<string>(`student1${id}@email.com`),
        });
    }, 20000);

    it("Can get student information", async () => {
        const res = await getStudents(courseId);

        expect(res.code).toBe("TEST");
        expect(res.students.length).toBe(1);

        expect(res.students.at(0)?.email).toEqual(`student1${id}@email.com`);
        expect(res.students.at(0)?.first_name).toEqual("first_name2");
        expect(res.students.at(0)?.last_name).toEqual("last_name2");
    }, 10000);

    it("Invalid course ID should throw", async () => {
        expect(getCourse("FAKE ID")).rejects.toThrow();
    }, 10000);

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
    });
});
