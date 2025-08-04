import { useButtonCreate, useToast } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import DateInput from "@/components/ui/Input/DateInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import useFormHook from "@/hooks/useFormHook";
import {
  createUserOrganization,
  OrganizationBody,
  postUpdateOrganization,
} from "@/services/api/organization";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { mutate } from "swr";
import useSWRMutation from "swr/mutation";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type OrganizationFormProps = {
  defaultValues: OrganizationBody;
  formData: OrganizationBody;
  setFormData: SetState<OrganizationBody>;
  editOrgId: number;
  setEditOrgId: (id: number) => void;
};

const OrganizationForm: React.FC<OrganizationFormProps> = ({
  defaultValues,
  formData,
  setFormData,
  editOrgId,
  setEditOrgId,
}) => {
  const { t } = useTranslation();
  const { buttonOn, setButtonOn } = useButtonCreate();
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city") || "*";

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createOrganization, isMutating } = useSWRMutation(
    "user/organization",
    async () =>
      createUserOrganization({
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
        dateCertificate: formData.dateCertificate,
      })
  );

  const { trigger: updateOrganization, isMutating: updatingOrganization } =
    useSWRMutation("user/organization", async () =>
      postUpdateOrganization({
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
        dateCertificate: formData.dateCertificate,
      })
    );

  type FieldType =
    | "fullName"
    | "organizationType"
    | "rateVat"
    | "inn"
    | "okpo"
    | "kpp"
    | "addressRegistration"
    | "ogrn"
    | "bik"
    | "correspondentAccount"
    | "bank"
    | "settlementAccount"
    | "addressBank"
    | "certificateNumber"
    | "dateCertificate";

  const handleInputChange = (field: FieldType, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const { showToast } = useToast();

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setEditOrgId(0);
    setButtonOn(false);
  };

  const onSubmit = async () => {
    try {
      if (editOrgId) {
        const result = await updateOrganization();
        if (result) {
          mutate([`get-org`, city]);
          resetForm();
        } else {
          showToast(t("errors.other.passwordChangeError"), "error");
        }
      } else {
        const result = await createOrganization();
        if (result) {
          mutate([`get-org`, city]);
        } else {
          showToast(t("errors.other.passwordChangeError"), "error");
        }
      }
    } catch (error) {
      console.error("Password change error: ", error);
      showToast(t("errors.other.passwordChangeError"), "error");
    }
  };

  const legalOptions = [
    { name: t("organizations.legalEntity"), value: "LegalEntity" },
    { name: t("organizations.ip"), value: "IndividualEntrepreneur" },
  ];

  const vatOptions = [
    { name: t("organizations.withoutVat"), value: "WithoutVAT" },
    { name: "10%", value: "Vat10" },
    { name: "18%", value: "Vat18" },
    { name: "20%", value: "Vat20" },
  ];

  return (
    <div>
      <DrawerCreate onClose={resetForm}>
        <form
          className="space-y-6 w-full max-w-2xl mx-auto p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <span className="font-semibold text-xl md:text-3xl mb-5 text-text01">
            {editOrgId !== 0
              ? t("organizations.update")
              : t("organizations.new")}
          </span>
          <div className="grid grid-cols-1 gap-4">
            <DropdownInput
              title={t("organizations.typeLegal")}
              options={legalOptions}
              inputType="secondary"
              classname="w-80"
              {...register("organizationType", {
                required: editOrgId === 0 && "Organization Type is required",
              })}
              value={formData.organizationType}
              onChange={(value) => handleInputChange("organizationType", value)}
              error={!!errors.organizationType}
              helperText={errors.organizationType?.message}
            />

            <DropdownInput
              title={t("organizations.vatRate")}
              label={t("organizations.selectBet")}
              options={vatOptions}
              inputType="secondary"
              classname="w-80"
              {...register("rateVat", {
                required: editOrgId === 0 && "Rate VAT is required",
              })}
              value={formData.rateVat}
              onChange={(value) => handleInputChange("rateVat", value)}
              error={!!errors.rateVat}
              helperText={errors.rateVat?.message}
            />
          </div>

          <div className="text-sm text-text01 font-normal mb-4 uppercase">
            {t("organizations.legalDetails")}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              title={t("organizations.tin")}
              type="text"
              classname="w-80"
              {...register("inn", {
                required: editOrgId === 0 && "Inn is required",
              })}
              value={formData.inn}
              changeValue={(e) => handleInputChange("inn", e.target.value)}
              error={!!errors.inn}
              helperText={errors.inn?.message}
            />

            <Input
              title={t("organizations.fullName")}
              type="text"
              classname="w-80"
              {...register("fullName", {
                required: editOrgId === 0 && "Full Name is required",
              })}
              value={formData.fullName}
              changeValue={(e) => handleInputChange("fullName", e.target.value)}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />

            <Input
              title={t("organizations.okpo")}
              type="text"
              classname="w-80"
              {...register("okpo", {
                required: editOrgId === 0 && "Okpo is required",
              })}
              value={formData.okpo}
              changeValue={(e) => handleInputChange("okpo", e.target.value)}
              error={!!errors.okpo}
              helperText={errors.okpo?.message}
            />

            <Input
              title={t("organizations.kpp")}
              type="text"
              classname="w-80"
              {...register("kpp")}
              value={formData.kpp}
              changeValue={(e) => handleInputChange("kpp", e.target.value)}
            />
          </div>

          <MultilineInput
            title={t("organizations.address")}
            classname="w-80 sm:w-96"
            {...register("addressRegistration", {
              required: editOrgId === 0 && "Registration Address is required",
            })}
            value={formData.addressRegistration}
            changeValue={(e) =>
              handleInputChange("addressRegistration", e.target.value)
            }
            error={!!errors.addressRegistration}
            helperText={errors.addressRegistration?.message}
          />

          <Input
            title={t("organizations.ogrn")}
            type="text"
            classname="w-80"
            {...register("ogrn", {
              required: editOrgId === 0 && "OGRN is required",
            })}
            value={formData.ogrn}
            changeValue={(e) => handleInputChange("ogrn", e.target.value)}
            error={!!errors.ogrn}
            helperText={errors.ogrn?.message}
          />

          <div className="text-sm text-text01 font-normal mb-4 uppercase">
            {t("organizations.bankDetails")}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              title={t("organizations.bik")}
              type="text"
              classname="w-80"
              {...register("bik", {
                required: editOrgId === 0 && "BIK is required",
              })}
              value={formData.bik}
              changeValue={(e) => handleInputChange("bik", e.target.value)}
              error={!!errors.bik}
              helperText={errors.bik?.message}
            />

            <Input
              title={t("organizations.corres")}
              type="text"
              classname="w-80"
              {...register("correspondentAccount", {
                required:
                  editOrgId === 0 && "Correspondent Account is required",
              })}
              value={formData.correspondentAccount}
              changeValue={(e) =>
                handleInputChange("correspondentAccount", e.target.value)
              }
              error={!!errors.correspondentAccount}
              helperText={errors.correspondentAccount?.message}
            />

            <Input
              title={t("organizations.bank")}
              type="text"
              classname="w-80"
              {...register("bank", {
                required: editOrgId === 0 && "Bank is required",
              })}
              value={formData.bank}
              changeValue={(e) => handleInputChange("bank", e.target.value)}
              error={!!errors.bank}
              helperText={errors.bank?.message}
            />

            <Input
              title={t("organizations.current")}
              type="text"
              classname="w-80"
              {...register("settlementAccount", {
                required: editOrgId === 0 && "Settlement Account is required",
              })}
              value={formData.settlementAccount}
              changeValue={(e) =>
                handleInputChange("settlementAccount", e.target.value)
              }
              error={!!errors.settlementAccount}
              helperText={errors.settlementAccount?.message}
            />
          </div>

          <MultilineInput
            title={t("organizations.add")}
            classname="w-80 sm:w-96"
            {...register("addressBank", {
              required: editOrgId === 0 && "Bank Address is required",
            })}
            value={formData.addressBank}
            changeValue={(e) =>
              handleInputChange("addressBank", e.target.value)
            }
            error={!!errors.addressBank}
            helperText={errors.addressBank?.message}
          />

          <DateInput
            title={t("finance.dat")}
            classname="w-40"
            value={
              formData.dateCertificate ? dayjs(formData.dateCertificate) : null
            }
            changeValue={(date) =>
              handleInputChange(
                "dateCertificate",
                date ? date.toDate() : undefined
              )
            }
            {...register("dateCertificate")}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Button
              title={t("organizations.cancel")}
              type="outline"
              handleClick={() => {
                setButtonOn(!buttonOn);
                resetForm();
              }}
            />
            <Button
              title={t("organizations.save")}
              form={true}
              isLoading={editOrgId !== 0 ? updatingOrganization : isMutating}
            />
          </div>
        </form>
      </DrawerCreate>
    </div>
  );
};

export default OrganizationForm;
