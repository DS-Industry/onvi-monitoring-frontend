import { Trans, useTranslation } from "react-i18next";
import SalyIamge from "../assets/Saly-11.svg?react";
import React, {useEffect, useState} from "react";
import NoDataUI from "../components/ui/NoDataUI.tsx";
import DrawerCreate from "../components/ui/Drawer/DrawerCreate.tsx";
import {useButtonCreate} from "../components/context/useContext.tsx";
const Organization: React.FC = () => {
    const [isData, setIsData] = useState(true);
    const { t } = useTranslation();
    const { title, description } = t("home");

    return (
        <>
            <DrawerCreate>
                <p>test</p>
            </DrawerCreate>

            {isData ? (
                <p>test</p>
            ):(
                <NoDataUI
                    title="Не создано никаких юридических лиц"
                    description="Добавить юридическое лицо"
                >
                    <SalyIamge className="mx-auto" />
                </NoDataUI>
            )}
        </>
    );
};

export default Organization;
