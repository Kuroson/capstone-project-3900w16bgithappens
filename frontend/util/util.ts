export type Nullable<T> = { [K in keyof T]: T[K] | null };

export const INSTRUCTOR_NUMBER = 0;
export const STUDENT_NUMBER = 1;

export const getRoleName = (role: number | null): string => {
  if (role === null) return "";
  if (role === INSTRUCTOR_NUMBER) return "Instructor";
  return "Student";
};

export type CourseGETResponse = {
  courses: CourseInformation[];
};

export type CourseInformation = {
  courseId: string;
  title: string;
  code: string;
  description: string;
  session: string;
  icon: string;
};
