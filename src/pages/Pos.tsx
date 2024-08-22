import { Trans, useTranslation } from "react-i18next";
import SalyIamge from "../assets/Saly-1.svg?react";
import React, {useRef, useState} from "react";
import NoDataUI from "../components/ui/NoDataUI.tsx";
import Notification from "../components/ui/Notification.tsx";
import Filter from "../components/ui/Filter.tsx";
import ArrowDown from "../assets/icons/keyboard_arrow_down.svg?react";
import ArrowUp from "../assets/icons/keyboard_arrow_up.svg?react";
import {useFilterOpen} from "../components/context/useContext.tsx";
import DrawerCreate from "../components/ui/Drawer/DrawerCreate.tsx";
const Pos: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [isData, setIsData] = useState(false);
    const { filterOpen, setFilterOpen} = useFilterOpen();
    const contentRef = useRef<HTMLDivElement>(null);
    const { title, description } = t("home");
    return (
        <>
            {isData ? (
                <p>test</p>
            ):(<>
                    {notificationVisible && (
                    <Notification
                        title="Юридическаое лицо"
                        message="Чтобы создать объект, сначала нужно ввести данные юридического лица во вкладке Администрирование!"
                        onClose={() => setNotificationVisible(false)}
                    />
                    )}
                    <NoDataUI
                        title="Пока не создан ни один объект"
                        description="Добавьте автомойку"
                    >
                        <SalyIamge className="mx-auto" />
                    </NoDataUI>
                </>
            )}


            <DrawerCreate>
                {notificationVisible && (
                    <Notification
                        title="Юридическаое лицо"
                        message="Чтобы создать объект, сначала нужно ввести данные юридического лица во вкладке Администрирование!"
                        onClose={() => setNotificationVisible(false)}
                    />
                )}
                <p>test</p>
            </DrawerCreate>
        </>
    );
};

export default Pos;