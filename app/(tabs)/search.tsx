import { ComingSoon } from "components/ComingSoon";
import { useTranslation } from "lib/i18n/useTranslation";

// TODO(v2): "30 — Search · Results", "31 — Search · Map", "32 — Filters".
export default function SearchScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t("nav.search")} spot="land" />;
}
