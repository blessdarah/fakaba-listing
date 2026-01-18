import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase.config.js";
import { useState } from "react";
import { User } from "lib/types.js";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const getUserById = async (id: string) => {
    // query firestore for user with id
    const ref = doc(db, "users", id);
    const user = await getDoc(ref);
    if (!user.exists()) {
      return null;
    }
    return {
      id: user.id,
      ...user.data(),
    };
  };

  const getUsers = async () => {
    // query firestore for all users
    const users = await getDocs(collection(db, "users"));
    return users.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  return {
    getUserById,
    getUsers,
  };
};
