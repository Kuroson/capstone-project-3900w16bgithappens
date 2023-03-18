/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import GridViewIcon from "@mui/icons-material/GridView";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Button, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import { CLIENT_BACKEND_URL, apiGet, apiUploadFile } from "util/api";
import initAuth from "util/firebase";
import { Nullable, getRoleName } from "util/util";

initAuth(); // SSR maybe, i think...

type UserDetailsPayload = Nullable<{
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  avatar: string;
}>;

type PageProps = UserDetailsPayload & {
  courseId?: string;
  pageId?: string;
};

type courseInfo = {
  code: string;
  title: string;
  description: string;
  session: string;
  icon: string;
  pages: Array<{ title: string; pageId: string }>;
};
type coursesInfoPayload = courseInfo;

export type Resources = {
  resourceId: string;
  title: string;
  description?: string;
  fileType: string;
  linkToResource: string;
};
export type sections = {
  sectionId: string;
  title: string;
  resources: Resources[];
};

export type pageInfo = {
  title: string;
  courseId: string;
  pageId: string;
  resources: Resources[];
  sections: sections[];
};
type pageInfoPayload = pageInfo;

const course: courseInfo = {
  code: "",
  title: "",
  description: "",
  session: "",
  icon: "",
  pages: [],
};

const page: pageInfo = {
  title: "Week1",
  courseId: "1",
  pageId: "1",
  resources: [],
  sections: [],
};

const FROG_IMAGE_URL =
  "https://i.natgeofe.com/k/8fa25ea4-6409-47fb-b3cc-4af8e0dc9616/red-eyed-tree-frog-on-leaves-3-2_3x2.jpg";

const ResourcesDisplay = ({ resources }: { resources: Array<Resources> }): JSX.Element => {
  return (
    <div className="flex flex-col w-full">
      {resources.map((resource) => {
        return (
          <div key={resource.resourceId} className="w-full mb-5">
            <span className="w-full text-xl font-medium flex flex-col">{`Resource: ${resource.title}`}</span>
            {/* Description */}
            {resource.description ?? (
              <span className="">{`Description: ${resource.description}`}</span>
            )}
            {/* Resource */}
            {resource.linkToResource && (
              <div className="my-5">
                {resource.fileType.includes("image") ? (
                  <div>
                    <img
                      src={
                        resource.linkToResource.length === 0
                          ? FROG_IMAGE_URL
                          : resource.linkToResource
                      }
                      alt={resource.description}
                    />
                  </div>
                ) : (
                  <Button variant="contained" href={resource.linkToResource}>
                    Download File
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SectionPage = ({
  firstName,
  lastName,
  email,
  role,
  avatar,
  courseId,
  pageId,
}: PageProps): JSX.Element => {
  const [courseInfo, setCourseInfo] = useState(course);
  const [pageInfo, setPageInfo] = useState(page);
  const [file, setFile] = useState<File | null>(null);
  const authUser = useAuthUser();
  const router = useRouter();
  const courseRoutes: Routes[] = [
    {
      name: "Home",
      route: `/course/${courseId}`,
      Icon: <GridViewIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
  ];

  const pages = courseInfo.pages.map((page) => ({
    name: page.title,
    route: `/course/${courseId}/${page.pageId}`,
  }));

  // Fetch all the course information
  useEffect(() => {
    const fetchCourseInfo = async () => {
      const [data, err] = await apiGet<any, coursesInfoPayload>(
        `${CLIENT_BACKEND_URL}/course/${courseId}`,
        await authUser.getIdToken(),
        {},
      );

      if (err !== null) {
        console.error(err);
      }

      if (data === null) throw new Error("This shouldn't have happened");

      setCourseInfo(data);
    };

    const fetchPageInfo = async () => {
      const [data, err] = await apiGet<any, pageInfoPayload>(
        `${CLIENT_BACKEND_URL}/page/${courseId}/${pageId}`,
        await authUser.getIdToken(),
        {},
      );

      if (err !== null) {
        console.error(err);
      }

      if (data === null) throw new Error("This shouldn't have happened");

      console.log("Page Info");
      console.log(data); // TODO: remove
      console.log(await authUser.getIdToken());

      setPageInfo(data);
    };

    fetchCourseInfo().catch(console.error);
    fetchPageInfo().catch(console.error);
  }, [authUser, courseId, pageId]);
  // fetch all the section

  return (
    <>
      <Head>
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={firstName}
        lastName={lastName}
        role={getRoleName(1)} // TODO: change back to my Role???
        avatarURL={avatar}
        list={courseRoutes.concat(pages)}
        isCoursePage={true}
        courseId={courseId}
        courseCode={courseInfo.code}
        courseIcon={courseInfo.icon}
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between">
            <span className="ml-4">{pageInfo.title}</span>
          </h1>

          {/* First list out all the base resources */}
          <div className="bg-gray-300 rounded-xl px-[2.5%] py-[2.5%] mb-5">
            {/* <h1 className="text-2xl m-0 p-0">Page Resources</h1> */}
            <ResourcesDisplay resources={pageInfo.resources} />
          </div>

          {/* Then list out all the sections */}
          {pageInfo.sections.map((section) => {
            return (
              <div key={section.sectionId}>
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

export const getServerSideProps: GetServerSideProps<PageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: PageProps }> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, err] = await apiGet<any, UserDetailsPayload>(
    `${CLIENT_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  if (err !== null) {
    console.error(err);
    // handle error
    return {
      props: {
        email: null,
        firstName: null,
        lastName: null,
        role: null,
        avatar: null,
      },
    };
  }

  if (data === null) throw new Error("This shouldn't have happened");
  return {
    props: {
      ...data,
      courseId: query?.courseID as string,
      pageId: query?.pageID as string,
    },
  };
});

export default withAuthUser<PageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(SectionPage);
