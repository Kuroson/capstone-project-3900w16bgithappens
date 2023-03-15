import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { IconButton, TextField } from "@mui/material";
import TitleWithIcon from "components/common/TitleWithIcon";
import { Feature } from "./ShowOrEditPage";

const ShowOrEditSectionT: React.FC<{
  title: string;
  sectionId: string;
  handleEditTitle: (newTitle: string, sectionId: string, feature: Feature) => void;
}> = ({ title, sectionId, handleEditTitle }) => {
  const [sectionTitle, setSectionTitle] = useState(title);
  const [editTitle, setEditTitle] = useState(false);

  const handleClickEditTitle = () => {
    // click tick
    if (editTitle && title !== sectionTitle) {
      // change title in whole data
      handleEditTitle(sectionTitle, sectionId, Feature.EditSectionTitle);
    }

    setEditTitle((prev) => !prev);
  };

  const handleDeleteSection = () => {
    handleEditTitle(sectionTitle, sectionId, Feature.RemoveSection);
  };

  return (
    <div className="flex gap-2 mt-3">
      {editTitle ? (
        <TextField
          id="Section Title"
          label="Section Title"
          variant="outlined"
          sx={{ maxWidth: "500px" }}
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
        />
      ) : (
        <TitleWithIcon text={title}>
          <ImportContactsIcon color="primary" />
        </TitleWithIcon>
      )}

      <div>
        <IconButton
          color="primary"
          aria-label="edit"
          component="label"
          onClick={handleClickEditTitle}
        >
          {editTitle ? <DoneIcon /> : <EditIcon />}
        </IconButton>
        <IconButton
          color="error"
          aria-label="delete"
          component="label"
          onClick={handleDeleteSection}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default ShowOrEditSectionT;
