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
  const langs = localStorage.getItem("language") ? localStorage.getItem("language") : "ru";
  const [lang, setLang] = useState(langs);

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    setLang(value);
    localStorage.setItem("language", value);
  };
  return (
    <div>
      <DropdownInput
        value={lang}
        options={languages}
        onChange={handleLanguageChange}
        classname="w-40"
        isSelectable={true}
      />
    </div>
  );
};

export default LanguageSelector;
