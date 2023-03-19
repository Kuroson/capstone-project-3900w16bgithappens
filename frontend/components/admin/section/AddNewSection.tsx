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
  AdminNavBar,
  ContentContainer,
  ResourcesSection,
  SingleEditableResource,
} from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
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

type AddNewSectionProps = {
  courseId: string;
  pageId: string;
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
};

const AddNewSection = ({
  courseId,
  pageId,
  sections,
  setSections,
}: AddNewSectionProps): JSX.Element => {
  const authUser = useAuthUser();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");

  React.useEffect(() => {
    setOpen(false);
    setTitle("");
  }, [courseId, pageId]);

  const handleCloseForm = async () => {
    setOpen(false);
    setTitle("");
  };

  const handleNewSection = async () => {
    const newSection: AddSectionPayloadRequest = {
      title: title,
      courseId: courseId,
      pageId: pageId,
      sectionId: null,
    };

    const [res, err] = await createSection(await authUser.getIdToken(), newSection, "client");

    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not add a new section");
      }
      return;
    }
    if (res === null) throw new Error("Should not happen");
    const newSectionToAdd: SectionFull = {
      _id: res.sectionId,
      title: title,
      resources: [],
    };

    setSections([...sections, newSectionToAdd]);
    toast.success("Added a new section");
    setTitle("");
    // setSections((prev) => [...prev, newSection]);
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="pb-4">
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New Section
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-4 flex flex-col">
      <div className="pb-4">
        <TextField
          id="Resource Title"
          label="Resource Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-[300px] max-w-[500px]"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outlined" color="error" onClick={handleCloseForm}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleNewSection} disabled={title === ""}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default AddNewSection;
