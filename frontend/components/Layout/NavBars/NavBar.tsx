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
import { RoleText } from "models/user.model";
import { useAuthUser } from "next-firebase-auth";
import TitleWithIcon from "components/common/TitleWithIcon";
import { HttpException } from "util/HttpExceptions";
import { CLIENT_BACKEND_URL, apiGet, apiPost } from "util/api/api";
import { Nullable } from "util/util";

export type Routes = {
  name: string;
  route: string;
  icon?: React.ReactNode;
  hasLine?: boolean;
};

type NavBarProps = {
  routes: Routes[];
  isCoursePage: boolean;
  role: RoleText;
};

const NavBar = ({ routes, isCoursePage, role }: NavBarProps): JSX.Element => {
  return (
    <div className="w-full flex flex-col items-center justify-center mt-4 pl-2">
      {routes.map(({ name, route, icon, hasLine }, index) => {
        return (
          <div key={`nav-index-${index}`} className="w-full flex py-2 flex-col">
            {/* TODO: href doesn't reload page and therefore doesn't call useEffect */}
            <Link href={route}>
              <TitleWithIcon text={name}>{icon}</TitleWithIcon>
            </Link>
            {(hasLine ?? false) && <Divider light sx={{ width: "100%", marginTop: "10px" }} />}
          </div>
        );
      })}
    </div>
  );
};

export default NavBar;
