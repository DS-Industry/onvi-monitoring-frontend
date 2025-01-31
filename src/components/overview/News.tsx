import React, { useState } from "react";
import Toast from "@ui/Toast";
import Notification from "@ui/Notification";
import FactoryLetterS from "@/assets/Factory Letter S.svg?react";
import Attention from "@/assets/attention.svg?react";
import { useTranslation } from "react-i18next";

interface NewsItem {
  id: number;
  title: string;
  text: string;
}

const initialNews: NewsItem[] = [
  { id: 1, title: "promotion", text: "promotionText" },
  { id: 2, title: "newEquipment", text: "newEquipmentText" },
  { id: 3, title: "loyalty", text: "loyaltyText" },
];

const News: React.FC = () => {
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [news, setNews] = useState<NewsItem[]>(initialNews);

  const { t } = useTranslation();

  const handleClose = (id: number) => {
    setNews(news.filter((item) => item.id !== id));
  };

  return (
    <>
      {notificationVisible && (
        <Notification
          title={t("news.notification")}
          message={t("news.notificationText")}
          onClose={() => setNotificationVisible(false)}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`w-full bg-background05 px-4 py-5 rounded-[18px]`}>
          <p className="text-sm text-text02 font-semibold">{t("news.daysLeft")}</p>
          <p className="font-semibold text-2xl">
            {t("news.maximumTariff")}
          </p>
          <div className="relative flex">
            <p className="mt-2">{t("news.upToDate")}</p>
            <FactoryLetterS className="ml-auto" />
          </div>

          {/*
            <button className="text-primary02 flex items-center gap-2 py-2.5 font-semibold text-sm">
              К тарифу <ArrowRight/>
            </button>
            */}
        </div>

        <div className={`w-full bg-background05 px-4 py-5 rounded-[18px]`}>
          <p className="text-sm text-text02 font-semibold">{t("news.critical")}</p>
          <p className="font-semibold text-2xl">
            {t("news.chemistry")}
          </p>
          <div className="relative flex">
            <p className="mt-2">{t("news.chemistryText")}</p>
            <Attention className="ml-auto" />
          </div>
        </div>
        {news.map((item) => (
          <Toast
            key={item.id}
            id={item.id}
            textColor="black"
            bgColor="background05"
            onClose={handleClose}
          >
            <div className="font-semibold">{t(`news.${item.title}`)}</div>
            <div>{t(`news.${item.text}`)}</div>
          </Toast>
        ))}
      </div>
    </>
  );
};

export default News;
