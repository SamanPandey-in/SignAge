import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export const saveLetterProgress = async (letter, confidence) => {
  const user = auth.currentUser;
  if (!user) return;

  const letterRef = doc(db, "users", user.uid, "progress", "letters");

  const snap = await getDoc(letterRef);

  let data = snap.exists() ? snap.data() : {};

  const prev = data[letter] || {
    attempts: 0,
    correct: 0,
  };

  const updated = {
    ...data,
    [letter]: {
      attempts: prev.attempts + 1,
      correct: prev.correct + 1,
      lastConfidence: confidence,
      updatedAt: serverTimestamp(),
    },
  };

  if (snap.exists()) {
    await updateDoc(letterRef, updated);
  } else {
    await setDoc(letterRef, updated);
  }
};
