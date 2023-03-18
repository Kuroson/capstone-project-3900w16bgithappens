import { MongooseDocument, MongooseId, ResourceInterface, SectionInterface } from "models";

export interface PageInterface extends MongooseDocument {
  title: string;
  sections: Array<MongooseId>;
  resources: Array<MongooseId>;
}

export type PageFull = Omit<PageInterface, "sections" | "resources"> & {
  sections: Array<
    Omit<SectionInterface, "resources"> & {
      resources: ResourceInterface[];
    }
  >;
  resources: ResourceInterface[];
  // Idk why the type isn't inferred here
  title: string;
  _id: MongooseId;
};
