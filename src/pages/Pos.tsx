import { Trans, useTranslation } from "react-i18next";
import SalyIamge from "../assets/Saly-1.svg?react";
import React, {useRef, useState} from "react";
import NoDataUI from "../components/ui/NoDataUI.tsx";
import Notification from "../components/ui/Notification.tsx";
import {useButtonCreate, useFilterOpen} from "../components/context/useContext.tsx";
import DrawerCreate from "../components/ui/Drawer/DrawerCreate.tsx";
import OverflowTable from "../components/ui/Table/OverflowTable.tsx";
import {columnsPos, tablePosData} from "../utils/OverFlowTableData.tsx";
import InputLineOption from "../components/ui/InputLine/InputLineOption.tsx";
import InputLineText from "../components/ui/InputLine/InputLineText.tsx";
import Button from "../components/ui/Button/Button.tsx";
const Pos: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [isData, setIsData] = useState(true);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        columnsPos.map((col) => col.key)
    );
    const { buttonOn, setButtonOn } = useButtonCreate();
    const contentRef = useRef<HTMLDivElement>(null);
    const { title, description } = t("home");
    return (
        <>
            {isData ? (
                <>
                    <div className="mt-8">
                        <OverflowTable
                            tableData={tablePosData}
                            columns={columnsPos}
                            selectedColumns={selectedColumns}
                        />
                    </div>
                </>
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

                <span className="font-semibold text-xl md:text-3xl mb-5">Создание объекта</span>
                <InputLineText
                    title = {"Наименование объекта"}
                    placeholder ={"Например, автомойка"}
                />
                <InputLineText
                    title = {"Адрес"}
                    placeholder ={"Адрес автомойки"}
                />
                <InputLineOption
                    title = {"Компания"}
                    type ={"org"}
                    placeholder={"Наименование компании"}
                    optionals ={["МойКа"]}
                />
                <InputLineOption
                    title = {"Тип автомойки"}
                    type ={"typePos"}
                    optionals ={["Мойка самообслуживания", "МСО", "Робот мойка", "МСО + Робот мойка"]}
                />
                <InputLineText
                    title = {"Минимальный шаг суммы заказа"}
                    defaultValue ={"00"}
                />
                <InputLineText
                    title = {"Минимальная сумма заказа"}
                    defaultValue ={"00"}
                />
                <InputLineText
                    title = {"Максимальная сумма заказа"}
                    defaultValue ={"00"}
                />
                <div className="flex justify-end space-x-4">
                    <Button
                        title ='Отменить'
                        type ='outline'
                        handleClick ={() =>
                            setButtonOn(!buttonOn)}
                    />
                    <Button
                        title ='Сохранить'
                        handleClick ={() => {

                        }}
                    />
                </div>

            </DrawerCreate>
        </>
    );
};

export default Pos;