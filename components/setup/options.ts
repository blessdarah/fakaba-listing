import type { SpotName } from "components/illustrations";

export const ROLES: { id: string; spot: SpotName }[] = [
  { id: "renter", spot: "renter" },
  { id: "buyer", spot: "buyer" },
  { id: "seller", spot: "seller" },
  { id: "agent", spot: "agent" },
  { id: "investor", spot: "investor" },
];

/** Interest ids match listing `category` values in Firestore (plus "Investment"). */
export const INTERESTS: { id: string; spot: SpotName }[] = [
  { id: "Room", spot: "renter" },
  { id: "Apartment", spot: "company" },
  { id: "House", spot: "buyer" },
  { id: "Commercial", spot: "commercial" },
  { id: "Land", spot: "land" },
  { id: "Investment", spot: "investor" },
];

export const TOWNS = ["Douala", "Yaoundé", "Buea", "Limbe", "Bamenda", "Kribi"];

/** Pre-select interests that match the person's goal, so step 5 isn't empty. */
export function defaultInterestsFor(role: string | null): string[] {
  switch (role) {
    case "renter":
      return ["Room", "Apartment"];
    case "buyer":
      return ["House", "Land"];
    case "investor":
      return ["Land", "Investment"];
    default:
      return [];
  }
}
