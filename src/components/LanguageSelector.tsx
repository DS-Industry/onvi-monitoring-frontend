import { useTranslation } from "react-i18next";
import DropdownInput from "./ui/Input/DropdownInput";
import { useState } from "react";

const languages: { value: string; name: string }[] = [
  {
    value: "en",
    name: "English",
  },
  {
    value: "ru",
    name: "Russian",
  },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState("en");

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    setLang(value);
  };
  return (
    <div>
      <DropdownInput
        value={lang}
        options={languages}
        onChange={handleLanguageChange}
        classname="w-40 mb-20 mt-5"
        isSelectable={true}
      />
    </div>
  );
};

export default LanguageSelector;
