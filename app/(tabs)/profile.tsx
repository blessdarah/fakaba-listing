import { StyleSheet } from "react-native";
import { ComingSoon } from "components/ComingSoon";
import { Button } from "components/ui/Button";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";

// TODO(v2): "52 — Profile & settings" and its sub-screens.
export default function ProfileScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  return (
    <ComingSoon title={t("nav.profile")} spot="individual">
      <Button label={t("soon.signOut")} variant="outline" onPress={() => signOut()} style={styles.button} />
    </ComingSoon>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: "stretch", marginTop: 24 },
});
