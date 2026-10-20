import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, storage } from "../firebase.config";
import { db } from "../firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

interface UserProfile {
  role?: "agent" | "investor" | string;
  accountType?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
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
  loading: boolean;
  needsSetup: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  completeSetup: (data?: SetupData) => Promise<void>;
  updateProfileImage: (uri: string) => Promise<void>;
  becomeAgent: () => Promise<void>;
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

  const isAgent = userProfile?.role === "agent";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (!user) {
        setNeedsSetup(false);
        setUserProfile(null);
        setLoading(false);
        return;
      }

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

  const authenticateWithGoogle = async () => {
    if (Platform.OS === "web") {
      await signInWithPopup(auth, googleProvider);
    } else {
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      const request = new AuthSession.AuthRequest({
        clientId: "35301983706-YOUR_CLIENT_ID.apps.googleusercontent.com",
        scopes: ["openid", "profile", "email"],
        redirectUri,
      });

      await request.makeAuthUrlAsync({
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      });

      const result = await request.promptAsync({
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      });

      if (result.type === "success") {
        const { params } = result;
        const credential = GoogleAuthProvider.credential(params.id_token);
        await signInWithCredential(auth, credential);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await authenticateWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signUpWithGoogle = async () => {
    try {
      await authenticateWithGoogle();
      setNeedsSetup(true);
    } catch (error) {
      console.error("Error signing up with Google:", error);
      throw error;
    }
  };

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
      setNeedsSetup(true);
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
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
    const storageRef = ref(storage, `avatars/${currentUser.uid}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    await updateProfile(currentUser, { photoURL: downloadURL });
    await updateDoc(doc(db, "users", currentUser.uid), {
      profileImage: downloadURL,
    });

    // Refresh user state so the UI picks up the new photoURL
    setUser({ ...currentUser } as User);
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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("Not authenticated");
    }

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
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
        loading,
        needsSetup,
        signInWithGoogle,
        signUpWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        changePassword,
        completeSetup,
        updateProfileImage,
        becomeAgent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
