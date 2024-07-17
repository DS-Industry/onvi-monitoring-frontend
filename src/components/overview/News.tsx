import React, { useState } from "react";
import Toast from "../ui/Toast";
import Notification from "../ui/Notification";
import FactoryLetterS from "../../assets/Factory Letter S.svg?react";
import ArrowRight from "../../assets/icons/keyboard_arrow_right.svg?react";

interface NewsItem {
  id: number;
  title: string;
  text: string;
}

const initialNews: NewsItem[] = [
  { id: 1, title: "News 1", text: "This is news item 1" },
  { id: 2, title: "News 2", text: "This is news item 2" },
  { id: 3, title: "News 3", text: "This is news item 3" },
  { id: 4, title: "News 4", text: "This is news item 4" },
  { id: 5, title: "News 5", text: "This is news item 5" },
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

      <div className="grid grid-cols-2 gap-6">
        <div className={`w-full bg-background05 px-4 py-5 rounded-[18px]`}>
          <p className="text-sm text-text02 font-semibold">Осталось 264 дня</p>
          <p className="font-semibold text-2xl">
            Вы используете тариф «Максимальный»
          </p>
          <div className="relative">
            <FactoryLetterS className="ml-auto" />
          </div>
          <button className="text-primary02 flex items-center gap-2 py-2.5 font-semibold text-sm">
            К тарифу <ArrowRight />
          </button>
        </div>
        {news.map((item) => (
          <Toast
            key={item.id}
            id={item.id}
            textColor="black"
            bgColor="background05"
            onClose={handleClose}
          >
            <div>{item.title}</div>
            <div>{item.text}</div>
          </Toast>
        ))}
      </div>  
    </>
  );
};

export default News;
