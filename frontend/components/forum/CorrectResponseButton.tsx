import React from "react";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import { FullPostInfo } from "models/post.model";
import { FullResponseInfo } from "models/response.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { markCorrectResponse } from "util/api/forumApi";

type CorrectResponseButtonProps = {
  resp: FullResponseInfo;
  setShowedPost: React.Dispatch<React.SetStateAction<FullPostInfo | null>>;
  showedPost: FullPostInfo | null;
};

const CorrectResponseButton = ({
  resp,
  setShowedPost,
  showedPost,
}: CorrectResponseButtonProps): JSX.Element => {
  const authUser = useAuthUser();

  const handleCorrectResponse = async (e: React.SyntheticEvent, response: FullResponseInfo) => {
    e.preventDefault();
    if (showedPost === null) return;

    const [res, err] = await markCorrectResponse(await authUser.getIdToken(), resp._id, "client");
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      return;
    }
    if (res === null) throw new Error("Didn't save the correct state correctly"); // Actual error that should never happen

    // Update global state with new response state
    const newResponses = [
      ...showedPost.responses.filter((x) => x._id !== response._id),
      { ...response, correct: true },
    ];

    setShowedPost({
      ...showedPost,
      responses: newResponses.sort((a, b) => (a.timePosted > b.timePosted ? 1 : -1)),
    });
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Button
        variant="contained"
        onClick={(e) => handleCorrectResponse(e, resp)}
        sx={{ height: "30px", width: "200px" }}
      >
        Correct Answer
      </Button>
    </div>
  );
};

export default CorrectResponseButton;
