import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, storage } from "../firebase.config";
import { db } from "../firebase.config";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

interface UserProfile {
  role?: "agent" | "investor" | string;
  accountType?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  interests?: string[];
  hasOnboarded?: boolean;
  [key: string]: any;
}

interface SetupData {
  accountType: string;
  role: string;
  location: string;
  firstName: string;
  lastName: string;
  interests: string[];
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAgent: boolean;
  isAdmin: boolean;
  loading: boolean;
  needsSetup: boolean;
  needsEmailVerification: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  completeSetup: (data?: SetupData) => Promise<void>;
  updateProfileImage: (uri: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  becomeAgent: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  const isAgent = userProfile?.role === "agent";
  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (!user) {
        setNeedsSetup(false);
        setNeedsEmailVerification(false);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // Check email verification for email/password users
      const isEmailProvider =
        user.providerData[0]?.providerId === "password";
      const isReviewAccount = user.email === "review@fakaba.co" || user.email === "bless@test.com";
      if (isEmailProvider && !user.emailVerified && !isReviewAccount) {
        setNeedsEmailVerification(true);
        setLoading(false);
        return;
      }

      setNeedsEmailVerification(false);

      // Prevent route guard from navigating until Firestore check completes
      setLoading(true);

      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
          await setDoc(
            userRef,
            {
              email: user.email,
              authProvider: user.providerData[0]?.providerId ?? "unknown",
              hasOnboarded: false,
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
          setUserProfile(null);
          setNeedsSetup(true);
        } else {
          const data = snapshot.data() as UserProfile;
          setUserProfile(data);
          setNeedsSetup(!data?.hasOnboarded);
        }
      } catch (error) {
        console.error("Error checking setup state:", error);
        setNeedsSetup(false);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const creds = await signInWithEmailAndPassword(auth, email, password);
      setUser(creds.user);
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const creds = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", creds.user.uid);
      await setDoc(
        userRef,
        {
          email: creds.user.email,
          authProvider: "password",
          hasOnboarded: false,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Send verification email
      await sendEmailVerification(creds.user);
      setNeedsEmailVerification(true);
      setNeedsSetup(true);
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");
    await sendEmailVerification(currentUser);
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    await currentUser.reload();
    if (currentUser.emailVerified) {
      setNeedsEmailVerification(false);
      setUser({ ...currentUser } as User);
      return true;
    }
    return false;
  };

  const completeSetup = async (data?: SetupData) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const profileData: Record<string, any> = {
          hasOnboarded: true,
          updatedAt: serverTimestamp(),
        };
        if (data) {
          profileData.accountType = data.accountType.toLowerCase();
          profileData.role = data.role.toLowerCase();
          profileData.location = data.location;
          profileData.firstName = data.firstName;
          profileData.lastName = data.lastName;
          profileData.interests = data.interests;
        }
        await updateDoc(userRef, profileData);

        // Sync displayName to Firebase Auth so it's available everywhere
        if (data?.firstName) {
          const displayName =
            `${data.firstName} ${data.lastName ?? ""}`.trim();
          await updateProfile(currentUser, { displayName });
        }

        setUserProfile((prev) => ({ ...prev, ...profileData }));
      }
      setNeedsSetup(false);
    } catch (error) {
      console.error("Error completing setup:", error);
    }
  };

  const updateProfileImage = async (uri: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const response = await fetch(uri);
    const blob = await response.blob();
    if (blob.size === 0) throw new Error("Selected image is empty");
    const contentType = blob.type || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      throw new Error("Selected file is not an image");
    }

    const storageRef = ref(storage, `profile-images/${currentUser.uid}`);
    try {
      await deleteObject(storageRef);
    } catch {
      // No existing image to delete
    }

    await uploadBytes(storageRef, blob, { contentType });
    const downloadURL = await getDownloadURL(storageRef);
    if (!downloadURL) throw new Error("Upload succeeded but no URL returned");

    await updateProfile(currentUser, { photoURL: downloadURL });
    await updateDoc(doc(db, "users", currentUser.uid), {
      profileImage: downloadURL,
    });

    setUserProfile((prev) => ({ ...prev, profileImage: downloadURL }));
  };

  const becomeAgent = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      role: "agent",
      updatedAt: serverTimestamp(),
    });
    setUserProfile((prev) => ({ ...prev, role: "agent" }));
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });

    if (data.firstName !== undefined || data.lastName !== undefined) {
      const merged = { ...userProfile, ...data };
      const displayName =
        `${merged.firstName ?? ""} ${merged.lastName ?? ""}`.trim();
      await updateProfile(currentUser, { displayName });
    }

    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("Not authenticated");
    }

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    // Delete profile image from storage
    try {
      const storageRef = ref(storage, `profile-images/${currentUser.uid}`);
      await deleteObject(storageRef);
    } catch {
      // No profile image to delete
    }

    // Delete user document from Firestore
    await deleteDoc(doc(db, "users", currentUser.uid));

    // Delete the Firebase Auth user
    await deleteUser(currentUser);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAgent,
        isAdmin,
        loading,
        needsSetup,
        needsEmailVerification,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        deleteAccount,
        changePassword,
        completeSetup,
        updateProfileImage,
        updateUserProfile,
        becomeAgent,
        resendVerificationEmail,
        checkEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
