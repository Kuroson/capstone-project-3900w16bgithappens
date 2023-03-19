import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PageviewRounded } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import EditIcon from "@mui/icons-material/Edit";
import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import ImportContacts from "@mui/icons-material/ImportContacts";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Button, IconButton, TextField } from "@mui/material";
import { ResourceInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { PageFull } from "models/page.model";
import { SectionFull } from "models/section.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { Logger } from "sass";
import JSXStyle from "styled-jsx/style";
import {
  AddNewResourceSection,
  AdminNavBar,
  ContentContainer,
  ResourcesSection,
  SingleEditableResource,
} from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import ShowOrEditPage from "components/SectionPage/ShowOrEditPage";
import EditPanelButtons from "components/admin/EditPanelButtons";
import TitleWithIcon from "components/common/TitleWithIcon";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getFileDownloadLink } from "util/api/ResourceApi";
import { CLIENT_BACKEND_URL, apiDelete, apiGet } from "util/api/api";
import { getUserCourseDetails } from "util/api/courseApi";
import {
  AddSectionPayloadRequest,
  DeleteSectionPayloadRequest,
  RemoveResourcePayloadRequest,
  UpdatePagePayloadRequest,
  UpdateSectionPayloadRequest,
  UploadFilePayloadResponse,
  addNewResource,
  createSection,
  deletePage,
  deleteSection,
  removeResource,
  updatePageResource,
  updateSection,
  uploadResourceFile,
} from "util/api/pageApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import { Nullable, getRoleName } from "util/util";

initAuth(); // SSR maybe, i think...

type AdminCoursePageProps = {
  courseData: UserCourseInformation;
  pageData: PageFull;
};

type PageSectionsProps = {
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
  pageId: string;
  courseId: string;
};

type SingleEditableSectionProps = {
  section: SectionFull;
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
  pageId: string;
  courseId: string;
};

type AddNewSectionProps = {
  courseId: string;
  pageId: string;
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
};

const AddNewSection = ({
  courseId,
  pageId,
  sections,
  setSections,
}: AddNewSectionProps): JSX.Element => {
  const authUser = useAuthUser();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");

  React.useEffect(() => {
    setOpen(false);
    setTitle("");
  }, [courseId, pageId]);

  const handleCloseForm = async () => {
    setOpen(false);
    setTitle("");
  };

  const handleNewSection = async () => {
    const newSection: AddSectionPayloadRequest = {
      title: title,
      courseId: courseId,
      pageId: pageId,
      sectionId: null,
    };

    const [res, err] = await createSection(await authUser.getIdToken(), newSection, "client");

    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not add a new section");
      }
      return;
    }
    if (res === null) throw new Error("Should not happen");
    const newSectionToAdd: SectionFull = {
      _id: res.sectionId,
      title: title,
      resources: [],
    };

    setSections([...sections, newSectionToAdd]);
    toast.success("Added a new section");
    setTitle("");
    // setSections((prev) => [...prev, newSection]);
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="pb-4">
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New Section
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-4 flex flex-col">
      <div className="pb-4">
        <TextField
          id="Resource Title"
          label="Resource Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-[300px] max-w-[500px]"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outlined" color="error" onClick={handleCloseForm}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleNewSection} disabled={title === ""}>
          Add
        </Button>
      </div>
    </div>
  );
};

const SingleEditableSection = ({
  section,
  sections,
  setSections,
  pageId,
  courseId,
}: SingleEditableSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [resources, setResources] = React.useState<ResourceInterface[]>(section.resources);
  const [dynamicTitle, setDynamicTitle] = React.useState(section.title);
  const [editMode, setEditMode] = React.useState(false);

  React.useEffect(() => {
    // If any values change in the upper components, update them here as well
    setResources(section.resources);
    setDynamicTitle(section.title);
  }, [section.resources, sections, section.title]);

  const handleEditClick = async () => {
    if (editMode) {
      if (dynamicTitle.length === 0) {
        toast.error("Section title cannot be empty");
        return;
      }

      const payload: UpdateSectionPayloadRequest = {
        sectionId: section._id,
        title: dynamicTitle,
        courseId: courseId,
        pageId: pageId,
      };

      const [res, err] = await updateSection(await authUser.getIdToken(), payload, "client");

      if (err !== null) {
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error("Could not update section title");
        }
        return;
      }
      if (res === null) throw new Error("Shouldn't have happened");
    }
    setEditMode(!editMode);
  };
  const handleRemoveClick = async () => {
    const payload: DeleteSectionPayloadRequest = {
      courseId: courseId,
      pageId: pageId,
      sectionId: section._id,
    };

    const [res, err] = await deleteSection(await authUser.getIdToken(), payload, "client");
    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not delete section");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't have happened");

    // update
    setSections(sections.filter((s) => s._id !== section._id));
    toast.success("Deleted section");
  };

  return (
    <div key={section._id}>
      <div className="w-full flex flex-col bg-gray-300 rounded-xl px-[2.5%] py-[2.5%] mb-5">
        <div className="flex flex-row">
          {editMode ? (
            <TextField
              id="Section Title"
              label="Section Title"
              variant="outlined"
              value={dynamicTitle}
              onChange={(e) => setDynamicTitle(e.target.value)}
            />
          ) : (
            <TitleWithIcon text={`Section: ${dynamicTitle}`}>
              <ImportContacts color="primary" />
            </TitleWithIcon>
          )}
          <div className="flex h-full items-center justify-center">
            <EditPanelButtons
              editMode={editMode}
              handleEditClick={handleEditClick}
              handleRemoveClick={handleRemoveClick}
            />
          </div>
        </div>
        <ResourcesSection
          resources={resources}
          setResources={setResources}
          pageId={pageId}
          courseId={courseId}
          sectionId={section._id}
        />
      </div>
    </div>
  );
};

const PageSections = ({
  sections,
  setSections,
  pageId,
  courseId,
}: PageSectionsProps): JSX.Element => {
  return (
    <div>
      {sections.map((section) => {
        return (
          <SingleEditableSection
            key={section._id}
            section={section}
            sections={sections}
            setSections={setSections}
            pageId={pageId}
            courseId={courseId}
          />
        );
      })}
    </div>
  );
};

const AdminCoursePage = ({ courseData, pageData }: AdminCoursePageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  // const [dynamicPageData, setDynamicPageData] = React.useState(pageData);
  const [dynamicResources, setDynamicResources] = React.useState(pageData.resources);
  const [dynamicSections, setDynamicSections] = React.useState(pageData.sections);

  React.useEffect(() => {
    // Trigger a re-render when pageData props change from server
    setDynamicResources(pageData.resources);
    setDynamicSections(pageData.sections);
  }, [pageData]);

  React.useEffect(() => {
    // Build user data for user context
    const fetchUserData = async () => {
      const [resUserData, errUserData] = await getUserDetails(
        await authUser.getIdToken(),
        authUser.email ?? "bad",
        "client",
      );

      if (errUserData !== null) {
        throw errUserData;
      }

      if (resUserData === null) throw new Error("This shouldn't have happened");
      return resUserData;
    };

    if (user.userDetails === null) {
      fetchUserData()
        .then((res) => {
          if (user.setUserDetails !== undefined) {
            user.setUserDetails(res.userDetails);
          }
        })
        .then(() => setLoading(false))
        .catch((err) => {
          toast.error("failed to fetch shit");
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || user.userDetails === null) return <div>Loading...</div>;
  const userDetails = user.userDetails as UserDetails;

  const navRoutes: Routes[] = [
    { name: "Dashboard", route: "/admin", icon: <HomeIcon fontSize="large" color="primary" /> },
    {
      name: "Home",
      route: `/admin/${courseData._id}`,
      icon: <GridViewIcon fontSize="large" color="primary" />,
    },
    {
      name: "Students",
      route: `/admin/${courseData._id}/students`,
      icon: <PeopleAltIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...courseData.pages.map((page) => ({
      name: page.title,
      route: `/admin/${courseData._id}/${page._id}`,
    })),
  ];

  const handleDeletePage = async () => {
    const [data, err] = await deletePage(
      await authUser.getIdToken(),
      courseData._id,
      pageData._id,
      "client",
    );
    if (err !== null) {
      console.error(err);
    }
    router.push(`/admin/${courseData._id}`);
  };

  return (
    <>
      <Head>
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar
        userDetails={userDetails}
        routes={navRoutes}
        courseData={courseData}
        showAddPage={true}
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between pt-3">
            <div className="flex items-center gap-4">
              <span className="ml-4">{pageData.title}</span>
            </div>
            <Button color="error" onClick={handleDeletePage} startIcon={<DeleteIcon />}>
              Delete page
            </Button>
          </h1>
          <ResourcesSection
            resources={dynamicResources}
            setResources={setDynamicResources}
            pageId={pageData._id}
            courseId={courseData._id}
            sectionId={null}
          />
          <PageSections
            sections={dynamicSections}
            setSections={setDynamicSections}
            pageId={pageData._id}
            courseId={courseData._id}
          />
          <AddNewSection
            sections={dynamicSections}
            setSections={setDynamicSections}
            pageId={pageData._id}
            courseId={courseData._id}
          />
          {/* <ShowOrEditPage
            pageData={dynamicPageData}
            setPageData={setDynamicPageData}
            courseId={courseData._id}
            authUser={authUser}
          /> */}
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AdminCoursePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AdminCoursePageProps } | { notFound: true }> => {
  /**
   * Parse the resource and fetch links if they require it
   * @returns
   */
  const parseResource = async (
    originalResources: ResourceInterface[],
  ): Promise<ResourceInterface[]> => {
    const parsedResources: ResourceInterface[] = [];
    const resourcesPromises = originalResources.map(async (resource) => {
      if (resource.file_type !== undefined && resource.file_type !== null) {
        // Its a file
        const [link, linkErr] = await getFileDownloadLink(
          await AuthUser.getIdToken(),
          resource._id,
          "ssr",
        );

        if (link !== null) {
          parsedResources.push({
            ...resource,
            stored_name: link.linkToFile,
            file_type: link.fileType,
          });
        }
      } else {
        parsedResources.push(resource);
      }
    });

    await Promise.all(resourcesPromises);
    return parsedResources;
  };

  const { courseId, pageId } = query;
  if (
    courseId === undefined ||
    typeof courseId !== "string" ||
    pageId === undefined ||
    typeof pageId !== "string"
  ) {
    return { notFound: true };
  }

  const [courseDetails, courseDetailsErr] = await getUserCourseDetails(
    await AuthUser.getIdToken(),
    courseId as string,
    "ssr",
  );

  if (courseDetailsErr !== null) {
    console.error(courseDetailsErr);
    // handle error
    return { notFound: true };
  }

  if (courseDetails === null) throw new Error("This shouldn't have happened");
  const page = courseDetails.pages.find((page) => page._id === pageId);
  if (page === undefined) return { notFound: true };

  // Fetch link for resources
  page.resources = await parseResource(page.resources);

  // Now for each section
  for (const section of page.sections) {
    section.resources = await parseResource(section.resources);
  }
  return {
    props: {
      pageData: page,
      courseData: courseDetails,
    },
  };
});

export default withAuthUser<AdminCoursePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(AdminCoursePage);
