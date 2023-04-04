import React from "react";
import Link from "next/link";
import { Avatar } from "@mui/material";
import { BasicPostInfo } from "models/post.model";
import { UserDetails } from "models/user.model";
import { useUser } from "util/UserContext";
import UserDetailsSection from "../Layout/NavBars/UserDetailSection";

type ForumPostCardProps = {
  post: BasicPostInfo | null;
  datePosted: string;
};

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, datePosted }): JSX.Element => {
  if (post === null) return <></>;
  else if (post.title == "empty") return <></>;
  else
    return (
      <div className="flex flex-col rounded-lg p-5 my-2 mx-5 w-[600px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="mt-5 flex flex-row justify-center">
              <div className="w-[40px] h-[40px] bg-orange-500 rounded-full flex justify-center items-center">
                <span className="text-l font-bold">
                  {(post.poster.first_name?.charAt(0) ?? "") +
                    (post.poster.last_name?.charAt(0) ?? "")}
                </span>
              </div>
              <div className="flex flex-col pl-2 justify-center items-center">
                <span className="text-start w-full">{`${post.poster.first_name} ${post.poster.last_name}`}</span>
                <span>{datePosted}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xl font-bold pt-2">{post.title}</div>
        <p className="mh-[150px] overflow-hidden pb-2 pt-2">{post.question}</p>
        <img src={post.image}></img>
      </div>
    );
};

export default ForumPostCard;
