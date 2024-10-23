import { Trans, useTranslation } from "react-i18next";
import SalyIamge from "../assets/Saly-11.svg?react";
import React, { useEffect, useState } from "react";
import NoDataUI from "../components/ui/NoDataUI.tsx";
import DrawerCreate from "../components/ui/Drawer/DrawerCreate.tsx";
import { useButtonCreate } from "../components/context/useContext.tsx";
import { columnsOrg } from "../utils/OverFlowTableData.tsx";
import OverflowTable from "../components/ui/Table/OverflowTable.tsx";
import InputLineText from "../components/ui/InputLine/InputLineText.tsx";
import InputLineOption from "../components/ui/InputLine/InputLineOption.tsx";
import Button from "../components/ui/Button/Button.tsx";
import { fetcher, useFetchData } from "../api";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import useSWR from "swr";
import { getOrganization, postCreateOrganization, postUpdateOrganization } from "../services/api/organization";
import DropdownInput from "@ui/Input/DropdownInput.tsx";
import Input from "@ui/Input/Input.tsx";
import MultilineInput from "@ui/Input/MultilineInput.tsx";
import useFormHook from "@/hooks/useFormHook.ts";
import useSWRMutation from "swr/mutation";
import { createUserOrganization } from "@/services/api/platform/index.ts";
import { useUser } from "@/hooks/useUserStore.ts";
import Filter from "@/components/ui/Filter/Filter.tsx";
import SearchInput from "@/components/ui/Input/SearchInput.tsx";
import CustomSkeleton from "@/utils/CustomSkeleton.tsx";

const Organization: React.FC = () => {
    const { buttonOn, setButtonOn } = useButtonCreate();
    const user = useUser();
    const { data, error, isLoading: loadingOrg } = useSWR([`get-org-7`], () => getOrganization(user.id));
    const [isEditMode, setIsEditMode] = useState(false);
    const [editOrgId, setEditOrgId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const organizations: any[] = data
        ?.filter((item: any) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) // Filter poses by search term
        .map((item: any) => item)
        .sort((a, b) => a.id - b.id) || [];

    const defaultValues = {
        fullName: '',
        organizationType: '',
        rateVat: '',
        inn: '',
        okpo: '',
        kpp: '',
        addressRegistration: '',
        ogrn: '',
        bik: '',
        correspondentAccount: '',
        bank: '',
        settlementAccount: '',
        addressBank: '',
        certificateNumber: '',
        dateCertificate: ''
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createOrganization, isMutating } = useSWRMutation('user/organization', async () => createUserOrganization({
        fullName: formData.fullName,
        organizationType: formData.organizationType,
        rateVat: formData.rateVat,
        inn: formData.inn,
        okpo: formData.okpo,
        kpp: formData.kpp,
        addressRegistration: formData.addressRegistration,
        ogrn: formData.ogrn,
        bik: formData.bik,
        correspondentAccount: formData.correspondentAccount,
        bank: formData.bank,
        settlementAccount: formData.settlementAccount,
        addressBank: formData.addressBank,
    }));

    const { trigger: updateOrganization } = useSWRMutation('user/organization', async () => postUpdateOrganization({
        organizationId: editOrgId,
        fullName: formData.fullName,
        organizationType: formData.organizationType,
        rateVat: formData.rateVat,
        inn: formData.inn,
        okpo: formData.okpo,
        kpp: formData.kpp,
        addressRegistration: formData.addressRegistration,
        ogrn: formData.ogrn,
        bik: formData.bik,
        correspondentAccount: formData.correspondentAccount,
        bank: formData.bank,
        settlementAccount: formData.settlementAccount,
        addressBank: formData.addressBank,
    }))

    const handleInputChange = (field: any, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValue(field, value); // Update react-hook-form's internal value
    };

    const handleUpdate = (id: number) => {
        setEditOrgId(id); // Set the ID of the organization to be updated
        setIsEditMode(true); // Enable edit mode
        setButtonOn(true); // Open the drawer
        console.log(id);
        console.log(isEditMode);
        // Find the organization by ID and set it to formData
        const orgToEdit = organizations.find((org) => org.id === id);
        console.log(orgToEdit);
        if (orgToEdit) {
            setFormData({
                fullName: orgToEdit.name,
                organizationType: orgToEdit.organizationType,
                rateVat: orgToEdit.rateVat,
                inn: orgToEdit.inn,
                okpo: orgToEdit.okpo,
                kpp: orgToEdit.kpp,
                addressRegistration: orgToEdit.address,
                ogrn: orgToEdit.ogrn,
                bik: orgToEdit.bik,
                correspondentAccount: orgToEdit.correspondentAccount,
                bank: orgToEdit.bank,
                settlementAccount: orgToEdit.settlementAccount,
                addressBank: orgToEdit.addressBank,
                certificateNumber: orgToEdit.certificateNumber,
                dateCertificate: orgToEdit.dateCertificate,
            });
        }
    };


    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditOrgId(null);
        setButtonOn(false); // Close the Drawer
    };

    const onSubmit = async (data: any) => {
        console.log('Form data:', data);
        // Handle form submission logic here
        try {
            if (editOrgId) {
                const result = await updateOrganization();
                console.log(result);
                if (result) {
                    console.log(result);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createOrganization();
                if (result) {
                    console.log(result);
                } else {
                    throw new Error('Invalid org data. Please try again.');
                }
            }
        } catch (error) {
            console.log("Password change error: ", error);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    return (
        <>
            <DrawerCreate>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <span className="font-semibold text-xl md:text-3xl mb-5">Новое юридическое лицо</span>
                    <DropdownInput
                        title="Тип Юр. лица"
                        options={[
                            { name: "Юридическое лицо", value: "LegalEntity" },
                            { name: "ИП", value: "IndividualEntrepreneur" }
                        ]}
                        inputType="secondary"
                        classname="w-64"
                        {...register('organizationType', { required: !isEditMode && 'Organization Type is required' })}
                        value={formData.organizationType}
                        onChange={(value) => handleInputChange('organizationType', value)}
                        error={!!errors.organizationType}
                        helperText={errors.organizationType?.message}
                    />
                    <DropdownInput
                        title="Ставка НДС"
                        label="Выберите ставку"
                        type={"typeOrg"}
                        options={[
                            { name: "Без НДС", value: "WithoutVAT" },
                            { name: "10%", value: "Vat10" },
                            { name: "18%", value: "Vat18" },
                            { name: "20%", value: "Vat20" }
                        ]}
                        inputType="primary"
                        classname="w-64"
                        {...register('rateVat', { required: !isEditMode && 'Rate VAT is required' })}
                        value={formData.rateVat}
                        onChange={(value) => handleInputChange('rateVat', value)}
                        error={!!errors.rateVat}
                        helperText={errors.rateVat?.message}
                    />
                    <div className="text-sm text-text01 font-normal mb-4 uppercase">Юридические реквизиты</div>
                    <Input
                        title="ИНН"
                        type="text"
                        classname="w-96"
                        {...register('inn', { required: !isEditMode && 'Inn is required' })}
                        value={formData.inn}
                        changeValue={(e) => handleInputChange('inn', e.target.value)}
                        error={!!errors.inn}
                        helperText={errors.inn?.message}
                    />
                    <Input
                        title={"Полное наименование"}
                        type={'text'}
                        classname="w-96"
                        {...register('fullName', { required: !isEditMode && 'Full Name is required' })}
                        value={formData.fullName}
                        changeValue={(e) => handleInputChange('fullName', e.target.value)}
                        error={!!errors.fullName}
                        helperText={errors.fullName?.message}
                    />
                    <Input
                        title="ОКПО"
                        type="text"
                        classname="w-96"
                        {...register('okpo', { required: !isEditMode && 'Okpo is required' })}
                        value={formData.okpo}
                        changeValue={(e) => handleInputChange('okpo', e.target.value)}
                        error={!!errors.okpo}
                        helperText={errors.okpo?.message}
                    />
                    <Input
                        title="КПП"
                        type="text"
                        classname="w-96"
                        {...register('kpp')}
                        value={formData.kpp}
                        changeValue={(e) => handleInputChange('kpp', e.target.value)}
                    />
                    <MultilineInput
                        title="Адрес регистрации"
                        classname="w-96"
                        {...register('addressRegistration', { required: !isEditMode && 'Registration Address is required' })}
                        value={formData.addressRegistration}
                        changeValue={(e) => handleInputChange('addressRegistration', e.target.value)}
                        error={!!errors.addressRegistration}
                        helperText={errors.addressRegistration?.message}
                    />
                    <Input
                        title="ОГРН"
                        type="text"
                        classname="w-96"
                        {...register('ogrn', { required: !isEditMode && 'OGRN is required' })}
                        value={formData.ogrn}
                        changeValue={(e) => handleInputChange('ogrn', e.target.value)}
                        error={!!errors.ogrn}
                        helperText={errors.ogrn?.message}
                    />
                    <div className="text-sm text-text01 font-normal mb-4 uppercase">Банковские реквизиты</div>
                    <Input
                        title="БИК"
                        type="text"
                        classname="w-96"
                        {...register('bik', { required: !isEditMode && 'BIK is required' })}
                        value={formData.bik}
                        changeValue={(e) => handleInputChange('bik', e.target.value)}
                        error={!!errors.bik}
                        helperText={errors.bik?.message}
                    />
                    <Input
                        title="Корр. счёт"
                        type="text"
                        classname="w-96"
                        {...register('correspondentAccount', { required: !isEditMode && 'Correspondent Account is required' })}
                        value={formData.correspondentAccount}
                        changeValue={(e) => handleInputChange('correspondentAccount', e.target.value)}
                        error={!!errors.correspondentAccount}
                        helperText={errors.correspondentAccount?.message}
                    />
                    <Input
                        title="Банк"
                        type="text"
                        classname="w-96"
                        {...register('bank', { required: !isEditMode && 'Bank is required' })}
                        value={formData.bank}
                        changeValue={(e) => handleInputChange('bank', e.target.value)}
                        error={!!errors.bank}
                        helperText={errors.bank?.message}
                    />
                    <Input
                        title="Расчётный счёт"
                        type="text"
                        classname="w-96"
                        {...register('settlementAccount', { required: !isEditMode && 'Settlement Account is required' })}
                        value={formData.settlementAccount}
                        changeValue={(e) => handleInputChange('settlementAccount', e.target.value)}
                        error={!!errors.settlementAccount}
                        helperText={errors.settlementAccount?.message}
                    />
                    <MultilineInput
                        title="Адрес"
                        classname="w-96"
                        {...register('addressBank', { required: !isEditMode && 'Bank Address is required' })}
                        value={formData.addressBank}
                        changeValue={(e) => handleInputChange('addressBank', e.target.value)}
                        error={!!errors.addressBank}
                        helperText={errors.addressBank?.message}
                    />

                    <div className="flex justify-end space-x-4">
                        <Button
                            title='Отменить'
                            type='outline'
                            handleClick={() => { setButtonOn(!buttonOn); resetForm(); }} />
                        <Button
                            title='Сохранить'
                            form={true}
                            isLoading={isMutating}
                            handleClick={() => { }} />
                    </div>
                </form>
            </DrawerCreate>

            {
                loadingOrg ? (<CustomSkeleton type="table" columnCount={columnsOrg.length} />)
                    :
                    organizations.length > 0 ? (
                        <>
                            <Filter count={organizations.length} searchTerm={searchTerm} setSearchTerm={handleSearchChange}>
                                {/* Pass any filter inputs you need here */}
                                <div className="flex">
                                    <SearchInput
                                        placeholder="Filter by name..."
                                        classname="w-64 mr-5"
                                        searchType="outlined"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </Filter>
                            <div className="mt-8">
                                <OverflowTable
                                    tableData={organizations}
                                    columns={columnsOrg}
                                    isDisplayEdit={true}
                                    isUpdate={true}
                                    onUpdate={handleUpdate}
                                    isLoading={loadingOrg}
                                />
                            </div>
                        </>
                    ) : (
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
