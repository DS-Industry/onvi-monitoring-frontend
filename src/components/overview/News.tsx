import React, { useState } from "react";
import Toast from "../ui/Toast";
import Notification from "../ui/Notification";
import FactoryLetterS from "../../assets/Factory Letter S.svg?react";
import Attention from "../../assets/attention.svg?react";
import Close from "../../assets/icons/close.svg?react";
import ArrowRight from "../../assets/icons/keyboard_arrow_right.svg?react";

interface NewsItem {
  id: number;
  title: string;
  text: string;
}

const initialNews: NewsItem[] = [
  { id: 1, title: "Акция", text: "Успейте приобрести новый шампунь по низкой цене" },
  { id: 2, title: "Новое оборудование", text: "Разработана новая PRO версия робота для мойки автомобилей" },
  { id: 3, title: "Лояльность", text: "Добавлен новый раздел ONVIBusiness - лояльность. Успей попробовать" },
];

const News: React.FC = () => {
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [news, setNews] = useState<NewsItem[]>(initialNews);

  const handleClose = (id: number) => {
    setNews(news.filter((item) => item.id !== id));
  };

  return (
    <>
      {notificationVisible && (
        <Notification
          title="Ваши новости"
          message="В данном разделе будут отображаться главные новости и события вашей автомойки"
          onClose={() => setNotificationVisible(false)}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`w-full bg-background05 px-4 py-5 rounded-[18px]`}>
          <p className="text-sm text-text02 font-semibold">Осталось 264 дня</p>
          <p className="font-semibold text-2xl">
            Вы используете тариф «Максимальный»
          </p>
          <div className="relative flex">
            <p className="mt-2">Здесь храниться актуальная информация про ваш тариф</p>
            <FactoryLetterS className="ml-auto" />
          </div>

          {/*
            <button className="text-primary02 flex items-center gap-2 py-2.5 font-semibold text-sm">
              К тарифу <ArrowRight/>
            </button>
            */}
        </div>

        <div className={`w-full bg-background05 px-4 py-5 rounded-[18px]`}>
          <p className="text-sm text-text02 font-semibold">Критический остаток</p>
          <p className="font-semibold text-2xl">
            Химия
          </p>
          <div className="relative flex">
            <p className="mt-2">Пополните запасы химии на объекте!</p>
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
            <div className="font-semibold">{item.title}</div>
            <div>{item.text}</div>
          </Toast>
        ))}
      </div>  
    </>
  );
};

export default News;
