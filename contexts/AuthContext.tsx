import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.config";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === "web") {
        await signInWithPopup(auth, googleProvider);
      } else {
        const redirectUri = AuthSession.makeRedirectUri({
          useProxy: true,
        });

        const request = new AuthSession.AuthRequest({
          clientId:
            "35301983706-YOUR_CLIENT_ID.apps.googleusercontent.com",
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
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
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
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
