type FireStoreTimestamp = import("firebase/firestore").Timestamp;

export interface Listing {
  id: string;
  category: string;
  title: string;
  price: number;
  address: string; // specific location
  location: string; // town or city
  /** Optional pin position. Not written by the app yet; the map geocodes address/town when missing. */
  latitude?: number;
  longitude?: number;
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
  phone?: string;
  profileImage?: string;
  role?: "admin" | "agent" | "investor";
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

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  /** Uploaded cover. Empty when the service uses an illustration instead. */
  imageUrl: string;
  /** One of SERVICE_ART in components/illustrations/services. */
  illustration?: string;
  /** One line under the title in the list ("Rent collection, tenants, repairs"). */
  tagline?: string;
  /** "What's included" ticks on the detail screen. */
  highlights?: string[];
  /** Shown as the "Most asked" card at the top of Services. */
  featured?: boolean;
  faqs: ServiceFAQ[];
  status: "active" | "inactive";
  createdAt: FireStoreTimestamp;
  updatedAt: FireStoreTimestamp;
}

export interface Review {
  id: string;
  userId: string;
  agentId: string;
  rating: number;
  comment: string;
  userName: string;
  userImage?: string;
  /** "What stood out" chips: repliedFast, accuratePhotos, noVisitFee, onTime, fairPrice. */
  tags?: string[];
  /** The agent's public reply (firestore rules let only the agent set it). */
  response?: string | { text?: string; createdAt?: FireStoreTimestamp };
  createdAt: FireStoreTimestamp;
  updatedAt?: FireStoreTimestamp;
}
