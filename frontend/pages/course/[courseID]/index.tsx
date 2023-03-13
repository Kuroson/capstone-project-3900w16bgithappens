/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { GetServerSideProps } from "next";
import { AuthAction, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { UserDetailsPayload } from "pages";
import { ContentContainer, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import { PROCESS_BACKEND_URL, apiGet } from "util/api";
import initAuth from "util/firebase";
import { CourseGETResponse, CourseInformation, getRoleName } from "util/util";

initAuth();

type StudentCoursePageProps = {
  userDetails: UserDetailsPayload;
  courseInformation: CourseInformation | null;
  courseRoutes: Routes[];
};

const StudentCoursePage = ({
  userDetails,
  courseInformation,
  courseRoutes,
}: StudentCoursePageProps): JSX.Element => {
  console.log(userDetails, courseInformation);
  return (
    <>
      <Head>
        <title>{`${courseInformation?.code} ${courseInformation?.session}`}</title>
        <meta name="description" content={courseInformation?.description} />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={userDetails.firstName}
        lastName={userDetails.lastName}
        role={getRoleName(userDetails.role)}
        avatarURL={userDetails.avatar}
        list={courseRoutes}
        showDashboardRoute
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">Welcome to {courseInformation?.title}</span>
          </h1>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<StudentCoursePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: StudentCoursePageProps } | { notFound: true }> => {
  const [resUserData, errUserData] = await apiGet<any, UserDetailsPayload>(
    `${PROCESS_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  // Fetch User's course data
  const [resCourseData, errCourseData] = await apiGet<any, CourseGETResponse>(
    `${PROCESS_BACKEND_URL}/course`,
    await AuthUser.getIdToken(),
    {},
  );

  if (errUserData !== null || errCourseData !== null) {
    console.error(errUserData ?? errCourseData);
    // handle error
    return {
      props: {
        userDetails: { email: null, firstName: null, lastName: null, role: null, avatar: null },
        courseInformation: null,
        courseRoutes: [],
      },
    };
  }

  if (resUserData === null || resCourseData === null)
    throw new Error("This shouldn't have happened");

  // Validate URL query
  const { courseID } = query;

  const courseInformation: CourseInformation | undefined =
    courseID !== undefined
      ? resCourseData.courses.find((course) => course.courseId === courseID)
      : undefined;

  if (courseInformation === undefined) {
    return { notFound: true };
  }

  const courseRoutes: Routes[] = resCourseData.courses.map((x) => {
    return {
      name: x.code,
      route: `/course/${x.courseId}`,
    };
  });

  return {
    props: {
      userDetails: { ...resUserData },
      courseInformation: courseInformation,
      courseRoutes: courseRoutes,
    },
  };
});

export default withAuthUser<StudentCoursePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(StudentCoursePage);
