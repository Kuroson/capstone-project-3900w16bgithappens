import React from "react";
import { toast } from "react-toastify";
import YouTube from "react-youtube";
import Head from "next/head";
import { LoadingButton } from "@mui/lab";
import { Button, TextField } from "@mui/material";
import { UserCourseInformation } from "models/course.model";
import { MessageInterface } from "models/message.model";
import { OnlineClassFull } from "models/onlineClass.model";
import { UserDetails } from "models/user.model";
import moment from "moment";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import {
  AdminNavBar,
  ChatSection,
  ContentContainer,
  EditOnlineClassSection,
  Loading,
} from "components";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { endOnlineClass, sendOnlineClassMessage, startOnlineClass } from "util/api/onlineClassApi";
import { getOnlineClassDetails } from "util/api/onlineClassApi";
import initAuth from "util/firebase";
import { youtubeURLParser } from "util/util";

initAuth(); // SSR maybe, i think...

type OnlineClassPageProps = {
  courseData: UserCourseInformation;
  onlineClassData: OnlineClassFull;
};

type LeftColumnProps = {
  dynamicOnlineClass: OnlineClassFull;
  setDynamicOnlineClass: React.Dispatch<React.SetStateAction<OnlineClassFull>>;
};

const LeftColumn = ({
  dynamicOnlineClass,
  setDynamicOnlineClass,
}: LeftColumnProps): JSX.Element => {
  const authUser = useAuthUser();
  const [runningLoading, setRunningLoading] = React.useState(false);
  const [editMode, setEditMode] = React.useState(true);

  React.useEffect(() => {
    if (editMode) {
      // On page change, set the edit mode to false
      setEditMode(false);
    }
  }, [dynamicOnlineClass, editMode]);

  const videoId = youtubeURLParser(dynamicOnlineClass.linkToClass);

  const opts = {
    height: "400px",
    width: "100%",
  };

  const handleStartClass = async () => {
    setRunningLoading(true);
    const [res, err] = await startOnlineClass(
      await authUser.getIdToken(),
      dynamicOnlineClass._id,
      "client",
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setRunningLoading(false);
      return;
    }
    if (res === null) throw new Error("Res should not have been null");
    setRunningLoading(false);
    setDynamicOnlineClass({ ...dynamicOnlineClass, running: true });
    toast.success(res.message);
  };

  const handleEndClass = async () => {
    setRunningLoading(true);
    const [res, err] = await endOnlineClass(
      await authUser.getIdToken(),
      dynamicOnlineClass._id,
      "client",
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setRunningLoading(false);
      return;
    }
    if (res === null) throw new Error("Res should not have been null");
    setRunningLoading(false);
    setDynamicOnlineClass({ ...dynamicOnlineClass, running: false });
    toast.success(res.message);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center px-[5%]">
      {editMode ? (
        <EditOnlineClassSection
          dynamicOnlineClass={dynamicOnlineClass}
          setDynamicOnlineClass={setDynamicOnlineClass}
          setEditMode={setEditMode}
        />
      ) : (
        <>
          <h1 className="text-5xl text-center">{dynamicOnlineClass.title}</h1>
          <p className="w-full text-center text-xl pt-3">{dynamicOnlineClass.description}</p>
          <p className="w-full text-center text-xl pt-3">
            {moment.unix(dynamicOnlineClass.startTime).format("DD/MM/YYYY hh:mm A")}
          </p>
          <div className="w-full h-[400px] pt-3">
            <YouTube videoId={videoId !== false ? videoId : ""} opts={opts} />
          </div>
          <div className="w-full pt-6 flex flex-row justify-center items-center">
            <LoadingButton
              variant="contained"
              className="mx-5"
              disabled={dynamicOnlineClass.running}
              onClick={handleStartClass}
              loading={runningLoading && !dynamicOnlineClass.running}
            >
              Start Class
            </LoadingButton>
            <LoadingButton
              variant="contained"
              className="mx-5"
              disabled={!dynamicOnlineClass.running}
              onClick={handleEndClass}
              loading={runningLoading && dynamicOnlineClass.running}
            >
              End Class
            </LoadingButton>
          </div>
          <div className="pt-5">
            <Button variant="contained" onClick={() => setEditMode(true)}>
              Edit Online Class
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

type RightColumnProps = {
  dynamicOnlineClass: OnlineClassFull;
};

const RightColumn = ({ dynamicOnlineClass }: RightColumnProps): JSX.Element => {
  return <ChatSection dynamicOnlineClass={dynamicOnlineClass} />;
};

const OnlineClassPage = ({ courseData, onlineClassData }: OnlineClassPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  // Still need to fetch the chat messages for the online class data
  const [dynamicOnlineClass, setDynamicOnlineClass] = React.useState(onlineClassData);

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
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%] pt-5 h-full">
          <div className="flex flex-row h-full">
            {/* Left col */}
            <div className="w-full h-full">
              <LeftColumn
                dynamicOnlineClass={dynamicOnlineClass}
                setDynamicOnlineClass={setDynamicOnlineClass}
              />
            </div>
            {/* Right col */}
            <div className="w-full h-full">
              <RightColumn dynamicOnlineClass={dynamicOnlineClass} />
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<OnlineClassPageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: OnlineClassPageProps } | { notFound: true }> => {
  const { courseId, onlineClass } = query;

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

  const onlineClassData = courseDetails.onlineClasses.find((x) => x._id === onlineClass) as
    | OnlineClassFull
    | undefined;

  if (onlineClassData === undefined) return { notFound: true };

  onlineClassData.chatMessages = [];

  return { props: { courseData: courseDetails, onlineClassData: onlineClassData } };
});

export default withAuthUser<OnlineClassPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(OnlineClassPage);
