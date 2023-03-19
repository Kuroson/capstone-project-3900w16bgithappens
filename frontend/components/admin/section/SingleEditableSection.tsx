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

type SingleEditableSectionProps = {
  section: SectionFull;
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
  pageId: string;
  courseId: string;
};

const SingleEditableSection = ({
  section,
  sections,
  setSections,
  pageId,
  courseId,
}: SingleEditableSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [resources, setResources] = React.useState<ResourceInterface[]>(section.resources);
  const [dynamicTitle, setDynamicTitle] = React.useState(section.title);
  const [editMode, setEditMode] = React.useState(false);

  React.useEffect(() => {
    // If any values change in the upper components, update them here as well
    setResources(section.resources);
    setDynamicTitle(section.title);
  }, [section.resources, sections, section.title]);

  const handleEditClick = async () => {
    if (editMode) {
      if (dynamicTitle.length === 0) {
        toast.error("Section title cannot be empty");
        return;
      }

      const payload: UpdateSectionPayloadRequest = {
        sectionId: section._id,
        title: dynamicTitle,
        courseId: courseId,
        pageId: pageId,
      };

      const [res, err] = await updateSection(await authUser.getIdToken(), payload, "client");

      if (err !== null) {
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error("Could not update section title");
        }
        return;
      }
      if (res === null) throw new Error("Shouldn't have happened");
    }
    setEditMode(!editMode);
  };
  const handleRemoveClick = async () => {
    const payload: DeleteSectionPayloadRequest = {
      courseId: courseId,
      pageId: pageId,
      sectionId: section._id,
    };

    const [res, err] = await deleteSection(await authUser.getIdToken(), payload, "client");
    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not delete section");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't have happened");

    // update
    setSections(sections.filter((s) => s._id !== section._id));
    toast.success("Deleted section");
  };

  return (
    <div key={section._id}>
      <div className="w-full flex flex-col bg-gray-300 rounded-xl px-[2.5%] py-[2.5%] mb-5">
        <div className="flex flex-row">
          {editMode ? (
            <TextField
              id="Section Title"
              label="Section Title"
              variant="outlined"
              value={dynamicTitle}
              onChange={(e) => setDynamicTitle(e.target.value)}
            />
          ) : (
            <TitleWithIcon text={`Section: ${dynamicTitle}`}>
              <ImportContacts color="primary" />
            </TitleWithIcon>
          )}
          <div className="flex h-full items-center justify-center">
            <EditPanelButtons
              editMode={editMode}
              handleEditClick={handleEditClick}
              handleRemoveClick={handleRemoveClick}
            />
          </div>
        </div>
        <ResourcesSection
          resources={resources}
          setResources={setResources}
          pageId={pageId}
          courseId={courseId}
          sectionId={section._id}
        />
      </div>
    </div>
  );
};

export default SingleEditableSection;
