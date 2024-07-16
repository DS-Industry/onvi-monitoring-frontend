import { Trans, useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";

const Services: React.FC = () => {
  const { t } = useTranslation();
  const { title, description } = t("home");
  return (
    <div>
      <LanguageSelector />
      <h1>{t("greeting")}</h1>
      {/* <h2>{title}</h2> */}
      <h2>
        <Trans
          i18nKey={title}
          values={{
            company: "ONVI Monitoring",
            // other placeholders can be included here as needed
          }}
          components={{ 1: <b />,
            2: <h2 />
           }}
        />
      </h2>
      <p>
        <Trans
          i18nKey={description}
          values={{
            company: "ONVI Monitoring",
            // other placeholders can be included here as needed
          }}
          components={{ 1: <b /> }}
        />
      </p>
      {/* <p>{description}</p> */}
    </div>
  );
};

export default Services;
