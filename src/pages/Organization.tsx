import { Trans, useTranslation } from "react-i18next";
import SalyIamge from "../assets/Saly-11.svg?react";
import React, {useEffect, useState} from "react";
import NoDataUI from "../components/ui/NoDataUI.tsx";
import DrawerCreate from "../components/ui/Drawer/DrawerCreate.tsx";
import {useButtonCreate} from "../components/context/useContext.tsx";
import {columnsOrg, tableOrgData} from "../utils/OverFlowTableData.tsx";
import OverflowTable from "../components/ui/Table/OverflowTable.tsx";
import InputLineText from "../components/ui/InputLine/InputLineText.tsx";
import InputLineOption from "../components/ui/InputLine/InputLineOption.tsx";
import Button from "../components/ui/Button/Button.tsx";

const Organization: React.FC = () => {
    const [isData, setIsData] = useState(true);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { t } = useTranslation();
    const { title, description } = t("home");
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        columnsOrg.map((col) => col.key)
    );

    return (
        <>
            <DrawerCreate>
                <span className="font-semibold text-xl md:text-3xl mb-5">Новое юридическое лицо</span>
                <InputLineOption
                    title = {"Тип Юр. лица"}
                    type ={"typeOrg"}
                    optionals ={["Юридическое лицо", "ИП"]}
                />
                <InputLineOption
                    title = {"Ставка НДС"}
                    type ={"typeNDS"}
                    placeholder={"Выберите ставку"}
                    optionals ={["20%", "18%", "10%"]}
                />
                <span className=" text-xl md:text-xl mb-5">Юридические реквизиты</span>
                <InputLineText
                    title = {"ИНН"}
                />
                <InputLineText
                    title = {"Полное наименование"}
                />
                <InputLineText
                    title = {"ОКПО"}
                />
                <InputLineText
                    title = {"КПП"}
                />
                <InputLineText
                    title = {"Адрес регистрации"}
                />
                <InputLineText
                    title = {"ОГРН"}
                />
                <span className=" text-xl md:text-xl mb-5">Банковские реквизиты</span>
                <InputLineText
                    title = {"БИК"}
                />
                <InputLineText
                    title = {"Корр. счёт"}
                />
                <InputLineText
                    title = {"Банк"}
                />
                <InputLineText
                    title = {"Расчётный счёт"}
                />
                <InputLineText
                    title = {"Адрес"}
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

            {isData ? (
                <>
                    <div className="mt-8">
                        <OverflowTable
                            tableData={tableOrgData}
                            columns={columnsOrg}
                            selectedColumns={selectedColumns}
                        />
                    </div>
                </>
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
