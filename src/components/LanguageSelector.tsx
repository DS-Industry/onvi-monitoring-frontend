import { useTranslation } from "react-i18next";

const lenguages: { code: string; lang: string }[] = [
  {
    code: "en",
    lang: "English",
  },
  {
    code: "ru",
    lang: "Russian",
  },
  // Add more languages here...
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };
  return (
    <div className="grid grid-cols-2 gap-4">
      {lenguages.map(({ code, lang }) => (
        <button
          className={`bg-blue-500 hover:bg-blue-700 ${
            code === i18n.language && "bg-blue-950"
          } text-white font-bold py-2 px-4 rounded-full`}
          key={code}
          onClick={() => handleLanguageChange(code)}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
