import { UserInterface } from "@/models/user.model";
import { Document, Schema, Types, model } from "mongoose";

/**
 * This is a single response to a post within a forum. A response
 * can be marked as 'correct' to indicate it is accepted.
 */
export interface ResponseInterface extends Document {
    response: string;
    correct: boolean;
    poster: UserInterface["_id"];
}

const responseSchema: Schema = new Schema<ResponseInterface>({
    response: { type: String, required: true },
    correct: { type: Boolean, required: true },
    poster: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Response = model<ResponseInterface & Document>("Response", responseSchema);

export default Response;
