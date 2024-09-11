import { Trans, useTranslation } from "react-i18next";
import SalyIamge from "../assets/Saly-1.svg?react";
import React, {useRef, useState} from "react";
import NoDataUI from "../components/ui/NoDataUI.tsx";
import Notification from "../components/ui/Notification.tsx";
import {useButtonCreate, useFilterOpen} from "../components/context/useContext.tsx";
import DrawerCreate from "../components/ui/Drawer/DrawerCreate.tsx";
import OverflowTable from "../components/ui/Table/OverflowTable.tsx";
import {columnsPos} from "../utils/OverFlowTableData.tsx";
import InputLineOption from "../components/ui/InputLine/InputLineOption.tsx";
import InputLineText from "../components/ui/InputLine/InputLineText.tsx";
import Button from "../components/ui/Button/Button.tsx";
import {fetcher, useFetchData} from "../api";
import {SubmitErrorHandler, SubmitHandler, useForm} from "react-hook-form";
import useSWR from "swr";
import {getPos, postCreatePos} from "../services/api/pos";
import {getOrganization, postCreateOrganization} from "../services/api/organization";
const Pos: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [isData, setIsData] = useState(true);
    const [postData, setIsPostData] = useState<PosData>();
    const { data, error, isLoading } = useSWR([`get-pos-7`], () => getPos(7))
    const { data: org, error: orgEr, isLoading: orgLoad } = useSWR([`get-org-7`], () => getOrganization(7));
    const { data: pos, error: posError, mutate: posMutate} = useSWR([`post-pos`], () => postCreatePos(postData, {headers: {Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJ5Y2hlbmtvLXdvcmtAbWFpbC5ydSIsImlkIjo3LCJpYXQiOjE3MjU0MzMyMTEsImV4cCI6MTcyODAyNTIxMX0.u694wJmO2SEDtX0QprKyeM0neBV5EHQokr5O8OvmNHY`}}),
        { revalidateOnMount: false, revalidateIfStale: false, })
    const { buttonOn, setButtonOn } = useButtonCreate();
    const {register, handleSubmit} = useForm<PosPost>();
    const contentRef = useRef<HTMLDivElement>(null);

    const submit: SubmitHandler<PosPost> = posPost => {
        const posData = {
            name: posPost.name,
            monthlyPlan: posPost.monthlyPlan,
            timezone: '36',
            status: 'VALIDATE',
            organizationId: posPost.organizationId,
            address: {
                city: posPost.city,
                location: posPost.location,
            }
        }
        setIsPostData(posData)
        posMutate()
        }

    const errorData: SubmitErrorHandler<PosPost> = data => {
        console.log('err');
    }

    const poses: Pos[] = data?.map((item: any) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

    const orgData = org?.map((organization) => ({
        value: organization.id,
        name: organization.name
    })) || [];
    return (
        <>
            {isData ? (
                <>
                    <div className="mt-8">
                        <OverflowTable
                            tableData={poses}
                            columns={columnsPos}
                            isDisplayEdit={true}
                            isUpdate={true}
                            nameUrl={'/administration/device'}
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

                <form onSubmit={handleSubmit(submit, errorData)}>
                    <span className="font-semibold text-xl md:text-3xl mb-5">Создание объекта</span>
                    <InputLineText
                        title = {"Наименование объекта"}
                        type={'text'}
                        placeholder ={"Например, автомойка"}
                        name={'name'}
                        register={register}
                        required={true}
                    />
                    <InputLineText
                        title = {"Город"}
                        type={'text'}
                        name={'city'}
                        placeholder ={"Город автомойки"}
                        register={register}
                        required={true}
                    />
                    <InputLineText
                        title = {"Адрес"}
                        type={'text'}
                        name={'location'}
                        placeholder ={"Адрес автомойки"}
                        register={register}
                        required={true}
                    />
                    <InputLineText
                        title = {"Месячный план"}
                        type={'number'}
                        name={'monthlyPlan'}
                        defaultValue={'0'}
                        register={register}
                        required={true}
                    />
                    <InputLineOption
                        title = {"Название организации"}
                        placeholder={"Выберите организацию"}
                        type ={"number"}
                        name={'organizationId'}
                        register={register}
                        optionals ={orgData}
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
                            form={true}
                            handleClick ={() => {}}
                        />
                    </div>
                </form>

            </DrawerCreate>
        </>
    );
};

export default Pos;