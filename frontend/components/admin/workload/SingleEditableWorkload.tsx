import React from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { Button, TextField } from "@mui/material";
import { FullWeekInterface } from "models/week.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import {
  RemoveResourcePayloadRequest,
  UpdatePagePayloadRequest,
  removeResource,
  updatePageResource,
  uploadResourceFile,
} from "util/api/pageApi";
import {
  DeleteWeekPayloadRequest,
  UpdateWeekPayloadRequest,
  deleteWeek,
  updateWeek,
} from "util/api/workloadApi";
import EditPanelButtons from "../EditPanelButtons";
import TasksSection from "../task/TasksSection";

type SingleEditableWeekProps = {
  week: FullWeekInterface;
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  courseId: string;
  weeks: FullWeekInterface[];
};

/**
 * Component for a single Week.
 * Has an edit option
 */
const SingleEditableWeekSection = ({
  weeks,
  setWeeks,
  courseId,
  week,
}: SingleEditableWeekProps): JSX.Element => {
  const authUser = useAuthUser();

  const [editMode, setEditMode] = React.useState(false);
  const [title, setTitle] = React.useState(week.title);
  const [description, setDescription] = React.useState(week.description);
  const [tasks, setTasks] = React.useState(week.tasks);

  const handleRemoveClick = async () => {
    // Remove
    const payload: DeleteWeekPayloadRequest = {
      courseId: courseId,
      weekId: week._id,
    };

    const [res, err] = await deleteWeek(await authUser.getIdToken(), payload, "client");

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not remove week overview. Please try again later.");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");

    // Update UI
    setWeeks(weeks.filter((w) => w._id !== week._id));
    toast.success("Week removed");
  };

  const handleEditClick = async () => {
    if (editMode) {
      // Was already in edit mode, need to save changes now
      // Save the text

      const updatedWeek: UpdateWeekPayloadRequest = {
        weekId: week._id,
        title: week.title,
        description: week.description,
      };

      const [res, err] = await updateWeek(await authUser.getIdToken(), updatedWeek, "client");

      if (err !== null) {
        // Error exists
        console.error(err);
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error("Could not save changes. Please try again later.");
        }
        return;
      }
      if (res === null) throw new Error("Shouldn't happen");
      toast.success("Week workload saved");
    }
    setEditMode(!editMode);
  };

  // Show edit interface
  if (editMode) {
    return (
      <div className="w-full pt-5" data-cy="current-edit">
        <div className="flex flex-col w-full">
          <div className="w-full pb-5">
            <TextField
              id="WeekWorkloadTitle"
              label="Week Workload Title"
              variant="outlined"
              sx={{ maxWidth: "500px" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <TextField
            id="WorkloadDescription"
            label="Workload Description (Optional)"
            variant="outlined"
            multiline
            rows={5}
            sx={{ maxWidth: "1000px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <EditPanelButtons
            editMode={editMode}
            handleEditClick={handleEditClick}
            handleRemoveClick={handleRemoveClick}
          />
        </div>
      </div>
    );
  }

  // Show normal interface
  return (
    <div className="w-full pt-5" data-cy={`section-${title}`}>
      <span className="w-full text-xl font-medium flex flex-col">{title}</span>
      {/* Description */}
      {description !== undefined && <p>{description}</p>}
      {/* Resource */}
      <div>
        <TasksSection weekId={week._id} tasks={tasks} setTasks={setTasks} />
      </div>
      <div data-cy="edit-button-section">
        <EditPanelButtons
          editMode={editMode}
          handleEditClick={handleEditClick}
          handleRemoveClick={handleRemoveClick}
        />
      </div>
    </div>
  );
};

export default SingleEditableWeekSection;
