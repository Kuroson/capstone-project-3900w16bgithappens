import { CourseInterface, MongooseDocument, MongooseId } from "models";
import { UserCourseInfo } from "./course.model";

export const STUDENT_ROLE = "1";
export const INSTRUCTOR_ROLE = "0";

export interface UserInterface extends MongooseDocument {
  firebase_uid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: number; // 0=instructor, 1=student
  enrolments: Array<MongooseId>;
  created_courses: Array<MongooseId>;
  avatar?: string;
}

export type UserDetails = Omit<UserInterface, "enrolments" | "created_courses"> & {
  enrolments: UserCourseInfo[];
  created_courses: UserCourseInfo[];
};
