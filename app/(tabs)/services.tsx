import { ComingSoon } from "components/ComingSoon";
import { useTranslation } from "lib/i18n/useTranslation";

// TODO(v2): "61 — Services", "62 — Service detail".
export default function ServicesScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t("nav.services")} spot="agent" />;
}
