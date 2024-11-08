import SalyIamge from "@/assets/Saly-11.svg?react";
import React, { useState } from "react";
import NoDataUI from "@ui/NoDataUI.tsx";
import DrawerCreate from "@ui/Drawer/DrawerCreate.tsx";
import { useButtonCreate } from "@/components/context/useContext.tsx";
import { columnsOrg } from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import Button from "@ui/Button/Button.tsx";
import useSWR, { mutate } from "swr";
import { getOrganization, postUpdateOrganization } from "@/services/api/organization/index.ts";
import DropdownInput from "@ui/Input/DropdownInput.tsx";
import Input from "@ui/Input/Input.tsx";
import MultilineInput from "@ui/Input/MultilineInput.tsx";
import useFormHook from "@/hooks/useFormHook.ts";
import useSWRMutation from "swr/mutation";
import { createUserOrganization } from "@/services/api/organization/index.ts";
import Filter from "@/components/ui/Filter/Filter.tsx";
import SearchInput from "@/components/ui/Input/SearchInput.tsx";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useTranslation } from "react-i18next";

type OrganizationResponse = {
    id: number;
    name: string;
    slug: string;
    address: string;
    organizationStatus: string;
    organizationType: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: number;
}

const Organization: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { data, isLoading: loadingOrg } = useSWR([`get-org`], () => getOrganization());
    const [isEditMode, setIsEditMode] = useState(false);
    const [editOrgId, setEditOrgId] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState(''); 
    const organizations: OrganizationResponse[] = data
        ?.filter((item: { name: string }) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) 
        .map((item: OrganizationResponse) => item)
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

    type FieldType = "fullName" | "organizationType" | "rateVat" | "inn" | "okpo" | "kpp" | "addressRegistration" | "ogrn" | "bik" | "correspondentAccount" | "bank" | "settlementAccount" | "addressBank" | "certificateNumber" | "dateCertificate";

    const handleInputChange = (field: FieldType, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValue(field, value); 
    };

    const handleUpdate = (id: number) => {
        setEditOrgId(id); 
        setIsEditMode(true);
        setButtonOn(true); 
        console.log(id);
        console.log(isEditMode);
        const orgToEdit = organizations.find((org) => org.id === id);
        console.log(orgToEdit);
        if (orgToEdit) {
            setFormData({
                fullName: orgToEdit.name,
                organizationType: orgToEdit.organizationType,
                rateVat: formData.rateVat,
                inn: formData.inn,
                okpo: formData.okpo,
                kpp: formData.kpp,
                addressRegistration: orgToEdit.address,
                ogrn: formData.ogrn,
                bik: formData.bik,
                correspondentAccount: formData.correspondentAccount,
                bank: formData.bank,
                settlementAccount: formData.settlementAccount,
                addressBank: formData.addressBank,
                certificateNumber: formData.certificateNumber,
                dateCertificate: formData.dateCertificate,
            });
        }
    };


    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditOrgId(0);
        setButtonOn(false); 
    };

    const onSubmit = async (data: unknown) => {
        console.log('Form data:', data);
        // Handle form submission logic here
        try {
            if (editOrgId) {
                const result = await updateOrganization();
                console.log(result);
                if (result) {
                    console.log(result);
                    mutate([`get-org`]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createOrganization();
                if (result) {
                    console.log(result);
                    mutate([`get-org`]);
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
                    <span className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("organizations.new")}</span>
                    <DropdownInput
                        title={t("organizations.typeLegal")}
                        options={[
                            { name: t("organizations.legalEntity"), value: "LegalEntity" },
                            { name: t("organizations.ip"), value: "IndividualEntrepreneur" }
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
                        title={t("organizations.vatRate")}
                        label={t("organizations.selectBet")}
                        type={"typeOrg"}
                        options={[
                            { name: t("organizations.withoutVat"), value: "WithoutVAT" },
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
                    <div className="text-sm text-text01 font-normal mb-4 uppercase">{t("organizations.legalDetails")}</div>
                    <Input
                        title={t("organizations.tin")}
                        type="text"
                        classname="w-96"
                        {...register('inn', { required: !isEditMode && 'Inn is required' })}
                        value={formData.inn}
                        changeValue={(e) => handleInputChange('inn', e.target.value)}
                        error={!!errors.inn}
                        helperText={errors.inn?.message}
                    />
                    <Input
                        title={t("organizations.fullName")}
                        type={'text'}
                        classname="w-96"
                        {...register('fullName', { required: !isEditMode && 'Full Name is required' })}
                        value={formData.fullName}
                        changeValue={(e) => handleInputChange('fullName', e.target.value)}
                        error={!!errors.fullName}
                        helperText={errors.fullName?.message}
                    />
                    <Input
                        title={t("organizations.okpo")}
                        type="text"
                        classname="w-96"
                        {...register('okpo', { required: !isEditMode && 'Okpo is required' })}
                        value={formData.okpo}
                        changeValue={(e) => handleInputChange('okpo', e.target.value)}
                        error={!!errors.okpo}
                        helperText={errors.okpo?.message}
                    />
                    <Input
                        title={t("organizations.kpp")}
                        type="text"
                        classname="w-96"
                        {...register('kpp')}
                        value={formData.kpp}
                        changeValue={(e) => handleInputChange('kpp', e.target.value)}
                    />
                    <MultilineInput
                        title={t("organizations.address")}
                        classname="w-96"
                        {...register('addressRegistration', { required: !isEditMode && 'Registration Address is required' })}
                        value={formData.addressRegistration}
                        changeValue={(e) => handleInputChange('addressRegistration', e.target.value)}
                        error={!!errors.addressRegistration}
                        helperText={errors.addressRegistration?.message}
                    />
                    <Input
                        title={t("organizations.ogrn")}
                        type="text"
                        classname="w-96"
                        {...register('ogrn', { required: !isEditMode && 'OGRN is required' })}
                        value={formData.ogrn}
                        changeValue={(e) => handleInputChange('ogrn', e.target.value)}
                        error={!!errors.ogrn}
                        helperText={errors.ogrn?.message}
                    />
                    <div className="text-sm text-text01 font-normal mb-4 uppercase">{t("organizations.bankDetails")}</div>
                    <Input
                        title={t("organizations.bik")}
                        type="text"
                        classname="w-96"
                        {...register('bik', { required: !isEditMode && 'BIK is required' })}
                        value={formData.bik}
                        changeValue={(e) => handleInputChange('bik', e.target.value)}
                        error={!!errors.bik}
                        helperText={errors.bik?.message}
                    />
                    <Input
                        title={t("organizations.corres")}
                        type="text"
                        classname="w-96"
                        {...register('correspondentAccount', { required: !isEditMode && 'Correspondent Account is required' })}
                        value={formData.correspondentAccount}
                        changeValue={(e) => handleInputChange('correspondentAccount', e.target.value)}
                        error={!!errors.correspondentAccount}
                        helperText={errors.correspondentAccount?.message}
                    />
                    <Input
                        title={t("organizations.bank")}
                        type="text"
                        classname="w-96"
                        {...register('bank', { required: !isEditMode && 'Bank is required' })}
                        value={formData.bank}
                        changeValue={(e) => handleInputChange('bank', e.target.value)}
                        error={!!errors.bank}
                        helperText={errors.bank?.message}
                    />
                    <Input
                        title={t("organizations.current")}
                        type="text"
                        classname="w-96"
                        {...register('settlementAccount', { required: !isEditMode && 'Settlement Account is required' })}
                        value={formData.settlementAccount}
                        changeValue={(e) => handleInputChange('settlementAccount', e.target.value)}
                        error={!!errors.settlementAccount}
                        helperText={errors.settlementAccount?.message}
                    />
                    <MultilineInput
                        title={t("organizations.add")}
                        classname="w-96"
                        {...register('addressBank', { required: !isEditMode && 'Bank Address is required' })}
                        value={formData.addressBank}
                        changeValue={(e) => handleInputChange('addressBank', e.target.value)}
                        error={!!errors.addressBank}
                        helperText={errors.addressBank?.message}
                    />

                    <div className="flex justify-end space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => { setButtonOn(!buttonOn); resetForm(); }} />
                        <Button
                            title={t("organizations.save")}
                            form={true}
                            isLoading={isMutating}
                            handleClick={() => { }} />
                    </div>
                </form>
            </DrawerCreate>

            {
                loadingOrg ? (<TableSkeleton columnCount={columnsOrg.length} />)
                    :
                    organizations.length > 0 ? (
                        <>
                            <Filter count={organizations.length} searchTerm={searchTerm} setSearchTerm={handleSearchChange}>
                                {/* Pass any filter inputs you need here */}
                                <div className="flex">
                                    <SearchInput
                                        placeholder="Filter by name..."
                                        classname="w-64 mr-5 mb-2"
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
                                />
                            </div>
                        </>
                    ) : (
                        <NoDataUI
                            title={t("organizations.noLegal")}
                            description={t("organizations.addLegal")}
                        >
                            <SalyIamge className="mx-auto" />
                        </NoDataUI>
                    )}
        </>
    );
};

export default Organization;
