import { MongooseDocument, MongooseId } from "models";

export interface CourseInterface extends MongooseDocument {
  title: string;
  code: string;
  description?: string;
  session: string;
  icon?: string;
  creator: MongooseId;
  pages: Array<MongooseId>;
  students: Array<MongooseId>;
}

export type UserCourseInfo = Omit<CourseInterface, "creator" | "pages" | "students">;
