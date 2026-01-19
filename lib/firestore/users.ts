import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../firebase.config.js";
import { useState } from "react";
import { User } from "lib/types.js";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const getUserById = async (id: string): Promise<User | null> => {
    // query firestore for user with id
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

  const getUsers = async () => {
    // query firestore for all users
    const users = await getDocs(collection(db, "users"));
    return users.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

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
    addToFavorites,
    removeFromFavorites,
  };
};
