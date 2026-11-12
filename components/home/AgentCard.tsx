import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "components/ui/Avatar";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import type { User } from "lib/types";
import { radius, useTheme } from "theme";

type AgentLike = User & { businessName?: string; verified?: boolean; rating?: number };

export function agentDisplayName(agent: AgentLike) {
  if (agent.accountType === "company" && agent.businessName) {
    const [first, second] = agent.businessName.split(/\s+/);
    return second ? `${first} ${second[0]}.` : first;
  }
  const first = agent.firstName?.trim() ?? "";
  const last = agent.lastName?.trim() ?? "";
  if (!first && !last) return agent.email?.split("@")[0] ?? "Agent";
  return last ? `${first} ${last[0]}.` : first;
}

/** 136 wide, outlined. People get a round photo; companies a square ink tile. */
export const AgentCard = memo(function AgentCard({
  agent,
  meta,
  onPress,
}: {
  agent: AgentLike;
  meta?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const isCompany = agent.accountType === "company";
  const fullName = isCompany
    ? agent.businessName
    : `${agent.firstName ?? ""} ${agent.lastName ?? ""}`.trim();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.card, { borderColor: colors.line }]}
      accessibilityLabel={fullName || agentDisplayName(agent)}
    >
      <Avatar name={fullName || agentDisplayName(agent)} uri={agent.profileImage} size={64} kind={isCompany ? "company" : "person"} />
      <View style={styles.nameRow}>
        <Text variant="sm" weight="semibold" numberOfLines={1} style={styles.name}>
          {agentDisplayName(agent)}
        </Text>
        {agent.verified && <Icon name="verified" size={13} color="palm" />}
      </View>
      <Text variant="xs" color="inkMuted" numberOfLines={1}>
        {agent.rating ? `★ ${agent.rating.toFixed(1)}` : ""}
        {agent.rating && meta ? " · " : ""}
        {meta}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 136,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: 8,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4, maxWidth: "100%" },
  name: { flexShrink: 1 },
});
