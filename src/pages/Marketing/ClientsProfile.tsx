import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BasicInformation from "./BasicInformation";
import KeyTab from "./KeyTab";
import Communication from "./Communication";
import Loyalty from "./Loyalty";
import Actions from "./Actions";
import { useButtonCreate } from "@/components/context/useContext";

const ClientsProfile: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('basic');
    const [isEditing, setIsEditing] = useState(false);
    const { buttonOn } = useButtonCreate();

    useEffect(() => {
        if(buttonOn)
            setIsEditing(!isEditing);
    },[buttonOn, isEditing])

    const tabs = [
        { id: 'basic', name: t("warehouse.basic"), content: <BasicInformation isEditing={isEditing} /> },
        { id: 'key', name: t("marketing.key"), content: <KeyTab /> },
        { id: 'comm', name: t("marketing.comm"), content: <Communication /> },
        { id: 'loyalty', name: t("news.loyalty"), content: <Loyalty /> },
        { id: 'actions', name: t("marketing.actions"), content: <Actions /> },
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

export default ClientsProfile;