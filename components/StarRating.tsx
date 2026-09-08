import { StarFull } from "@tamagui/lucide-icons-2";
import { JSX } from "react";
import { XStack } from "tamagui";

export function StartRating({ count }: { count: number }) {
  const stars: Array<JSX.Element> = [];
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      stars.push(<StarFull size={16} color="$yellow10" />);
    }
  }
  return <XStack gap="$1">{stars}</XStack>;
}
