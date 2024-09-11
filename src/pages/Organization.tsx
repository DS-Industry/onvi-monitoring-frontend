import { Trans, useTranslation } from "react-i18next";
import SalyIamge from "../assets/Saly-11.svg?react";
import React, {useEffect, useState} from "react";
import NoDataUI from "../components/ui/NoDataUI.tsx";
import DrawerCreate from "../components/ui/Drawer/DrawerCreate.tsx";
import {useButtonCreate} from "../components/context/useContext.tsx";
import {columnsOrg} from "../utils/OverFlowTableData.tsx";
import OverflowTable from "../components/ui/Table/OverflowTable.tsx";
import InputLineText from "../components/ui/InputLine/InputLineText.tsx";
import InputLineOption from "../components/ui/InputLine/InputLineOption.tsx";
import Button from "../components/ui/Button/Button.tsx";
import {fetcher, useFetchData} from "../api";
import {SubmitErrorHandler, SubmitHandler, useForm} from "react-hook-form";
import useSWR from "swr";
import {getOrganization, postCreateOrganization} from "../services/api/organization";

const Organization: React.FC = () => {
    const [isData, setIsData] = useState(true);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { t } = useTranslation();
    const [orgData, setIsOrgData] = useState<OrgData>();
    const { data, error, isLoading } = useSWR([`get-org-7`], () => getOrganization(7));
    const { data: org, error: orgError, mutate} = useSWR([`post-org`], () => postCreateOrganization(orgData, {headers: {Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJ5Y2hlbmtvLXdvcmtAbWFpbC5ydSIsImlkIjo3LCJpYXQiOjE3MjU0MzMyMTEsImV4cCI6MTcyODAyNTIxMX0.u694wJmO2SEDtX0QprKyeM0neBV5EHQokr5O8OvmNHY`}}),
        { revalidateOnMount: false, revalidateIfStale: false, })
    const [organizationPost, setOrganizationPost] = useState<OrganizationPost>();
    const organizations: Organization[] = data?.map((item: any) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];
    const {register, handleSubmit} = useForm<OrganizationPost>();

    const submit: SubmitHandler<OrganizationPost> = organizationPost => {
        const organizationData = {
            name: organizationPost.name,
            organizationType: organizationPost.organizationType,
            address: {
                city: organizationPost.city,
                location: organizationPost.location,
            }
        }
        setIsOrgData(organizationData)
        mutate()

    }

    const errorData: SubmitErrorHandler<OrganizationPost> = data => {
        console.log('err');
    }

    return (
        <>
            <DrawerCreate>
                <form onSubmit={handleSubmit(submit, errorData)}>
                    <span className="font-semibold text-xl md:text-3xl mb-5">Новое юридическое лицо</span>
                    <InputLineOption
                        title = {"Тип Юр. лица"}
                        type ={"typeOrg"}
                        optionals ={[
                                { name: "Юридическое лицо", value: "LegalEntity"},
                                { name:"ИП", value: "IndividualEntrepreneur"}
                        ]}
                        name={'organizationType'}
                        register={register}
                    />
                    <InputLineText
                        title = {"Полное наименование"}
                        type={'text'}
                        name={'name'}
                        register={register}
                        required={true}
                    />
                    <InputLineText
                        title = {"Город"}
                        type={'text'}
                        name={'city'}
                        register={register}
                        required={true}
                    />
                    <InputLineText
                        title = {"Адрес"}
                        type={'text'}
                        name={'location'}
                        register={register}
                        required={true}
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

            {isData ? (
                <>
                    <div className="mt-8">
                        <OverflowTable
                            tableData={organizations}
                            columns={columnsOrg}
                            isDisplayEdit={true}
                            isUpdate={true}
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
