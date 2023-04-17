import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createOnlineClass } from "@/routes/onlineClasses/createOnlineClass.route";
import { getClassFromId } from "@/routes/onlineClasses/getOnlineClass.route";
import { triggerOnlineClass } from "@/routes/onlineClasses/startOnlineClass.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test end online class", () => {
    const id = uuidv4();

    let courseId;
    let onlineClassId;

    const onlineClassTitle = "Test online class";
    const onlineClassDescription = "This is the description";
    const onlineClassLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const onlineClassDate: number = Date.now();

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
        onlineClassId = await createOnlineClass(
            courseId,
            onlineClassTitle,
            onlineClassDescription,
            onlineClassDate,
            onlineClassLink,
        );
        await triggerOnlineClass(onlineClassId, true);
        const data = await getClassFromId(onlineClassId);
        expect(data.running).toEqual(true);
    });

    it("Bad classId should fail", async () => {
        expect(triggerOnlineClass("badClassId", false)).rejects.toThrow(HttpException);
        const data = await getClassFromId(onlineClassId);
        expect(data.running).toEqual(true);
    });

    it("end class successfully", async () => {
        await triggerOnlineClass(onlineClassId, false);
        const data = await getClassFromId(onlineClassId);
        expect(data.running).toEqual(false);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await OnlineClass.findByIdAndDelete(onlineClassId).exec();
        await disconnect();
    });
});
