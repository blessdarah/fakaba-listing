import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.config.js";
import { Service } from "lib/types.js";

export const getServices = async (): Promise<Service[]> => {
  try {
    const q = query(
      collection(db, "services"),
      where("status", "==", "active")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Service, "id">),
    }));
  } catch (error: any) {
    console.error("Error fetching services:", error);

    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Unable to access services.");
    }

    throw new Error("Failed to load services. Please try again.");
  }
};

export const getService = async (id: string): Promise<Service | null> => {
  try {
    const docRef = doc(db, "services", id);
    const record = await getDoc(docRef);

    if (!record.exists()) {
      return null;
    }

    return {
      id: record.id,
      ...record.data(),
    } as Service;
  } catch (error: any) {
    console.error("Error fetching service:", error);

    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Unable to access this service.");
    }

    throw new Error("Failed to load service. Please try again.");
  }
};

export const createService = async (
  data: Omit<Service, "id" | "createdAt" | "updatedAt">
): Promise<Service> => {
  try {
    const docRef = await addDoc(collection(db, "services"), {
      ...data,
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
    console.error("Error creating service:", error);

    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Unable to create service.");
    }

    throw new Error("Failed to create service. Please try again.");
  }
};

export const uploadServiceImage = async (
  imageUri: string
): Promise<string> => {
  const timestamp = Date.now();
  const originalFilename =
    imageUri.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "image";
  const extension = imageUri.split(".").pop()?.split("?")[0] ?? "jpg";

  const response = await fetch(imageUri);
  const blob = await response.blob();
  const storageRef = ref(
    storage,
    `services/${timestamp}-${originalFilename}.${extension}`
  );
  await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(storageRef);
};
