import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.config.js";
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

export const getMyListings = async (ownerId: string): Promise<Listing[]> => {
  try {
    const q = query(
      collection(db, "properties"),
      where("ownerId", "==", ownerId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Listing, "id">),
    }));
  } catch (error: any) {
    console.error("Error fetching my listings:", error);
    throw new Error("Failed to load your listings. Please try again.");
  }
};

export const uploadListingImages = async (
  ownerId: string,
  imageUris: string[]
): Promise<string[]> => {
  const timestamp = Date.now();
  const urls: string[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    const response = await fetch(imageUris[i]);
    const blob = await response.blob();
    const storageRef = ref(storage, `listings/${ownerId}/${timestamp}_${i}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    urls.push(downloadURL);
  }

  return urls;
};

export const createListing = async (
  data: Omit<Listing, "id" | "createdAt" | "updatedAt" | "owner">
): Promise<Listing> => {
  try {
    const docRef = await addDoc(collection(db, "properties"), {
      ...data,
      status: "active",
      isPublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...data,
      createdAt: null as any,
      updatedAt: null as any,
    };
  } catch (error: any) {
    console.error("Error creating listing:", error);

    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Please sign in to create a listing.");
    }

    throw new Error("Failed to create listing. Please try again.");
  }
};

export const updateListingStatus = async (
  id: string,
  status: "active" | "inactive"
): Promise<void> => {
  try {
    const listingRef = doc(db, "properties", id);
    await updateDoc(listingRef, {
      status,
      isPublic: status === "active",
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error updating listing status:", error);

    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Unable to update this listing.");
    }

    throw new Error("Failed to update listing. Please try again.");
  }
};

export const deleteListing = async (id: string): Promise<void> => {
  try {
    const listingRef = doc(db, "properties", id);
    await deleteDoc(listingRef);
  } catch (error: any) {
    console.error("Error deleting listing:", error);

    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Unable to delete this listing.");
    }

    throw new Error("Failed to delete listing. Please try again.");
  }
};
