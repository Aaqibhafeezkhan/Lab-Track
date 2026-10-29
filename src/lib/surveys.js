import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const surveysRef = collection(db, "surveys");

export const DEFAULT_SURVEY_QUESTIONS = [
  "How satisfied are you with the equipment borrowing process?",
  "How helpful was the lab technician?",
  "How satisfied are you with the condition of the equipment?",
  "How easy was it to complete the borrowing process?",
  "How likely are you to use this service again?",
];

export async function getSurveyQuestions() {
  const snapshot = await getDoc(doc(db, "config", "survey"));
  const configured = snapshot.exists() ? snapshot.data().questions : null;
  return Array.isArray(configured) && configured.length > 0
    ? configured
    : DEFAULT_SURVEY_QUESTIONS;
}

export async function submitSurvey(slipId, data, autoFill = false) {
  const questions = await getSurveyQuestions();
  const ratings = Object.fromEntries(
    questions.map((_, index) => [`q${index + 1}`, autoFill ? 5 : Number(data.ratings?.[`q${index + 1}`] || 0)])
  );

  return addDoc(surveysRef, {
    slipId,
    createdAt: serverTimestamp(),
    name: (data.name || "").trim(),
    college: (data.college || "").trim(),
    ratings,
    improvement: (data.improvement || "").trim(),
  });
}
