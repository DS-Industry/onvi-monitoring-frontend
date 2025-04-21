import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "antd";
import type { TabsProps } from "antd";

import BasicInformation from "./BasicInformation";
import KeyTab from "./KeyTab";
import Communication from "./Communication";
import Loyalty from "./Loyalty";
import Actions from "./Actions";

const ClientsProfile: React.FC = () => {
    const { t } = useTranslation();

    const items: TabsProps['items'] = [
        {
            key: 'basic',
            label: t("warehouse.basic"),
            children: <BasicInformation />,
        },
        {
            key: 'key',
            label: t("marketing.key"),
            children: <KeyTab />,
        },
        {
            key: 'comm',
            label: t("marketing.comm"),
            children: <Communication />,
        },
        {
            key: 'loyalty',
            label: t("news.loyalty"),
            children: <Loyalty />,
        },
        {
            key: 'actions',
            label: t("marketing.actions"),
            children: <Actions />,
        },
    ];

    return (
        <div className="max-w-5xl ml-10 bg-white p-4 rounded-md shadow-sm">
            <Tabs
                defaultActiveKey="basic"
                items={items}
                tabBarGutter={24}
                tabBarStyle={{ marginBottom: 24 }}
                type="line"
            />
        </div>
    );
};

export default ClientsProfile;
