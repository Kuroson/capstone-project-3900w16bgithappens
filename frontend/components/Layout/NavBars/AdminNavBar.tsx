import LogoutIcon from "@mui/icons-material/Logout";
import {
  Button,
} from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { getRoleText, UserDetails } from "models/user.model";
import NavBar, { Routes } from "./NavBar";
import { useUser } from "util/UserContext";
import { UserCourseInformation } from "models/course.model";

type AdminNavBar = {
  userDetails: UserDetails;
  routes: Routes[];
  courseData?: UserCourseInformation;
}

/**
 * User avatar
 */
const UserDetails = ({ first_name, last_name, role, avatar }: UserDetails): JSX.Element => {
  return (
    <div className="mt-5 flex flex-row justify-center">
      <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
        <span className="text-2xl font-bold">
          {(first_name?.charAt(0) ?? "") + (last_name?.charAt(0) ?? "")}
        </span>
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full">{`${first_name} ${last_name}`}</span>
        <span className="text-start w-full">{getRoleText(role)}</span>
      </div>
    </div>
  );
};

type CourseDetailsProps ={
  code: string
}

const CourseDetails = ({ code }: CourseDetailsProps): JSX.Element => {
  return (
    <div className="mt-5 flex flex-row justify-center">
      <div className="w-[50px] h-[50px] bg-orange-500 rounded-full flex justify-center items-center">
        <span className="text-3xl font-bold">
          {code.charAt(0) ?? ""}
        </span>
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full text-2xl">{code}</span>
      </div>
    </div>
  );
};



/**
 * @param param0
 * @returns
 */
export default function AdminNavBar({
  userDetails,
  routes,
  courseData
}: AdminNavBar): JSX.Element {
  const user = useUser();

  const handleOnClick = async () => {
    signOut(getAuth());
    if (user.setUserDetails !== null) {
      user.setUserDetails(null);
    }
  };

  return (
    <div className="w-full">
      <div
        className="h-full fixed top-[0] left-[0] z-10 w-[13rem]"
        // 13rem matches Layout.module.scss
      >
        <div className="w-full flex flex-col justify-between h-[calc(100%_-_4rem)]">
          <div>
            {/* Top */}
            {courseData === undefined && <UserDetails {...userDetails} />}
            {courseData !== undefined && <CourseDetails code={courseData?.code ?? ""} />}
            <NavBar
              routes={routes}
              role={getRoleText(userDetails.role)}
              isCoursePage={false}
            />
          </div>
          <div className="flex justify-center items-center mb-5">
            {/* Bottom */}
            <Button variant="outlined" onClick={handleOnClick} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
