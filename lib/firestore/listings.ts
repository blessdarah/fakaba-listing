import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  getFirestore,
  limit,
} from "firebase/firestore";
import { app } from "../../firebase.config.js";
import { Listing } from "lib/types.js";

const db = getFirestore(app);

export const getListings = async (): Promise<Listing[]> => {
  try {
    // Query only active properties that are publicly readable
    const q = query(
      collection(db, "properties"),
      where("status", "==", "active"),
      limit(10),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Listing, "id">),
    }));
  } catch (error: any) {
    console.error("Error fetching listings:", error);

    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Unable to access listings.");
    }

    throw new Error("Failed to load listings. Please try again.");
  }
};

export const getListing = async (id: string) => {
  try {
    const ref = doc(db, "properties", id);
    const record = await getDoc(ref);

    if (!record.exists()) {
      return null;
    }

    return {
      id: record.id,
      ...record.data(),
    };
  } catch (error: any) {
    console.error("Error fetching listing:", error);

    if (error.code === "permission-denied") {
      throw new Error(
        "Permission denied: You don't have access to view this listing. Please sign in.",
      );
    }

    throw new Error("Failed to load listing. Please try again.");
  }
};
