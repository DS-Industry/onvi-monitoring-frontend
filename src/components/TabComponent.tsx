import React, { useState } from "react";
import Indicators from "./overview/Indicators";
import News from "./overview/News";
import RatingOfCarWases from "./overview/RatingOfCarWases";

const TabComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = ["Новости", "Статистика", "Рейтинг АМС"];

  return (
    <div className="py-5">
      <div className="flex space-x-4 border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-4 font-semibold ${
              activeTab === index
                ? "border-b-4 border-primary02 text-text01"
                : "text-text02"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {activeTab === 0 && <News />}
        {activeTab === 1 && <Indicators />}
        {activeTab === 2 && <RatingOfCarWases />}
      </div>
    </div>
  );
};

export default TabComponent;
