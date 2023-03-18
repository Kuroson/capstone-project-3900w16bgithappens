import React, { useEffect, useState } from "react";
import { Button, Divider } from "@mui/material";
import { ResourceInterface, SectionInterface } from "models";
import { PageFull } from "models/page.model";
import { SectionFull } from "models/section.model";
import { AuthUserContext } from "next-firebase-auth";
import ShowOrEditResource from "components/common/ShowOrEditResource";
import { CLIENT_BACKEND_URL, apiDelete, apiPost, apiPut } from "util/api/api";
import AddResource from "./AddResource";
import AddSection from "./AddSection";
import ShowOrEditSectionT from "./ShowOrEditSectionT";

export enum Feature {
  EditSectionResource,
  EditResourceOut,
  RemoveSection,
  RemoveSectionResource,
  RemoveResourceOut,
  EditSectionTitle,
  AddResourceOut,
  AddSection,
  AddSectionResource,
}

type ShowOrEditPageProps = {
  pageData: PageFull;
  setPageData: React.Dispatch<React.SetStateAction<PageFull>>;
  courseId: string;
  authUser: AuthUserContext;
};

const ShowOrEditPage: React.FC<ShowOrEditPageProps> = ({
  pageData,
  setPageData,
  courseId,
  authUser,
}): JSX.Element => {
  const RESOURCE_URL = `${CLIENT_BACKEND_URL}/page/${courseId}/${pageData._id}/resource`;
  const SECTION_URL = `${CLIENT_BACKEND_URL}/page/${courseId}/${pageData._id}/section`;

  // edit and remove each resource outside and inside of sections
  const handleEditResource = async (
    resource: ResourceInterface,
    feature: Feature,
    sectionId?: string,
  ): Promise<void> => {
    // change materials showing on the page
    setPageData((prev) => {
      const copy = { ...prev };
      if (feature === Feature.EditResourceOut || feature === Feature.RemoveResourceOut) {
        const oldResourceIndex = copy.resources.findIndex((re) => re._id === resource._id);
        if (feature === Feature.EditResourceOut) {
          // edit outside resource
          copy.resources.splice(oldResourceIndex, 1, resource);
        } else {
          // remove outside resource
          copy.resources.splice(oldResourceIndex, 1);
        }
      } else if (
        feature === Feature.EditSectionResource ||
        feature === Feature.RemoveSectionResource
      ) {
        // edit section resource
        const sectionIndex = copy.sections.findIndex((se) => se._id === sectionId);
        const section = copy.sections[sectionIndex];
        const oldResourceIndex = section.resources.findIndex((re) => re._id === resource._id);
        if (feature === Feature.EditSectionResource) {
          section.resources.splice(oldResourceIndex, 1, resource);
          copy.sections[sectionIndex] = section;
        } else {
          section.resources.splice(oldResourceIndex, 1);
          copy.sections[sectionIndex] = section;
        }
      }
      return copy;
    });

    // update in backend
    if (feature === Feature.EditResourceOut) {
      const body = {
        courseId: courseId,
        pageId: pageData._id,
        title: resource.title,
        description: resource.description,
        resourceId: resource._id,
      };
      await sendToBackend(body, RESOURCE_URL);
    } else if (feature === Feature.EditSectionResource) {
      const body = {
        courseId: courseId,
        pageId: pageData._id,
        title: resource?.title,
        description: resource?.description,
        sectionId: sectionId,
        resourceId: resource._id,
      };
      await sendToBackend(body, RESOURCE_URL);
    } else if (feature === Feature.RemoveResourceOut) {
      const body = {
        courseId: courseId,
        pageId: pageData._id,
        resourceId: resource._id,
      };
      await deleteInBackend(body, RESOURCE_URL);
    } else {
      // remove resource inside section
      const body = {
        courseId: courseId,
        pageId: pageData._id,
        sectionId: sectionId,
        resourceId: resource._id,
      };
      await deleteInBackend(body, RESOURCE_URL);
    }
  };

  // edit title of Section and remove section
  const handleEditTitle = async (newTitle: string, sectionId: string, feature: Feature) => {
    // change materials showing on the page
    setPageData((prev) => {
      const copy = { ...prev };
      const getIdx = copy.sections.findIndex((se) => se._id === sectionId);
      if (feature === Feature.EditSectionTitle) {
        // change section title
        copy.sections[getIdx].title = newTitle;
      } else {
        // remove section
        copy.sections.splice(getIdx, 1);
      }

      return copy;
    });

    // send to backend
    if (feature === Feature.EditSectionTitle) {
      const body = {
        sectionId: sectionId,
        courseId: courseId,
        pageId: pageData._id,
        title: newTitle,
      };
      await sendToBackend(body, SECTION_URL);
    } else {
      // delete section
      const body = {
        courseId: courseId,
        pageId: pageData._id,
        sectionId: sectionId,
      };
      await deleteInBackend(body, SECTION_URL);
    }
  };

  // Send update and add new resource/section to backend
  const sendToBackend = async (body: any, url: string) => {
    const [data, err] = await apiPut<any, { resourceId: string }>(
      url,
      await authUser.getIdToken(),
      body,
    );

    if (err !== null) {
      console.error(err);
    }

    if (data === null) throw new Error("This shouldn't have happened");
    return data.resourceId;
  };

  // delete Resource/section in backend
  const deleteInBackend = async (body: any, url: string) => {
    const [data, err] = await apiDelete<any, { sectionId: string }>(
      url,
      await authUser.getIdToken(),
      body,
    );

    if (err !== null) {
      console.error(err);
    }
  };

  // Add Resource outside or in section
  const handleAddResource = async (
    feature: Feature,
    newResource?: ResourceInterface,
    newSection?: SectionFull,
    sectionId?: string,
  ) => {
    if (feature === Feature.AddResourceOut) {
      const resourseOut = {
        courseId: courseId,
        pageId: pageData._id,
        title: newResource?.title,
        description: newResource?.description,
      };
      if (newResource) {
        newResource._id = await sendToBackend(resourseOut, RESOURCE_URL);
      }
    } else if (feature === Feature.AddSectionResource) {
      const sectionResourse = {
        courseId: courseId,
        pageId: pageData._id,
        title: newResource?.title,
        description: newResource?.description,
        sectionId: sectionId,
      };
      if (newResource) {
        newResource._id = await sendToBackend(sectionResourse, RESOURCE_URL);
      }
    } else {
      // add section
      const sectionBody = {
        courseId: courseId,
        pageId: pageData._id,
        title: newSection?.title,
      };

      if (newSection) {
        newSection._id = await sendToBackend(sectionBody, SECTION_URL);
      }
    }

    setPageData((prev) => {
      const copy = { ...prev };
      if (feature === Feature.AddResourceOut && newResource) {
        copy.resources.push(newResource);
      } else if (feature === Feature.AddSection && newSection) {
        copy.sections.push(newSection);
      } else if (feature === Feature.AddSectionResource && newResource) {
        const idx = copy.sections.findIndex((se) => se._id === sectionId);
        copy.sections[idx].resources.push(newResource);
      }
      return copy;
    });
  };

  return (
    <>
      {/* Resources outside*/}
      <div className="flex flex-col mb-7">
        {pageData.resources.map((resource, index) => (
          <ShowOrEditResource
            resource={resource}
            key={`resource_out_${index}`}
            handleEditResource={handleEditResource}
          />
        ))}
        <AddResource handleAddResource={handleAddResource} />
      </div>
      {/* Sections */}
      {/* {pageData.sections.map((section, index) => (
        <div key={`section_${index}`} className="mb-7">
          <Divider />
          <ShowOrEditSectionT
            title={section.title}
            sectionId={section._id}
            handleEditTitle={handleEditTitle}
          />
          {pageData.resources.map((resource, resourceIdx) => (
            <ShowOrEditResource
              resource={resource}
              key={`${index}_${resourceIdx}`}
              handleEditResource={handleEditResource}
              sectionId={section._id}
            />
          ))}
          <AddResource handleAddResource={handleAddResource} sectionId={section._id} />
        </div>
      ))} */}
      {/* <Divider /> */}
      {/* <AddSection handleAddResource={handleAddResource} /> */}
    </>
  );
};

export default ShowOrEditPage;
