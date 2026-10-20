import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase.config.js";
import { useState } from "react";
import { User } from "lib/types.js";

export const getUserById = async (id: string): Promise<User | null> => {
  const ref = doc(db, "users", id);
  const userDoc = await getDoc(ref);
  if (!userDoc.exists()) {
    return null;
  }
  return {
    id: userDoc.id,
    ...userDoc.data(),
  } as User;
};

export const getUsers = async () => {
  const users = await getDocs(collection(db, "users"));
  return users.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getAgents = async () => {
  const q = query(collection(db, "users"), where("role", "==", "agent"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as User[];
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const addToFavorites = async (userId: string, listingId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        favorites: arrayUnion(listingId),
      });
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return false;
    }
  };

  const removeFromFavorites = async (userId: string, listingId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        favorites: arrayRemove(listingId),
      });
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return false;
    }
  };

  return {
    getUserById,
    getUsers,
    getAgents,
    addToFavorites,
    removeFromFavorites,
  };
};
