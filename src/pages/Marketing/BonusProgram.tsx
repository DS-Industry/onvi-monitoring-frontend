import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import Settings from "./Settings";
import Levels from "./Levels";
import Events from "./Events";

const BonusProgram: React.FC = () => {
    const { t } = useTranslation();

    const items: TabsProps['items'] = [
        {
            key: 'settings',
            label: t("routes.settings"),
            children: <Settings />,
        },
        {
            key: 'levels',
            label: t("marketing.levels"),
            children: <Levels />,
        },
        {
            key: 'events',
            label: t("marketing.events"),
            children: <Events />,
        },
    ];
    
    return (
        <div className="w-full px-4 sm:px-8 md:px-16 py-4">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <Tabs
                    defaultActiveKey="settings"
                    items={items}
                    tabBarGutter={32}
                    tabBarStyle={{ marginBottom: 24 }}
                />
            </div>
        </div>
    );
};

export default BonusProgram;
