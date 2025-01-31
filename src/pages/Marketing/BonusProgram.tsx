import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Settings from "./Settings";
import Levels from "./Levels";
import Events from "./Events";

const BonusProgram: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('settings');

    const tabs = [
        { id: 'settings', name: t("routes.settings"), content: <Settings /> },
        { id: 'levels', name: t("marketing.levels"), content: <Levels /> },
        { id: 'events', name: t("marketing.events"), content: <Events /> },
    ];

    return (
        <div className="max-w-5xl mx-auto bg-white">
            <div className="flex space-x-4 border-b mb-6 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`pb-2 ${activeTab === tab.id ? 'text-text01 border-b-4 border-primary02' : 'text-text02'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex">
                {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
        </div>
    )
}

export default BonusProgram;