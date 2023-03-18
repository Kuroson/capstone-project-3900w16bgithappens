import { MongooseDocument, MongooseId } from "models";

export interface SectionInterface extends MongooseDocument {
  title: string;
  resources: Array<MongooseId>;
}
