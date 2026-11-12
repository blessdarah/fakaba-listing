import { ComingSoon } from "components/ComingSoon";
import { useTranslation } from "lib/i18n/useTranslation";

// TODO(v2): "38 — Saved", "39 — Saved · Empty".
export default function SavedScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t("nav.saved")} spot="renter" />;
}
