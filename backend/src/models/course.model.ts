import { Document, Schema, Types, model } from "mongoose";
import { Page } from "./page.model";
import { UserInterface } from "./user.model";

/**
 * Model to represent a course in the system
 * A course has some base information (title, code, description,
 * session it is running in, icon, and instructor who made it)
 *
 * A course is split up to have many pages that can have information added to them
 */
export interface CourseInterface extends Document {
    title: string;
    code: string;
    description?: string;
    session: string;
    icon?: string;
    creator: UserInterface["_id"];
    pages: Types.DocumentArray<Page["_id"]>;
    students: Types.DocumentArray<UserInterface["_id"]>;
}

export type CourseInterfaceFull = Omit<Omit<UserInterface, "enrolments">, "created_courses"> & {
    // Omit the two arrays of ids and replace them with the full objects
    enrolments: CourseInterface[];
    created_courses: CourseInterface[];
};

const courseSchema: Schema = new Schema<CourseInterface>({
    title: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String },
    session: { type: String, required: true },
    icon: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pages: [{ type: Schema.Types.ObjectId, ref: "Page" }],
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Course = model<CourseInterface & Document>("Course", courseSchema);

export default Course;
