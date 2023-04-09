/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Head from "next/head";
import { TextField } from "@mui/material";
import { ResourceInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { PageFull } from "models/page.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { getFileDownloadLink } from "util/api/resourceApi";
import initAuth from "util/firebase";

initAuth();

type CourseResourceSearchPageProps = {
  courseData: UserCourseInformation;
  pageList: PageFull[];
};

/**
 * Base page for a course for a student
 * Course data is SSR
 */
const CourseResourceSearchPage = ({
  courseData,
  pageList,
}: CourseResourceSearchPageProps): JSX.Element => {
  console.warn(pageList);
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  return (
    <>
      <Head>
        <title>{`${courseData.code} ${courseData.session}`}</title>
        <meta name="description" content={courseData.description} />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] mt-5">
            <span className="ml-4">Search For Resources</span>
          </h1>
          <div className="flex flex-col pt-3 px-[2%] justify-center">
            <div className="w-full flex justify-end">
              <TextField
                id="search-resource"
                label="Search For Resource"
                variant="outlined"
                sx={{ width: "300px" }}
                // onKeyDown={handleKeyDown}
                // onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchCode(e.target.value)}
              />
            </div>
            <div>here</div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<CourseResourceSearchPageProps> =
  withAuthUserTokenSSR({
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  })(
    async ({
      AuthUser,
      query,
    }): Promise<{ props: CourseResourceSearchPageProps } | { notFound: true }> => {
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

      const { courseId } = query;

      if (courseId === undefined || typeof courseId !== "string") {
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

      const pageList: PageFull[] = [];

      const promiseList = courseDetails.pages.map(async (page) => {
        // Fetch link for resources
        page.resources = await parseResource(page.resources);

        // Now for each section
        for (const section of page.sections) {
          section.resources = await parseResource(section.resources);
        }
        pageList.push(page);
      });

      await Promise.all(promiseList);

      return { props: { courseData: courseDetails, pageList: pageList } };
    },
  );

export default withAuthUser<CourseResourceSearchPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(CourseResourceSearchPage);
