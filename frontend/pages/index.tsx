/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { TextField } from "@mui/material";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Footer, LeftSideBar, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import CourseCard from "components/common/CourseCard";
import { CLIENT_BACKEND_URL, apiGet } from "util/api/api";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import { CourseGETResponse, Nullable, getCourseURL, getRoleName } from "util/util";

initAuth(); // SSR maybe, i think...

export type Course = {
  courseId: string;
  code: string;
  title: string;
  description: string;
  session: string;
  icon: string;
};

type HomePageProps = {
  userDetails: UserDetails;
  courseRoutes: Routes[];
};

const HomePage = ({ userDetails }: HomePageProps): JSX.Element => {
  const authUser = useAuthUser();
  // console.log(authUser);
  console.log(userDetails);

  const studentRoutes: Routes[] = [
    { name: "Dashboard", route: "/", Icon: <HomeIcon fontSize="large" color="primary" /> },
  ];

  const allCourses = userDetails.enrolments;
  const [showedCourses, setShowedCourses] = useState(userDetails.enrolments);
  const [code, setCode] = useState("");

  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (allCourses != null) {
        setShowedCourses(allCourses.filter((course) => course.code.includes(code)));
      }
    }
  };

  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={userDetails.first_name}
        lastName={userDetails.last_name}
        role={getRoleName(userDetails.role)}
        avatarURL={userDetails.avatar}
        list={studentRoutes} //Only shows dashboard as per discussion
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">
              Welcome, {`${userDetails.first_name} ${userDetails.last_name}`}
            </span>
          </h1>
          <div className="flex justify-between mx-6">
            <h2>Course Overview</h2>
            <TextField
              id="search course"
              label="Search Course Code"
              variant="outlined"
              sx={{ width: "300px" }}
              onKeyDown={handleKeyDown}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap w-full mx-3">
            {showedCourses?.map((x, index) => {
              return <CourseCard key={index} course={x} href={`/course/${x._id}`} />;
            })}
          </div>
        </div>
      </ContentContainer>
      {/* <Footer /> */}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }): Promise<{ props: HomePageProps }> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const [resUserData, errUserData] = await getUserDetails(
    await AuthUser.getIdToken(),
    AuthUser.email ?? "bad",
    "ssr",
  );

  // // Fetch User's course data
  // const [resCourseData, errCourseData] = await apiGet<any, CourseGETResponse>(
  //   `${CLIENT_BACKEND_URL}/course`,
  //   await AuthUser.getIdToken(),
  //   {},
  // );

  const errCourseData = null;
  const resCourseData = { courses: [] };

  if (errUserData !== null || errCourseData !== null) {
    console.error(errUserData ?? errCourseData);
    // handle error
    return {
      props: {
        userDetails: {
          email: null,
          firstName: null,
          lastName: null,
          role: null,
          avatar: null,
          coursesEnrolled: null,
        },
        courseRoutes: [],
      },
    };
  }

  if (errUserData !== null || errCourseData !== null) {
    console.error(errUserData ?? errCourseData);
    // handle error
    return {
      props: {
        userDetails: {
          email: null,
          firstName: null,
          lastName: null,
          role: null,
          avatar: null,
          coursesEnrolled: null,
        },
        courseRoutes: [],
      },
    };
  }

  if (resUserData === null || resCourseData === null)
    throw new Error("This shouldn't have happened");

  const courseRoutes: Routes[] = resCourseData.courses.map((x: any) => {
    return {
      name: x.code,
      route: `/course/${x.courseId}`,
    };
  });

  return {
    props: {
      userDetails: resUserData,
      courseRoutes: courseRoutes,
    },
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(HomePage);
