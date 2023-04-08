import { MongooseDocument } from "models";

export interface KudosValuesInterface extends MongooseDocument {
  /**
   * Completion of quizzes
   */
  quizCompletion: number;
  /**
   * Submission of assignments
   */
  assignmentCompletion: number;
  /**
   * Completion of individual weekly assigned task gives
   */
  weeklyTaskCompletion: number;
  /**
   * Making of forum posts
   */
  forumPostCreation: number;
  /**
   * Replying to/answering other students on the forum
   */
  forumPostAnswer: number;
  /**
   * Correctly answering a question on the forum (marked by the instructor)
   */
  forumPostCorrectAnswer: number;
  /**
   * Attendance of online classes
   */
  attendance: number;
}
