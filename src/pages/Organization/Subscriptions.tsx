import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@/components/ui/Notification";
import { Tabs, TabsProps } from "antd";
import CurrentTariff from "./CurrentTariff";
import ChangeTariff from "./ChangeTariff";

const Subscriptions: React.FC = () => {
    const { t } = useTranslation();
    const [activeTabKey, setActiveTabKey] = useState('current');
    const [isNotificationVisible, setIsNotificationVisible] = useState(true);

    const items: TabsProps['items'] = [
        {
            key: 'current',
            label: t("subscriptions.current"),
            children: <CurrentTariff setActiveTab={setActiveTabKey} />,
        },
        {
            key: 'change',
            label: t("subscriptions.change"),
            children: <ChangeTariff />,
        }
    ];

    return (
        <div className="mt-5">
            {isNotificationVisible && (<Notification
                title={t("subscriptions.you")}
                message={t("subscriptions.if")}
                message2={t("subscriptions.write")}
                showRocket={true}
                onClose={() => setIsNotificationVisible(false)}
            />)}
            <Tabs
                defaultActiveKey="current"
                activeKey={activeTabKey}
                onChange={setActiveTabKey}
                items={items}
                tabBarGutter={24}
                tabBarStyle={{ marginBottom: 24 }}
                type="line"
            />
        </div>
    )
}

export default Subscriptions;