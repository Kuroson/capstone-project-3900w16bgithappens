import { MongooseDocument, MongooseId } from "models";

export interface PageInterface extends MongooseDocument {
  title: string;
  sections: Array<MongooseId>;
  resources: Array<MongooseId>;
}
