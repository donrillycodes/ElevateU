import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, serverTimestamp, orderBy, } from "firebase/firestore";
import { db } from "../services/firebase";
import { initiateChat } from "./ChatController";

export const sendMentorRequest = async (menteeId, mentorId, message) => {
  await addDoc(collection(db, "requests"), {
    menteeId,
    mentorId,
    message,
    status: "pending",
    timestamp: serverTimestamp(),
  });
};

export const subscribeToRequests = (mentorId, callback) => {
  const q = query(
    collection(db, "requests"),
    where("mentorId", "==", mentorId),
    where("status", "==", "pending"),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(requests);
  });
};

export const acceptRequest = async (requestId, mentorId, menteeId) => {
  const chatId = await initiateChat(
    mentorId,
    menteeId,
    "Request accepted! Let's chat."
  );
  await updateDoc(doc(db, "requests", requestId), {
    status: "accepted",
    chatId,
  });
};

export const declineRequest = async (requestId) => {
  await updateDoc(doc(db, "requests", requestId), { status: "declined" });
};

// Note: For AI-powered matching, you could add a function to query mentors based on
// mentee's field, skills, or other criteria using Firestore queries or a Cloud Function
// with a scoring algorithm. Example:
// export const matchMentors = async (menteeId) => {
//   // Fetch mentee profile, query mentors with similar field/skills
//   // Return ranked list
// };
