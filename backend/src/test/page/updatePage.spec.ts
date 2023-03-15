import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import { updatePage } from "@/routes/page/updatePage.route";
import initialiseMongoose from "../testUtil";

describe("Test updating a page", () => {
    const id = Date.now();
    let courseId: string;
    let pageId: string;

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

    beforeEach(async () => {
        pageId = await createPage(
            {
                title: "Test page",
                courseId,
            },
            `acc${id}`,
        );
    });

    it("Should add page information to the course", async () => {
        const pageState = await updatePage(
            {
                courseId,
                pageId,
                resources: [{ title: "res1" }, { title: "res2" }],
                sections: [
                    {
                        title: "sec1",
                        resources: [{ title: "res3" }, { title: "res4" }],
                    },
                    {
                        title: "sec2",
                        resources: [],
                    },
                ],
            },
            `acc${id}`,
        );

        expect(pageState.courseId).toBe(courseId);
        expect(pageState.resources.length).toBe(2);
        expect(pageState.resources[0].title).toBe("res1");
        expect(pageState.resources[1].title).toBe("res2");
        expect(pageState.sections.length).toBe(2);
        expect(pageState.sections[0].title).toBe("sec1");
        expect(pageState.sections[0].resources.length).toBe(2);
        expect(pageState.sections[0].resources[0].title).toBe("res3");
        expect(pageState.sections[0].resources[1].title).toBe("res4");
        expect(pageState.sections[1].title).toBe("sec2");
        expect(pageState.sections[1].resources.length).toBe(0);
    }, 10000);

    it("Should update only indicated page information when called the second time", async () => {
        const initialPage = await updatePage(
            {
                courseId,
                pageId,
                resources: [{ title: "res1" }, { title: "res2" }],
                sections: [
                    {
                        title: "sec1",
                        resources: [{ title: "res3" }, { title: "res4" }],
                    },
                    {
                        title: "sec2",
                        resources: [],
                    },
                ],
            },
            `acc${id}`,
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (initialPage as any).resources.push({ title: "newOne" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (initialPage as any).sections[1].resources.push({ title: "newOne2" });

        const updatedPageState = await updatePage(initialPage, `acc${id}`);

        expect(updatedPageState.courseId).toBe(courseId);
        expect(updatedPageState.resources.length).toBe(3);
        expect(updatedPageState.resources[0].title).toBe("res1");
        expect(updatedPageState.resources[1].title).toBe("res2");
        expect(updatedPageState.resources[2].title).toBe("newOne");
        expect(updatedPageState.sections.length).toBe(2);
        expect(updatedPageState.sections[0].title).toBe("sec1");
        expect(updatedPageState.sections[0].resources.length).toBe(2);
        expect(updatedPageState.sections[0].resources[0].title).toBe("res3");
        expect(updatedPageState.sections[0].resources[1].title).toBe("res4");
        expect(updatedPageState.sections[1].title).toBe("sec2");
        expect(updatedPageState.sections[1].resources.length).toBe(1);
        expect(updatedPageState.sections[1].resources[0].title).toBe("newOne2");
    }, 10000);

    afterEach(async () => {
        await deletePage({ courseId, pageId }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
    });
});
