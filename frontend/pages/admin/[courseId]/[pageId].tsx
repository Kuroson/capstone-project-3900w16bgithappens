import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import EditIcon from "@mui/icons-material/Edit";
import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Button, IconButton, TextField } from "@mui/material";
import { ResourceInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { PageFull } from "models/page.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import ShowOrEditPage from "components/SectionPage/ShowOrEditPage";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getFileDownloadLink } from "util/api/ResourceApi";
import { CLIENT_BACKEND_URL, apiDelete, apiGet } from "util/api/api";
import { getUserCourseDetails } from "util/api/courseApi";
import {
  UpdatePagePayloadRequest,
  deletePage,
  updatePageResource,
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

type SingleResourceProps = {
  resource: ResourceInterface;
  setResources: React.Dispatch<React.SetStateAction<ResourceInterface[]>>;
  courseId: string;
  pageId: string;
};

/**
 * Component for a single resource.
 * Has an edit option
 */
const SingleResource = ({
  resource,
  setResources,
  courseId,
  pageId,
}: SingleResourceProps): JSX.Element => {
  const authUser = useAuthUser();

  const [editMode, setEditMode] = React.useState(false);
  const [title, setTitle] = React.useState(resource.title);
  const [description, setDescription] = React.useState(resource.description);
  const [storedName, setStoredName] = React.useState(resource.stored_name);
  const [fileType, setFileType] = React.useState(resource.file_type);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [file, setFile] = React.useState<any>(null);

  const FROG_IMAGE_URL =
    "https://i.natgeofe.com/k/8fa25ea4-6409-47fb-b3cc-4af8e0dc9616/red-eyed-tree-frog-on-leaves-3-2_3x2.jpg";

  const handleRemoveClick = () => {};

  const handleEditClick = async () => {
    if (editMode) {
      // Was already in edit mode, need to save changes now
      // Save the text
      const newResource: UpdatePagePayloadRequest = {
        courseId: courseId,
        pageId: pageId,
        resourceId: resource._id,
        title: title,
        description: description ?? "",
        sectionId: null, // not a section
      };

      const [res, err] = await updatePageResource(
        await authUser.getIdToken(),
        newResource,
        "client",
      );

      if (err !== null) {
        // Error exists
        console.error(err);
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error("Could not save changes. Please try again later.");
        }
        return;
      }
      if (res === null) throw new Error("Shouldn't happen");
      toast.success("Text changes saved");

      if (file !== null) {
        // Save files now
        toast.warning("File upload detected");
        const [fileRes, fileErr] = await uploadResourceFile(
          await authUser.getIdToken(),
          file,
          { resourceId: resource._id },
          "client",
        );

        if (fileErr !== null) {
          console.error(fileErr);
          if (fileErr instanceof HttpException) {
            toast.error(fileErr.message);
          } else {
            toast.error("Failed to upload file");
          }
          return;
        }

        if (fileRes === null) throw new Error("Shouldn't happen");
        toast.success("File uploaded");
        setFile(null);
      }
    }
    setEditMode(!editMode);
  };

  /**
   * Edit and delete buttons
   */
  const EditPanel = (): JSX.Element => {
    return (
      <div className="outline">
        <IconButton
          color="primary"
          aria-label="edit"
          component="label"
          onClick={handleEditClick}
          // disabled={editResource && title === ""}
        >
          {editMode ? <DoneIcon /> : <EditIcon />}
        </IconButton>
        <IconButton color="error" aria-label="delete" component="label" onClick={handleRemoveClick}>
          <DeleteIcon />
        </IconButton>
      </div>
    );
  };

  // Show edit interface
  if (editMode) {
    return (
      <div className="w-full pt-5">
        <div className="flex flex-col w-full">
          <div className="w-full pb-5">
            <TextField
              id="Resource Title"
              label="Resource Title"
              variant="outlined"
              sx={{ maxWidth: "500px" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <TextField
            id="Resource Description"
            label="Resource Description"
            variant="outlined"
            multiline
            rows={5}
            sx={{ maxWidth: "1000px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {storedName !== "" && storedName !== undefined ? (
            <Link href={storedName} target="_blank" className="py-4">
              <Button variant="contained">Download existing resource</Button>
            </Link>
          ) : (
            <div className="w-full flex items-center">
              <Button
                variant="contained"
                component="label"
                className="w-[250px] my-4"
                startIcon={<DriveFolderUploadIcon />}
              >
                Upload New Material
                <input
                  hidden
                  type="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
              </Button>
              {file !== null && (
                <p className="pl-5">
                  <i>{file.name}</i>
                </p>
              )}
            </div>
          )}
        </div>
        <div>
          <EditPanel />
        </div>
      </div>
    );
  }

  // Show normal interface
  return (
    <div className="w-full pt-5">
      <span className="w-full text-xl font-medium flex flex-col">{title}</span>
      {/* Description */}
      {description ?? <span className="">{description}</span>}
      {/* Resource */}
      {storedName !== undefined && (
        <div className="my-5">
          {fileType?.includes("image") ?? false ? (
            <div>
              <img src={storedName ?? FROG_IMAGE_URL} alt={description} />
            </div>
          ) : (
            <Link href={storedName} target="_blank">
              <Button variant="contained">Download File</Button>
            </Link>
          )}
        </div>
      )}
      <div>
        <EditPanel />
      </div>
    </div>
  );
};

type ResourcesSectionProps = {
  resources: ResourceInterface[];
  setResources: React.Dispatch<React.SetStateAction<ResourceInterface[]>>;
  courseId: string;
  pageId: string;
};

const ResourcesSection = ({
  resources,
  setResources,
  courseId,
  pageId,
}: ResourcesSectionProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full">
      {resources.map((resource) => {
        return (
          <SingleResource
            resource={resource}
            key={resource._id}
            setResources={setResources}
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
