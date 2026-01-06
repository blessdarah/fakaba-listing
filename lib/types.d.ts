type FireStoreTimestamp = import("firebase/firestore").Timestamp;

export interface Listing {
  id: string;
  category: string;
  title: string;
  price: number;
  address: string; // specific location
  location: string; // town or city
  ownerId: string;
  imageUrls: string[];
  description: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  type: string;
  createdAt: FireStoreTimestamp;
  updatedAt: FireStoreTimestamp;
}
