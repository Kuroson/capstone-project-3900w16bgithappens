/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Button, Typography } from "@mui/material";
import { ResourceInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { PageFull } from "models/page.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import {
  AuthAction,
  AuthUserContext,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { ContentContainer, StudentNavBar } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import { useUser } from "util/UserContext";
import { getFileDownloadLink } from "util/api/ResourceApi";
import { CLIENT_BACKEND_URL, apiGet, apiUploadFile } from "util/api/api";
import { getUserCourseDetails } from "util/api/courseApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import { Nullable, getRoleName } from "util/util";

initAuth(); // SSR maybe, i think...

type CoursePageProps = {
  courseData: UserCourseInformation;
  pageData: PageFull;
};

const FROG_IMAGE_URL =
  "https://i.natgeofe.com/k/8fa25ea4-6409-47fb-b3cc-4af8e0dc9616/red-eyed-tree-frog-on-leaves-3-2_3x2.jpg";

type ResourceDisplayProps = {
  resources: ResourceInterface[];
};

/**
 * Main Resource display
 */
const ResourcesDisplay = ({ resources }: ResourceDisplayProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full">
      {resources.map((resource) => {
        return (
          <div key={resource._id} className="w-full mb-5">
            <span className="w-full text-xl font-medium flex flex-col">{`Resource: ${resource.title}`}</span>
            {/* Description */}
            {resource.description ?? (
              <span className="">{`Description: ${resource.description}`}</span>
            )}
            {/* Resource */}
            {resource.stored_name !== undefined && (
              <div className="my-5">
                {resource.file_type?.includes("image") ?? false ? (
                  <div>
                    <img src={resource.stored_name ?? FROG_IMAGE_URL} alt={resource.description} />
                  </div>
                ) : (
                  <Link href={resource.stored_name} target="_blank">
                    <Button variant="contained">Download File</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Page for a course
 */
const CoursePage = ({ courseData, pageData }: CoursePageProps): JSX.Element => {
  const [loading, setLoading] = React.useState(true);
  const authUser = useAuthUser();
  const user = useUser();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || user.userDetails === null) return <div>Loading...</div>;
  const userDetails = user.userDetails as UserDetails;
  const studentRoutes: Routes[] = [
    {
      name: "Dashboard",
      route: "/",
      icon: <HomeIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...courseData.pages.map((x) => {
      return {
        name: x.title,
        route: `/course/${courseData._id}/${x._id}`,
      };
    }),
  ];

  return (
    <>
      <Head>
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} routes={studentRoutes} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between pt-5">
            <span className="ml-4">{pageData.title}</span>
          </h1>

          {/* First list out all the base resources */}
          <div className="bg-gray-400 rounded-xl px-[2.5%] py-[2.5%] mb-5">
            <ResourcesDisplay resources={pageData.resources} />
          </div>

          {/* Then list out all the sections */}
          {pageData.sections.map((section) => {
            return (
              <div key={section._id}>
                <div className="w-full flex flex-col bg-gray-300 rounded-xl px-[2.5%] py-[2.5%] mb-5">
                  <Typography variant="h5" fontWeight="600">
                    {`Section: ${section.title}`}
                  </Typography>
                  <ResourcesDisplay resources={section.resources} />
                </div>
              </div>
            );
          })}
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<CoursePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: CoursePageProps } | { notFound: true }> => {
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

  const { courseID, pageID } = query;

  if (
    courseID === undefined ||
    typeof courseID !== "string" ||
    pageID === undefined ||
    typeof pageID !== "string"
  ) {
    return { notFound: true };
  }

  const [courseDetails, courseDetailsErr] = await getUserCourseDetails(
    await AuthUser.getIdToken(),
    courseID as string,
    "ssr",
  );

  if (courseDetailsErr !== null) {
    console.error(courseDetailsErr);
    // handle error
    return { notFound: true };
  }

  if (courseDetails === null) throw new Error("This shouldn't have happened");
  const page = courseDetails.pages.find((page) => page._id === pageID);
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

export default withAuthUser<CoursePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(CoursePage);
