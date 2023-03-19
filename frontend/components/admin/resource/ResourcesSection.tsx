import { ResourceInterface } from "models";
import AddNewResourceSection from "./AddNewResourceSection";
import SingleEditableResource from "./SingleEditableResource";

type ResourcesSectionProps = {
  resources: ResourceInterface[];
  setResources: React.Dispatch<React.SetStateAction<ResourceInterface[]>>;
  courseId: string;
  pageId: string;
};

const ResourcesSection = ({
  resources,
  setResources,
  courseId,
  pageId,
}: ResourcesSectionProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full mb-8">
      {resources.map((resource) => {
        return (
          <SingleEditableResource
            resource={resource}
            key={resource._id}
            setResources={setResources}
            pageId={pageId}
            courseId={courseId}
            resources={resources}
          />
        );
      })}
      <AddNewResourceSection
        courseId={courseId}
        pageId={pageId}
        setResources={setResources}
        resources={resources}
      />
    </div>
  );
};

export default ResourcesSection;
