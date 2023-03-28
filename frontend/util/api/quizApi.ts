import {
  CreateQuizType,
  QuizBasicInfo,
  QuizInfoTypeAdmin,
  QuizListType,
  QuizQuestionType,
} from "models/quiz.model";
import { BackendLinkType, apiDelete, apiGet, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

export const getListOfQuizzes = (token: string | null, courseId: string, type: BackendLinkType) => {
  return apiGet<{ courseId: string }, { quizzes: QuizListType[] }>(
    `${getBackendLink(type)}/quiz/list`,
    token,
    { courseId: courseId },
  );
};

// for student
// export const getQuizInfoAfterSubmit = (token: string | null, courseId: string, quizId: string, type: BackendLinkType) => {
//   return apiGet<{ courseId: string, quizId: string }, { quizzes: QuizListType[] }>(
//     `${getBackendLink(type)}/quiz`,
//     token,
//     { courseId: courseId, quizId: quizId },
//   );
// };

// for admin
export const createNewQuiz = (
  token: string | null,
  quiz: CreateQuizType,
  type: BackendLinkType,
) => {
  return apiPost<CreateQuizType, { quizId: string }>(
    `${getBackendLink(type)}/quiz/create`,
    token,
    quiz,
  );
};

export const getQuizInfoAdmin = (token: string | null, quizId: string, type: BackendLinkType) => {
  return apiGet<{ quizId: string }, QuizInfoTypeAdmin>(
    `${getBackendLink(type)}/quiz/questions`,
    token,
    { quizId: quizId },
  );
};

export const updateQuizAdmin = (
  token: string | null,
  newInfo: QuizBasicInfo & { quizId: string },
  type: BackendLinkType,
) => {
  return apiPut<QuizBasicInfo & { quizId: string }, { quizId: string }>(
    `${getBackendLink(type)}/quiz/update`,
    token,
    newInfo,
  );
};

export const createNewQuestion = (
  token: string | null,
  newQuestion: QuizQuestionType & { courseId: string; quizId: string },
  type: BackendLinkType,
) => {
  return apiPost<QuizQuestionType & { courseId: string; quizId: string }, { questionId: string }>(
    `${getBackendLink(type)}/quiz/question/create`,
    token,
    newQuestion,
  );
};

export const deleteQuestion = (
  token: string | null,
  ids: { quizId: string; questionId: string },
  type: BackendLinkType,
) => {
  return apiDelete<{ quizId: string; questionId: string }, { message: string }>(
    `${getBackendLink(type)}/quiz/question/delete`,
    token,
    ids,
  );
};
