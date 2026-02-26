type FireStoreTimestamp = import("firebase/firestore").Timestamp;

export interface Listing {
  id: string;
  category: string;
  title: string;
  price: number;
  address: string; // specific location
  location: string; // town or city
  ownerId: string;
  owner?: User; // populated user data
  imageUrls: string[];
  features: string[];
  description: string;
  status: string;
  isPublic?: boolean;
  bedrooms: number;
  bathrooms: number;
  size: number;
  type: string;
  createdAt: FireStoreTimestamp;
  updatedAt: FireStoreTimestamp;
}

interface BaseUserInfo {
  authProvider: string;
  createdAt: FireStoreTimestamp;
  email: string;
  hasOnboarded: boolean;
  interests?: string[];
  location?: string;
  profileImage?: string;
  role?: "agent" | "investor";
  userRole?: "agent" | "investor";
  updatedAt?: FireStoreTimestamp;
}

export interface User extends BaseUserInfo {
  id?: string;
  accountType: "company" | "individual";
  imageUrls: string[];
  firstName?: string;
  lastName?: string;
  favorites?: string[]; // Array of listing IDs
}
