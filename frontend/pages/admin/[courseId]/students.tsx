/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import GridViewIcon from "@mui/icons-material/GridView";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { UserDetailsPayload } from "pages";
import { ContentContainer, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import { PROCESS_BACKEND_URL, apiGet } from "util/api";
import initAuth from "util/firebase";
import { CourseInformationFull, Nullable, getRoleName } from "util/util";

initAuth(); // SSR maybe, i think...

type AddStudentPageProps = {
  userDetails: UserDetailsPayload;
  courseInformation: CourseInformationFull | null;
  courseRoutes: Routes[];
};

const AddStudentsPage = ({
  userDetails,
  courseInformation,
  courseRoutes,
}: AddStudentPageProps): JSX.Element => {
  return (
    <>
      <Head>
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={userDetails.firstName}
        lastName={userDetails.lastName}
        role={getRoleName(userDetails.role)}
        avatarURL={userDetails.avatar}
        list={courseRoutes}
        isCoursePage={true}
        courseCode={courseInformation?.code}
        courseIcon={courseInformation?.icon}
        courseId={courseInformation?.courseId}
        showDashboardRoute
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">stuff</div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AddStudentPageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AddStudentPageProps } | { notFound: true }> => {
  const { courseId } = query;

  const [resUserData, errUserData] = await apiGet<any, UserDetailsPayload>(
    `${PROCESS_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  // Fetch Course Specific Information
  const [resCourseInformation, errCourseInformation] = await apiGet<any, CourseInformationFull>(
    `${PROCESS_BACKEND_URL}/course/${courseId}`,
    await AuthUser.getIdToken(),
    {},
  );

  if (errUserData !== null || errCourseInformation !== null) {
    console.error(errUserData ?? errCourseInformation);
    // handle error
    return { notFound: true };
  }

  if (resUserData === null || resCourseInformation === null)
    throw new Error("This shouldn't have happened");

  if (resUserData === null) throw new Error("This shouldn't have happened");

  const courseRoutes: Routes[] = resCourseInformation.pages.map((x) => {
    return {
      name: x.title,
      route: `/course/${courseId}/${x.pageId}`,
    };
  });

  return {
    props: {
      userDetails: { ...resUserData },
      courseInformation: resCourseInformation,
      courseRoutes: courseRoutes,
    },
  };
});

export default withAuthUser<AddStudentPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(AddStudentsPage);
