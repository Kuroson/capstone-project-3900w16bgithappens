import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import EditIcon from "@mui/icons-material/Edit";
import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Button, IconButton, TextField } from "@mui/material";
import { ResourceInterface } from "models";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getFileDownloadLink } from "util/api/ResourceApi";
import { CLIENT_BACKEND_URL, apiDelete, apiGet } from "util/api/api";
import { getUserCourseDetails } from "util/api/courseApi";
import {
  RemoveResourcePayloadRequest,
  UpdatePagePayloadRequest,
  UploadFilePayloadResponse,
  addNewResource,
  deletePage,
  removeResource,
  updatePageResource,
  uploadResourceFile,
} from "util/api/pageApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import { Nullable, getRoleName } from "util/util";

type EditPanelButtonsProps = {
  editMode: boolean;
  handleEditClick: () => Promise<void>;
  handleRemoveClick: () => Promise<void>;
};

/**
 * Edit and delete buttons
 */
const EditPanelButtons = ({
  handleEditClick,
  editMode,
  handleRemoveClick,
}: EditPanelButtonsProps): JSX.Element => {
  return (
    <div className="">
      <IconButton
        color="primary"
        aria-label="edit"
        component="label"
        onClick={handleEditClick}
        // disabled={editResource && title === ""}
      >
        {editMode ? <DoneIcon /> : <EditIcon />}
      </IconButton>
      <IconButton color="error" aria-label="delete" component="label" onClick={handleRemoveClick}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
};

export default EditPanelButtons;
