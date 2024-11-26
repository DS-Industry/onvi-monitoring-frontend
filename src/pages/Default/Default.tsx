import NoDataUI from "@ui/NoDataUI.tsx";
import SalyIamge from "@/assets/Saly-11.svg?react";
import { useTranslation } from "react-i18next";

const Default = () => {
  const { t } = useTranslation();
  return (
      <div >
          <NoDataUI
              title={t("default.default")}
              description={t("default.come")}
          >
            <SalyIamge className="mx-16"/>
          </NoDataUI>
      </div>
  )
};

export default Default;
