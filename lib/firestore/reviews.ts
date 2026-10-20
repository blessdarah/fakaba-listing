import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase.config.js";
import type { Review } from "lib/types.js";

export const getReviewsByAgent = async (
  agentId: string
): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, "reviews"),
      where("agentId", "==", agentId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Review, "id">),
    }));
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    throw new Error("Failed to load reviews. Please try again.");
  }
};

export const createReview = async (review: {
  userId: string;
  agentId: string;
  rating: number;
  comment: string;
  userName: string;
}): Promise<Review> => {
  try {
    const docRef = await addDoc(collection(db, "reviews"), {
      ...review,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...review,
      createdAt: null as any, // serverTimestamp resolves on server
    };
  } catch (error: any) {
    console.error("Error creating review:", error);

    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Please sign in to leave a review.");
    }

    throw new Error("Failed to submit review. Please try again.");
  }
};
