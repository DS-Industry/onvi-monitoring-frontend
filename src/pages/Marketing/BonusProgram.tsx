import React from "react";
import { useTranslation } from "react-i18next";
const Settings = React.lazy(() => import("./Settings"));
const Levels = React.lazy(() => import("./Levels"));
const Events = React.lazy(() => import("./Events"));
import GenericTabs from "@ui/Tabs/GenericTab";

const BonusProgram: React.FC = () => {
    const { t } = useTranslation();

    const tabItems = [
        {
            key: "settings",
            label: t("routes.settings"),
            content: <Settings />,
        },
        {
            key: "levels",
            label: t("marketing.levels"),
            content: <Levels />,
        },
        {
            key: "events",
            label: t("marketing.events"),
            content: <Events />,
        },
    ];

    return (
        <div className="w-full px-4 sm:px-8 md:px-16 py-4">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <GenericTabs
                    tabs={tabItems}
                    defaultActiveKey="settings"
                    tabBarGutter={32}
                    tabBarStyle={{ marginBottom: 24 }}
                />
            </div>
        </div>
    );
};

export default BonusProgram;
