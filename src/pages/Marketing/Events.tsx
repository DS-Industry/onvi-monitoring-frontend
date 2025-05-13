import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// import WelcomeIcon from "@icons/Welcome.svg?react";
import ExpandedCard from "@/components/ui/Card/ExpandedCard";
// import BirthdayIcon from "@icons/Birthday.svg?react";
import PresentIcon from "@icons/Present.svg?react";
// import PercentageIcon from "@icons/Percentage.svg?react";
// import DiamondIcon from "@icons/Diamond.svg?react";
import Input from "@/components/ui/Input/Input";
import Icon from "feather-icons-react";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useSWR, { mutate } from "swr";
import { createBenefit, getBenefitActions, getBenefitById, getBenefits, updateBenefit } from "@/services/api/marketing";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import Button from "@/components/ui/Button/Button";
import { Descriptions, Tag, Skeleton } from "antd";

enum BenefitType {
    CASHBACK = "CASHBACK",
    DISCOUNT = "DISCOUNT",
    GIFT_POINTS = "GIFT_POINTS"
}

type Benefit = {
    name: string;
    type: BenefitType;
    bonus: number;
    benefitActionTypeId?: number;
}

type Benefits = {
    id: number;
    name: string;
    benefitType: BenefitType;
    bonus: number;
    benefitActionTypeId?: number;
}

type UpdateBenefit = {
    benefitId: number;
    name?: string;
    bonus?: number;
    benefitType?: BenefitType;
}

const Events: React.FC = () => {
    const { t } = useTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
    // const [isDiscount, setIsDiscount] = useState(false);
    // const [isBonus, setIsBonus] = useState(false);
    // const [time, setTime] = useState("imm");
    // const [visit, setVisit] = useState("one");
    const [benefit, setBenefit] = useState<Benefits[]>([]);
    const [benefitId, setBenefitId] = useState(0);

    // const handleTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setTime(event.target.value);
    // };

    // const handleVisit = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setVisit(event.target.value);
    // };

    const { data: benefitsData } = useSWR([`get-benefits`], () => getBenefits(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: benefitByIdData, isLoading: loadingBenefit } = useSWR(benefitId !== 0 ? [`get-benefit-by-id`, benefitId] : null, () => getBenefitById(benefitId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: benefitsActionData } = useSWR([`get-benefits-actions`], () => getBenefitActions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const benefitActions: { name: string; value: number; }[] = benefitsActionData?.map((ben) => ({ name: ben.props.name, value: ben.props.id })) || [];

    const addBenefit = () => {
        setIsModalOpen(true);
    }

    useEffect(() => {
        if (benefitByIdData?.props.id) {
            setUpdateData({
                benefitId: benefitByIdData.props.id,
                name: benefitByIdData.props.name,
                bonus: benefitByIdData.props.bonus,
                benefitType: benefitByIdData.props.benefitType
            })
        }
    }, [benefitByIdData])

    useEffect(() => {
        const benefits = benefitsData?.map((ben) => ben.props) || [];

        setBenefit(benefits);
    }, [benefitsData])

    const defaultValues: Benefit = {
        name: '',
        type: '' as BenefitType,
        bonus: 0,
        benefitActionTypeId: undefined
    }

    const updateValues: UpdateBenefit = {
        benefitId: benefitId,
        name: undefined,
        bonus: undefined,
        benefitType: undefined
    }

    const [formData, setFormData] = useState(defaultValues);

    const [updateData, setUpdateData] = useState(updateValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { register: updateRegister, handleSubmit: handleSubmitUpdate, setValue: setUpdate } = useFormHook(updateData);

    const { trigger: createBen, isMutating } = useSWRMutation(['create-benefit'], async () => createBenefit({
        name: formData.name,
        type: formData.type,
        bonus: formData.bonus,
        benefitActionTypeId: formData.benefitActionTypeId
    }));

    const { trigger: updateBen, isMutating: updatingBenefit } = useSWRMutation(['update-benefit'], async () => updateBenefit({
        benefitId: updateData.benefitId,
        name: updateData.name,
        bonus: updateData.bonus,
        benefitType: updateData.benefitType
    }));

    type FieldType = "name" | "type" | "bonus" | "benefitActionTypeId";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['bonus', 'benefitActionTypeId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    type Field = "name" | "bonus" | "benefitId" | "benefitType";

    const handleUpdateChange = (field: Field, value: string) => {
        const numericFields = ['limitBenefit'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setUpdateData((prev) => ({ ...prev, [field]: updatedValue }));
        setUpdate(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
    };

    const onSubmit = async () => {
        try {

            const result = await createBen();
            if (result) {
                mutate([`get-benefits`]);
                resetForm();
                setIsModalOpen(false);
            } else {
                throw new Error('Invalid response from API');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const onSubmitUpdate = async () => {
        try {

            const result = await updateBen();
            if (result) {
                mutate([`get-benefits`]);
                resetForm();
                setIsModalOpenUpdate(false);
            } else {
                throw new Error('Invalid response from API');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    return (
        <div>
            <Modal isOpen={isModalOpen}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("marketing.addBen")}</h2>
                    <Close
                        onClick={() => { resetForm(); setIsModalOpen(false); }}
                        className="cursor-pointer text-text01"
                    />
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-text02">
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            title={t("equipment.name")}
                            classname="w-80"
                            inputType="secondary"
                            value={formData.name}
                            changeValue={(e) => handleInputChange('name', e.target.value)}
                            error={!!errors.name}
                            {...register('name', { required: 'Name is required' })}
                            helperText={errors.name?.message || ''}
                        />
                        <DropdownInput
                            title={`${t("marketing.ty")} *`}
                            label={t("warehouse.notSel")}
                            options={[
                                { name: t("marketing.CASHBACK"), value: "CASHBACK" },
                                { name: t("marketing.DISCOUNT"), value: "DISCOUNT" },
                                { name: t("marketing.GIFT_POINTS"), value: "GIFT_POINTS" }
                            ]}
                            classname="w-80"
                            {...register('type', {
                                required: 'Type is required',
                            })}
                            value={formData.type}
                            onChange={(value) => handleInputChange('type', value)}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                        />
                        <Input
                            type="number"
                            title={t("marketing.bonu")}
                            label={t("marketing.enter")}
                            inputType="secondary"
                            classname="w-80"
                            value={formData.bonus}
                            changeValue={(e) => handleInputChange('bonus', e.target.value)}
                            error={!!errors.bonus}
                            {...register('bonus', { required: 'bonus is required' })}
                            helperText={errors.bonus?.message || ''}
                            showIcon={true}
                            IconComponent={<div className="text-text02 text-lg">₽</div>}
                        />
                        <DropdownInput
                            title={`${t("marketing.ty")}`}
                            label={t("warehouse.notSel")}
                            options={benefitActions}
                            classname="w-80"
                            {...register('benefitActionTypeId')}
                            value={formData.benefitActionTypeId}
                            onChange={(value) => handleInputChange('benefitActionTypeId', value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-5">
                        <Button
                            title={"Сбросить"}
                            handleClick={() => { resetForm(); setIsModalOpen(false); }}
                            type="outline"
                        />
                        <Button
                            title={"Сохранить"}
                            form={true}
                            isLoading={isMutating}
                        />
                    </div>
                </form>
            </Modal>
            <Modal isOpen={isModalOpenUpdate}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{benefit.find((item) => item.id === benefitId)?.name || ""}</h2>
                    <Close
                        onClick={() => { setIsModalOpenUpdate(false); }}
                        className="cursor-pointer text-text01"
                    />
                </div>
                {loadingBenefit ? (
                    <div className="w-80 space-y-4">
                        <Skeleton.Input active style={{ width: 320 }} size="default" />
                        <Skeleton.Input active style={{ width: 320 }} size="default" />
                        <Skeleton.Input active style={{ width: 320 }} size="default" />
                        <div className="flex gap-3 mt-5">
                            <Skeleton.Button active />
                            <Skeleton.Button active />
                        </div>
                    </div>
                ) : (<form onSubmit={handleSubmitUpdate(onSubmitUpdate)}>
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            title={t("equipment.name")}
                            classname="w-80"
                            inputType="secondary"
                            value={updateData.name}
                            changeValue={(e) => handleUpdateChange('name', e.target.value)}
                            {...updateRegister('name')}
                        />
                        <Input
                            type="number"
                            title={t("marketing.bonu")}
                            classname="w-80"
                            inputType="secondary"
                            value={updateData.bonus}
                            changeValue={(e) => handleUpdateChange('bonus', e.target.value)}
                            {...updateRegister('bonus')}
                        />
                        <DropdownInput
                            title={`${t("marketing.ty")}`}
                            label={t("warehouse.notSel")}
                            options={[
                                { name: t("marketing.CASHBACK"), value: "CASHBACK" },
                                { name: t("marketing.DISCOUNT"), value: "DISCOUNT" },
                                { name: t("marketing.GIFT_POINTS"), value: "GIFT_POINTS" }
                            ]}
                            classname="w-80"
                            {...updateRegister('benefitType')}
                            value={updateData.benefitType}
                            onChange={(value) => handleUpdateChange('benefitType', value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-5">
                        <Button
                            title={"Сбросить"}
                            handleClick={() => { setIsModalOpenUpdate(false); }}
                            type="outline"
                        />
                        <Button
                            title={"Сохранить"}
                            form={true}
                            isLoading={updatingBenefit}
                        />
                    </div>
                </form>)}
            </Modal>
            <div className="space-y-3">
                <div className="text-text02">
                    <div>{t("marketing.setUp")}</div>
                    <div>{t("marketing.if")}</div>
                </div>
                {/* <ExpandedCard firstText={t("marketing.wel")} secondText={t("marketing.one")} Component={WelcomeIcon}>
                    <div className="pl-14 space-y-4">
                        <div className="flex space-x-4">
                            <div className={`rounded-2xl h-32 w-[360px] ${isDiscount ? "bg-white border-2 border-primary02" : "bg-disabledFill"} py-9 px-5 cursor-pointer`} onClick={() => { setIsDiscount(!isDiscount); setIsBonus(false); }}>
                                <div className={`flex items-center justify-center space-x-2 ${isDiscount ? "text-primary02" : "text-text01"}`}>
                                    <PercentageIcon />
                                    <div className="font-semibold text-lg">{t("marketing.dis")}</div>
                                </div>
                                <div className="flex items-center justify-center text-center">
                                    <div className={`${isDiscount ? "text-text01" : "text-text02"}`}>{t("marketing.give")}</div>
                                </div>
                            </div>
                            <div className={`rounded-2xl h-32 w-[360px] ${isBonus ? "bg-white border-2 border-primary02" : "bg-disabledFill"} py-9 px-10 cursor-pointer`} onClick={() => { setIsBonus(!isBonus); setIsDiscount(false); }}>
                                <div className={`flex items-center justify-center space-x-2 ${isBonus ? "text-primary02" : "text-text01"}`}>
                                    <DiamondIcon />
                                    <div className="font-semibold text-lg">{t("marketing.bon")}</div>
                                </div>
                                <div className="flex items-center justify-center text-center">
                                    <div className={`${isBonus ? "text-text01" : "text-text02"}`}>{t("marketing.credit")}</div>
                                </div>
                            </div>
                        </div>
                        {isDiscount && (
                            <div className="space-y-4">
                                <div className="text-2xl font-semibold text-text01">{t("marketing.calc")}</div>
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <input
                                            type="radio"
                                            name="imm"
                                            value="imm"
                                            checked={time === "imm"}
                                            onChange={handleTime}
                                        />
                                        <div className={`${time === "imm" ? "text-primary02" : "text-text02"}`}>{t("marketing.imm")}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <input
                                            type="radio"
                                            name="fixed"
                                            value="fixed"
                                            checked={time === "fixed"}
                                            onChange={handleTime}
                                        />
                                        <div className={`${time === "fixed" ? "text-primary02" : "text-text02"}`}>{t("marketing.afterF")}</div>
                                    </div>
                                </div>
                                <div className="text-text02">
                                    <div>{t("marketing.ifC")}</div>
                                    <div>{t("marketing.accept")}</div>
                                </div>
                                <div className="flex space-x-4">
                                    <Input
                                        title={t("marketing.size")}
                                        classname="w-20"
                                        value={50}
                                        showIcon={true}
                                        IconComponent={<Icon icon="percent" />}
                                        disabled={true}
                                    />
                                    <DropdownInput
                                        value={undefined}
                                        options={[]}
                                        title={t("marketing.valid")}
                                        classname="w-64"
                                        isDisabled={true}
                                    />
                                </div>
                                <div className="text-lg font-semibold text-text01">{t("marketing.di")}</div>
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <input
                                            type="radio"
                                            name="one"
                                            value="one"
                                            checked={visit === "one"}
                                            onChange={handleVisit}
                                        />
                                        <div className={`${visit === "one" ? "text-primary02" : "text-text02"}`}>{t("marketing.for")}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <input
                                            type="radio"
                                            name="all"
                                            value="all"
                                            checked={visit === "all"}
                                            onChange={handleVisit}
                                        />
                                        <div className={`${visit === "all" ? "text-primary02" : "text-text02"}`}>{t("marketing.forAll")}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isBonus && (
                            <div className="space-y-4">
                                <div className="text-text02">{t("marketing.bo")}</div>
                                <div className="flex space-x-4">
                                    <Input
                                        title={t("marketing.size")}
                                        classname="w-20"
                                        value={50}
                                        showIcon={true}
                                        IconComponent={<Icon icon="percent" />}
                                        disabled={true}
                                    />
                                    <DropdownInput
                                        value={undefined}
                                        options={[]}
                                        title={t("marketing.burnout")}
                                        classname="w-64"
                                        isDisabled={true}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </ExpandedCard>
                <ExpandedCard firstText={t("marketing.birth")} secondText={t("marketing.annual")} Component={BirthdayIcon}>
                    <div className="pl-14">
                        <DropdownInput
                            value={undefined}
                            options={[]}
                            title={t("marketing.respo")}
                            classname="w-64"
                            isDisabled={true}
                        />
                    </div>
                </ExpandedCard>
                <ExpandedCard firstText={t("marketing.present")} secondText={t("marketing.setting")} Component={PresentIcon}>
                    <div className="pl-14 space-y-6">
                        <Input
                            title={t("equipment.name")}
                            label={t("marketing.5")}
                            classname="w-64"
                            disabled={true}
                        />
                        <div>
                            <div className="text-text02">{t("marketing.period")}</div>
                            <div className="flex space-x-2 text-text02 items-center">
                                <div>c</div>
                                <Input
                                    type="date"
                                    classname="w-40"
                                />
                                <div>по</div>
                                <Input
                                    type="date"
                                    classname="w-40"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="text-text02">{t("marketing.num")}</div>
                            <Input
                                classname="w-64"
                                type="number"
                                value={3}
                                disabled={true}
                            />
                        </div>
                        <Input
                            title={t("marketing.dis")}
                            classname="w-64"
                            type="number"
                            value={100}
                            disabled={true}
                            showIcon={true}
                            IconComponent={<Icon icon="percent" />}
                        />
                    </div>
                </ExpandedCard> */}
                {benefit.sort((a, b) => a.name.localeCompare(b.name)).map((ben) => (
                    <ExpandedCard
                        firstText={ben.name}
                        secondText={t(`marketing.${ben.benefitType}`)}
                        Component={PresentIcon}
                        handleClick={() => {
                            setIsModalOpenUpdate(true);
                            setBenefitId(ben.id);
                        }}
                        buttonText={t("marketing.updateBen")}
                    >
                        <div className="pl-0 sm:pl-14 space-y-6">
                            <Descriptions
                                column={1}
                                size="small"
                                labelStyle={{ fontWeight: 500, color: "#595959" }}
                                contentStyle={{ color: "#1F1F1F" }}
                            >
                                <Descriptions.Item label={t("marketing.ty")}>
                                    <Tag color="blue">{t(`marketing.${ben.benefitType}`)}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={t("marketing.bonu")}>
                                    <Tag color="gold">{`${ben.bonus} ${ben.benefitType !== "DISCOUNT" ? "" : "%"}`}</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </ExpandedCard>
                ))}
                <div className="flex space-x-2 items-center text-primary02 cursor-pointer" onClick={addBenefit}>
                    <Icon icon="plus" />
                    <div>{t("marketing.addBen")}</div>
                </div>
            </div>
        </div>
    )
}

export default Events;