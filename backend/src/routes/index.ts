import { firebaseUpload } from "@/utils/firebase";
import { Router } from "express";
import { accessController } from "./admin/access.route";
import { adminController } from "./admin/admin.route";
import { addStudentsController } from "./course/addStudents.route";
import { createCourseController } from "./course/createCourse.route";
import { getAllCoursesController } from "./course/getAllCourses.route";
import { getCourseController } from "./course/getCourse.route";
import { getStudentsController } from "./course/getStudents.route";
import { removeStudentsController } from "./course/removeStudents.route";
import { updateCourseController } from "./course/updateCourse.route";
import { downloadFileController } from "./file/downloadFile.route";
import { uploadFileController } from "./file/uploadFile.route";
import { indexController } from "./index.route";
import { addResourceController } from "./page/addResource.route";
import { addSectionController } from "./page/addSection.route";
import { createPageController } from "./page/createPage.route";
import { deletePageController } from "./page/deletePage.route";
import { deleteResourceController } from "./page/deleteResource.route";
import { deleteSectionController } from "./page/deleteSection.route";
import { getPageController } from "./page/getPage.route";
import { getPagesController } from "./page/getPages.route";
import { updatePageController } from "./page/updatePage.route";
import { registerController } from "./user/register.route";
import { userDetailsController } from "./user/userDetails.route";

export const indexRouter = Router();

// Base routes
indexRouter.get("/", indexController);

// Admin routes
indexRouter.get("/admin", adminController);
indexRouter.get("/admin/access", accessController);

// User routes
indexRouter.get("/user/details", userDetailsController);
indexRouter.post("/user/register", registerController);

// Course routes
indexRouter.get("/course", getCourseController);
indexRouter.post("/course/create", createCourseController);
indexRouter.get("/course/all", getAllCoursesController);
indexRouter.put("/course/update", updateCourseController);
indexRouter.get("/course/students", getStudentsController);
indexRouter.put("/course/students/add", addStudentsController);
indexRouter.put("/course/students/remove", removeStudentsController);

// Page routes
indexRouter.post("/page/create", createPageController); // done
indexRouter.get("/page/:courseId", getPagesController);
indexRouter.delete("/page/:courseId", deletePageController);
indexRouter.put("/page/:courseId/:pageId", updatePageController);
indexRouter.get("/page/:courseId/:pageId", getPageController);
indexRouter.put("/page/:courseId/:pageId/resource", addResourceController);
indexRouter.put("/page/:courseId/:pageId/section", addSectionController);
indexRouter.delete("/page/:courseId/:pageId/resource", deleteResourceController);
indexRouter.delete("/page/:courseId/:pageId/section", deleteSectionController);

// File routes
indexRouter.post("/file/upload", firebaseUpload.single("file"), uploadFileController);
indexRouter.get("/file/download/:resourceId", downloadFileController);
