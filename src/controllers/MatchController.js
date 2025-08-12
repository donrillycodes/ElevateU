import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "../services/firebase";
import { initiateChat } from "./ChatController";

// Read a user's public profile from Firestore only (no auth import)
const fetchProfileByUid = async (uid) => {
  if (!uid) return { displayName: "", avatarUrl: "" };
  const tryCols = ["profiles", "users"];
  for (const col of tryCols) {
    try {
      const ref = doc(db, col, uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data() || {};
        return {
          displayName:
            d.name || d.displayName || d.fullName || d.username || "",
          avatarUrl: d.avatarUrl || d.photoURL || "",
        };
      }
    } catch {}
  }
  return { displayName: "", avatarUrl: "" };
};

/** Create a new mentor request (mentee -> mentor), denormalize name/avatar */
export const sendMentorRequest = async (menteeId, mentorId, message) => {
  if (!menteeId || !mentorId) throw new Error("Missing menteeId or mentorId");
  const mentee = await fetchProfileByUid(menteeId);
  await addDoc(collection(db, "requests"), {
    menteeId,
    mentorId,
    message: message ?? "",
    status: "pending",
    timestamp: serverTimestamp(),
    menteeName: mentee.displayName || "",
    menteeAvatarUrl: mentee.avatarUrl || "",
  });
};

/** Live list of pending requests for a mentor (enrich if missing) */
export const subscribeToRequests = (mentorId, callback) => {
  const q = query(
    collection(db, "requests"),
    where("mentorId", "==", mentorId),
    where("status", "==", "pending"),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    (async () => {
      const rows = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          let { menteeName, menteeAvatarUrl } = data;
          if (!menteeName || !menteeAvatarUrl) {
            const prof = await fetchProfileByUid(data.menteeId);
            menteeName = menteeName || prof.displayName || "";
            menteeAvatarUrl = menteeAvatarUrl || prof.avatarUrl || "";
          }
          return { id: d.id, ...data, menteeName, menteeAvatarUrl };
        })
      );
      callback(rows);
    })();
  });
};

/** Accept a request and start a chat */
export const acceptRequest = async (
  requestId,
  mentorId,
  menteeId,
  participantsMeta
) => {
  const reqRef = doc(db, "requests", requestId);

  // 1) accept atomically
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(reqRef);
    if (!snap.exists()) throw new Error("Request not found");
    const data = snap.data();
    if (data.mentorId !== mentorId) throw new Error("Not this request’s mentor");
    if (data.menteeId !== menteeId) throw new Error("Mentee mismatch");
    if (data.status !== "pending") throw new Error(`Already ${data.status}`);
    tx.update(reqRef, { status: "accepted", acceptedAt: serverTimestamp() });
  });

  // 2) ensure participantsMeta
  const meta = { ...(participantsMeta || {}) };
  const ensureMeta = async (uid, fallback) => {
    const cur = meta[uid] || {};
    if (!cur.displayName || cur.avatarUrl === undefined) {
      const prof = await fetchProfileByUid(uid);
      meta[uid] = {
        displayName: cur.displayName || prof.displayName || fallback,
        avatarUrl: cur.avatarUrl ?? prof.avatarUrl ?? "",
      };
    }
  };
  await Promise.all([ensureMeta(mentorId, "Mentor"), ensureMeta(menteeId, "Mentee")]);

  // 3) create/reuse chat
  const chatId = await initiateChat(
    mentorId,
    menteeId,
    "Request accepted! Let's chat.",
    meta
  );

  // 4) best-effort attach chatId
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(reqRef);
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.status === "accepted" && !data.chatId) tx.update(reqRef, { chatId });
    });
  } catch {}

  return chatId;
};

/** Decline a request (mentor) */
export const declineRequest = async (requestId) => {
  const reqRef = doc(db, "requests", requestId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(reqRef);
    if (!snap.exists()) throw new Error("Request not found");
    const data = snap.data();
    if (data.status !== "pending") return;
    tx.update(reqRef, { status: "declined", declinedAt: serverTimestamp() });
  });
};
// match controller