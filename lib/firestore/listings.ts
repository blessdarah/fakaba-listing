import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase.config.js";
import { Listing, User } from "lib/types.js";

export const getListings = async (): Promise<Listing[]> => {
  try {
    const q = query(
      collection(db, "properties"),
      where("status", "==", "active"),
      limit(10)
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

    const listingData = {
      id: record.id,
      ...record.data(),
    } as Listing;

    // Fetch user data if ownerId exists
    if (listingData.ownerId) {
      try {
        const userRef = doc(db, "users", listingData.ownerId);
        const userRecord = await getDoc(userRef);

        if (userRecord.exists()) {
          listingData.owner = {
            id: userRecord.id,
            ...userRecord.data(),
          } as User;
        }
      } catch (userError: any) {
        console.error("Error fetching user data:", userError);
        // Continue without user data if there's an error
      }
    }

    return listingData;
  } catch (error: any) {
    console.error("Error fetching listing:", error);

    if (error.code === "permission-denied") {
      throw new Error(
        "Permission denied: You don't have access to view this listing. Please sign in."
      );
    }

    throw new Error("Failed to load listing. Please try again.");
  }
};

export const getListingByUserId = async (id: string) => {
  try {
    const q = query(
      collection(db, "properties"),
      where("status", "==", "active"),
      where("ownerId", "==", id)
    );
    const snapshot = await getDocs(q);

    const listings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Listing, "id">),
    }));

    // Fetch user data once since all listings have the same ownerId
    let owner: User | undefined;
    if (id) {
      try {
        const userRef = doc(db, "users", id);
        const userRecord = await getDoc(userRef);

        if (userRecord.exists()) {
          owner = {
            id: userRecord.id,
            ...userRecord.data(),
          } as User;
        }
      } catch (userError: any) {
        console.error("Error fetching user data:", userError);
        // Continue without user data if there's an error
      }
    }

    console.log("owner: ", owner);
    // Add owner to each listing
    return listings.map((listing) => ({
      ...listing,
      owner,
    }));
  } catch (error: any) {
    console.error("Error fetching listing:", error);

    if (error.code === "permission-denied") {
      throw new Error(
        "Permission denied: You don't have access to view this listing. Please sign in."
      );
    }

    throw new Error("Failed to load listing. Please try again.");
  }
};
