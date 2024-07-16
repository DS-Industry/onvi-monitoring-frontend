import React, { useState } from "react";
import Indicators from "./Indicators";

const TabComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = ["Tab 1", "Tab 2", "Tab 3"];

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
      <div className="mt-4">
        {activeTab === 0 && <div>tab1</div>}
        {activeTab === 1 && <Indicators />}
        {activeTab === 2 && <div>tab3</div>}
      </div>
    </div>
  );
};

export default TabComponent;
