import {
  MongooseDocument,
  MongooseId,
  PageInterface,
  ResourceInterface,
  SectionInterface,
} from "models";

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

export type BasicCourseInfo = Omit<CourseInterface, "creator" | "pages" | "students">;

export type UserCourseInformation = Omit<CourseInterface, "students" | "pages" | "creator"> & {
  pages: Omit<PageInterface, "section" | "resources"> &
    {
      section: Omit<SectionInterface, "resources"> &
        {
          resources: ResourceInterface[];
        }[];
      resources: ResourceInterface[];
    }[];
};
