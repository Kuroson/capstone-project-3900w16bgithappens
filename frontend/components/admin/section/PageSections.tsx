import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PageviewRounded } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import EditIcon from "@mui/icons-material/Edit";
import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import ImportContacts from "@mui/icons-material/ImportContacts";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Button, IconButton, TextField } from "@mui/material";
import { ResourceInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { PageFull } from "models/page.model";
import { SectionFull } from "models/section.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { Logger } from "sass";
import JSXStyle from "styled-jsx/style";
import {
  AddNewResourceSection,
  AddNewSection,
  AdminNavBar,
  ContentContainer,
  ResourcesSection,
  SingleEditableResource,
} from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import ShowOrEditPage from "components/SectionPage/ShowOrEditPage";
import EditPanelButtons from "components/admin/EditPanelButtons";
import TitleWithIcon from "components/common/TitleWithIcon";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getFileDownloadLink } from "util/api/ResourceApi";
import { CLIENT_BACKEND_URL, apiDelete, apiGet } from "util/api/api";
import { getUserCourseDetails } from "util/api/courseApi";
import {
  AddSectionPayloadRequest,
  DeleteSectionPayloadRequest,
  RemoveResourcePayloadRequest,
  UpdatePagePayloadRequest,
  UpdateSectionPayloadRequest,
  UploadFilePayloadResponse,
  addNewResource,
  createSection,
  deletePage,
  deleteSection,
  removeResource,
  updatePageResource,
  updateSection,
  uploadResourceFile,
} from "util/api/pageApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import { Nullable, getRoleName } from "util/util";
import SingleEditableSection from "./SingleEditableSection";

type PageSectionsProps = {
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
  pageId: string;
  courseId: string;
};

const PageSections = ({
  sections,
  setSections,
  pageId,
  courseId,
}: PageSectionsProps): JSX.Element => {
  return (
    <div>
      {sections.map((section) => {
        return (
          <SingleEditableSection
            key={section._id}
            section={section}
            sections={sections}
            setSections={setSections}
            pageId={pageId}
            courseId={courseId}
          />
        );
      })}
    </div>
  );
};

export default PageSections;
