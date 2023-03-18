import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/router";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Avatar,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { useAuthUser } from "next-firebase-auth";
import TitleWithIcon from "components/common/TitleWithIcon";
import { HttpException } from "util/HttpExceptions";
import { CLIENT_BACKEND_URL, apiGet, apiPost } from "util/api/api";
import { Nullable } from "util/util";
import { getRoleText, UserDetails } from "models/user.model";
import NavBar, { Routes } from "./NavBar";

type SideNavBarProps = {
  userDetails: UserDetails;
  routes: Routes[];
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


/**
 * @param param0
 * @returns
 */
export default function StudentNavBar({
  userDetails,
  routes
}: SideNavBarProps): JSX.Element {
  const handleOnClick = async () => {
    signOut(getAuth());
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
            <UserDetails {...userDetails} />
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
