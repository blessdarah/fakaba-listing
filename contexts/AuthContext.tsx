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
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
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

export interface SetupData {
  accountType: "individual" | "company";
  role: string;
  location: string;
  firstName: string;
  lastName: string;
  interests: string[];
  phone?: string;
  /** Company accounts only. */
  businessName?: string;
  registrationNumber?: string;
  serviceAreas?: string[];
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
  /** Email/password accounts must pass their password (Firebase wants a recent sign-in). */
  deleteAccount: (password?: string) => Promise<void>;
  /** True when the account signs in with email + password (can change password). */
  isPasswordUser: boolean;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
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
  const isPasswordUser = !!user?.providerData.some((p) => p.providerId === "password");

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
      // onAuthStateChanged bailed out early for the unverified user, so the
      // profile (and whether setup is done) hasn't been loaded yet.
      try {
        const snapshot = await getDoc(doc(db, "users", currentUser.uid));
        const data = snapshot.exists() ? (snapshot.data() as UserProfile) : null;
        setUserProfile(data);
        setNeedsSetup(!data?.hasOnboarded);
      } catch (error) {
        console.error("Error loading profile after verification:", error);
        setNeedsSetup(true);
      }
      setNeedsEmailVerification(false);
      setUser({ ...currentUser } as User);
      return true;
    }
    return false;
  };

  /** Persists onboarding answers. Throws so the caller can show an error. */
  const completeSetup = async (data?: SetupData) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const userRef = doc(db, "users", currentUser.uid);
    const profileData: Record<string, any> = {
      hasOnboarded: true,
      updatedAt: serverTimestamp(),
    };
    if (data) {
      profileData.accountType = data.accountType;
      profileData.role = data.role.toLowerCase();
      profileData.location = data.location;
      profileData.firstName = data.firstName;
      profileData.lastName = data.lastName;
      profileData.interests = data.interests;
      if (data.phone) profileData.phone = data.phone;
      if (data.accountType === "company") {
        profileData.businessName = data.businessName ?? "";
        profileData.registrationNumber = data.registrationNumber ?? "";
        profileData.serviceAreas = data.serviceAreas ?? [];
      }
    }
    await updateDoc(userRef, profileData);

    // Sync displayName to Firebase Auth so it's available everywhere
    if (data?.firstName) {
      const displayName = `${data.firstName} ${data.lastName ?? ""}`.trim();
      await updateProfile(currentUser, { displayName });
    }

    setUserProfile((prev) => ({ ...prev, ...profileData }));
    setNeedsSetup(false);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
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

  const deleteAccount = async (password?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    // Re-authenticate first so a wrong password deletes nothing.
    if (password && currentUser.email) {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
    }

    const uid = currentUser.uid;
    // Best effort: the auth user and profile go even if a listing or review can't.
    const removeWhere = async (col: string, field: string) => {
      try {
        const snap = await getDocs(query(collection(db, col), where(field, "==", uid)));
        await Promise.all(snap.docs.map((d) => deleteDoc(d.ref).catch(() => {})));
      } catch (error) {
        console.error(`Error deleting ${col}:`, error);
      }
    };
    await removeWhere("properties", "ownerId");
    await removeWhere("reviews", "userId");

    try {
      await deleteObject(ref(storage, `profile-images/${uid}`));
    } catch {
      // No profile image to delete
    }

    await deleteDoc(doc(db, "users", uid));
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
        isPasswordUser,
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
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
