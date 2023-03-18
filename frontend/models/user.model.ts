import { MongooseDocument, MongooseId } from "models";

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
