import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { registerUser } from "@/routes/user/register.route";
import { getUserDetails } from "@/routes/user/userDetails.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test user details", () => {
    const id = uuidv4();
    const email1 = `jest-${id}@delete.com`;

    beforeAll(async () => {
        await initialiseMongoose();
    });

    it("Create new user then get details", async () => {
        await registerUser(`firstJest${id}`, `lastJest${id}`, email1, id.toString());
        const userDetails = await getUserDetails(email1);
        expect(userDetails?.firstName).toBe(`firstJest${id}`);
        expect(userDetails?.lastName).toBe(`lastJest${id}`);
        expect(userDetails?.email).toBe(email1);
        expect(userDetails?.role).toBe(1); // Non admin
    });

    it("Request bad email", async () => {
        await expect(getUserDetails("badEmail")).rejects.toThrow(HttpException);
        await getUserDetails("badEmail").catch((err) => {
            expect(err.status).toBe(400); // Bad request
        });
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ email: email1 }).exec();
        await disconnect();
    });
});
