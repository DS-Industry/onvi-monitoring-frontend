import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Profile from "@icons/ProfileIcon.svg?react";
import ExpandedCard from "@ui/Card/ExpandedCard";
import Input from "@/components/ui/Input/Input";
import PercentageIcon from "@icons/Percentage.svg?react";
import DiamondIcon from "@icons/Diamond.svg?react";
import Icon from 'feather-icons-react';
import { useLocation } from "react-router-dom";
import useFormHook from "@/hooks/useFormHook";
import { createTier, getBenefits, getTierById, getTiers, updateTier } from "@/services/api/marketing";
import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button/Button";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import useSWR, { mutate } from "swr";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import { Transfer } from "antd";

type Tier = {
    name: string;
    description?: string;
    loyaltyProgramId: number;
    limitBenefit: number;
}

type TierUpdate = {
    loyaltyTierId: number;
    description?: string;
    benefitIds: number[];
}

type TierType = {
    id: number;
    firstText: string;
    secondText: string;
    name: string;
    description?: string;
    loyaltyProgramId: number;
    limitBenefit: number;
}

const Levels: React.FC = () => {
    const { t } = useTranslation();

    const [isDiscount, setIsDiscount] = useState(false);
    const [isBonus, setIsBonus] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
    const [tiers, setTiers] = useState<TierType[]>([]);
    const [tierId, setTierId] = useState(0);
    const location = useLocation();

    const addTier = () => {
        setIsModalOpen(true);
    };

    const { data: tiersData } = useSWR([`get-tiers`, location.state.ownerId], () => getTiers({
        programId: location.state.ownerId
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: tierByIdData } = useSWR(tierId !== 0 ? [`get-tier-by-id`, tierId] : null, () => getTierById(tierId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: benefitsData } = useSWR([`get-benefits`], () => getBenefits(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const benefits =
        benefitsData?.map((ben) => ({
            key: String(ben.props.id),
            title: ben.props.name,
            value: ben.props.id
        })) || [];

    useEffect(() => {
        if(tierByIdData?.id) {
            setUpdateData({
                loyaltyTierId: tierByIdData.id,
                description: tierByIdData.description,
                benefitIds: tierByIdData.benefitIds
            })
        }
    }, [tierByIdData])

    useEffect(() => {
        const tiersArray = tiersData?.map((tier) => tier.props) || [];
        if (tiersArray.length > 0) {
            const tiers: TierType[] = tiersArray.map((item) => ({
                id: item.id,
                firstText: t("marketing.newbie"),
                secondText: "от 0 ₽ | Бонусы",
                name: item.name,
                description: item.description,
                loyaltyProgramId: item.loyaltyProgramId,
                limitBenefit: item.limitBenefit
            }));
            setTiers(tiers);
        }
    }, [t, tiersData])

    const [selectedOption, setSelectedOption] = useState<string>("percent");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(event.target.value);
    };

    const defaultValues: Tier = {
        name: '',
        description: undefined,
        loyaltyProgramId: location.state.ownerId,
        limitBenefit: 0
    }

    const updateValues: TierUpdate = {
        loyaltyTierId: tierId,
        description: "",
        benefitIds: []
    }

    const [formData, setFormData] = useState(defaultValues);

    const [updateData, setUpdateData] = useState(updateValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { register: updateRegister, handleSubmit: handleSubmitUpdate, setValue: setUpdate } = useFormHook(updateData);

    const { trigger: createTi, isMutating } = useSWRMutation(['create-loyalty-tier'], async () => createTier({
        name: formData.name,
        description: formData.description,
        loyaltyProgramId: formData.loyaltyProgramId,
        limitBenefit: formData.limitBenefit
    }));

    const { trigger: updateTi, isMutating: updatingTier } = useSWRMutation(['update-loyalty-tier'], async () => updateTier({
        loyaltyTierId: updateData.loyaltyTierId,
        description: updateData.description,
        benefitIds: updateData.benefitIds
    }));

    type FieldType = "name" | "description" | "loyaltyProgramId" | "limitBenefit";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['limitBenefit'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    type Field = "description" | "loyaltyTierId" | "benefitIds" | `benefitIds.${number}`;

    const handleUpdateChange = (field: Field, value: string) => {
        const numericFields = ['limitBenefit'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setUpdateData((prev) => ({ ...prev, [field]: updatedValue }));
        setUpdate(field, value);
    };

    const handleTransfer = (nextTargetKeys: string[]) => {
        const numericKeys = nextTargetKeys.map((key) => Number(key));
        setUpdateData((prev) => ({ ...prev, benefitIds: numericKeys }));
        setUpdate("benefitIds", numericKeys);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        try {

            const result = await createTi();
            if (result) {
                console.log('API Response:', result);
                mutate([`get-tiers`]);
                resetForm();
                setIsModalOpen(false);
            } else {
                throw new Error('Invalid response from API');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const onSubmitUpdate = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        try {

            const result = await updateTi();
            if (result) {
                console.log('API Response:', result);
                mutate([`get-tiers`]);
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
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("marketing.addLevel")}</h2>
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
                        <MultilineInput
                            title={t("warehouse.desc")}
                            classname="w-80"
                            inputType="secondary"
                            value={formData.description}
                            changeValue={(e) => handleInputChange('description', e.target.value)}
                            {...register('description')}
                        />
                        <Input
                            type="number"
                            title={t("marketing.maxNo")}
                            label={t("marketing.enter")}
                            inputType="secondary"
                            classname="w-80"
                            value={formData.limitBenefit}
                            changeValue={(e) => handleInputChange('limitBenefit', e.target.value)}
                            error={!!errors.limitBenefit}
                            {...register('limitBenefit', { required: 'limitBenefit is required' })}
                            helperText={errors.limitBenefit?.message || ''}
                            showIcon={true}
                            IconComponent={<div className="text-text02 text-lg">₽</div>}
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
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("marketing.updateLevel")}</h2>
                    <Close
                        onClick={() => { setIsModalOpenUpdate(false); }}
                        className="cursor-pointer text-text01"
                    />
                </div>
                <form onSubmit={handleSubmitUpdate(onSubmitUpdate)} className="space-y-4 text-text02">
                    <div className="grid grid-cols-1 gap-4">
                        <MultilineInput
                            title={t("warehouse.desc")}
                            classname="w-80"
                            inputType="secondary"
                            value={updateData.description}
                            changeValue={(e) => handleUpdateChange('description', e.target.value)}
                            {...updateRegister('description')}
                        />
                        <Transfer
                            dataSource={benefits}
                            targetKeys={updateData.benefitIds.map(String)} // Convert number[] to string[] for Transfer
                            onChange={handleTransfer}
                            render={(item) => item.title}
                            showSearch
                            listStyle={{
                                width: 250,
                                height: 300,
                            }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-5">
                        <Button
                            title={"Сбросить"}
                            handleClick={() => setIsModalOpenUpdate(false)}
                            type="outline"
                        />
                        <Button
                            title={"Сохранить"}
                            form={true}
                            isLoading={updatingTier}
                        />
                    </div>
                </form>
            </Modal>
            <div className="space-y-3">
                <div className="text-text02">
                    <div>{t("marketing.create")}</div>
                    <div>{t("marketing.toMan")}</div>
                </div>
                {tiers.map((tier) => (
                    <ExpandedCard
                        key={tier.id}
                        firstText={tier.name}
                        secondText={tier.description || ""}
                        Component={Profile}
                        handleClick={() => { setIsModalOpenUpdate(true); setTierId(tier.id); }}
                        buttonText={t("marketing.updateLevel")}
                    >
                        <div className="pl-14 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex text-text01 space-x-1">
                                <div>{t("marketing.you")}</div>
                                <div className="font-semibold">{t("marketing.only")}</div>
                                <div>{t("marketing.disco")}</div>
                            </div>
                            <div className="flex space-x-4">
                                <div className={`rounded-2xl h-36 w-[360px] ${isDiscount ? "bg-white border-2 border-primary02" : "bg-disabledFill"} py-9 px-5 cursor-pointer`} onClick={() => { setIsDiscount(!isDiscount); setIsBonus(false); }}>
                                    <div className={`flex items-center justify-center space-x-2 ${isDiscount ? "text-primary02" : "text-text01"}`}>
                                        <PercentageIcon />
                                        <div className="font-semibold text-lg">{t("marketing.dis")}</div>
                                    </div>
                                    <div className="flex items-center justify-center text-center">
                                        <div className={`${isDiscount ? "text-text01" : "text-text02"}`}>{t("marketing.retain")}</div>
                                    </div>
                                </div>
                                <div className={`rounded-2xl h-36 w-[360px] ${isBonus ? "bg-white border-2 border-primary02" : "bg-disabledFill"} py-9 px-10 cursor-pointer`} onClick={() => { setIsBonus(!isBonus); setIsDiscount(false); }}>
                                    <div className={`flex items-center justify-center space-x-2 ${isBonus ? "text-primary02" : "text-text01"}`}>
                                        <DiamondIcon />
                                        <div className="font-semibold text-lg">{t("marketing.bon")}</div>
                                    </div>
                                    <div className="flex items-center justify-center text-center">
                                        <div className={`${isBonus ? "text-text01" : "text-text02"}`}>{t("marketing.award")}</div>
                                    </div>
                                </div>
                            </div>
                            {isDiscount && (
                                <Input
                                    label={t("marketing.enterDisc")}
                                    inputType="primary"
                                    classname="w-80"
                                    value={"3"}
                                    showIcon={true}
                                    IconComponent={<Icon icon="percent" />}
                                />
                            )}
                            {isBonus && (
                                <div className="space-y-3">
                                    <div className="font-semibold text-2xl text-text01">{t("marketing.ac")}</div>
                                    <div>
                                        <div className="flex space-x-2">
                                            <input
                                                type="radio"
                                                name="marketing"
                                                value="percent"
                                                checked={selectedOption === "percent"}
                                                onChange={handleChange}
                                            />
                                            <div className={`${selectedOption === "percent" ? "text-primary02" : "text-text02"}`}>{t("marketing.per")}</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <input
                                                type="radio"
                                                name="marketing"
                                                value="fixed"
                                                checked={selectedOption === "fixed"}
                                                onChange={handleChange}
                                            />
                                            <div className={`${selectedOption === "fixed" ? "text-primary02" : "text-text02"}`}>{t("marketing.fix")}</div>
                                        </div>
                                    </div>
                                    {selectedOption === "percent" && (
                                        <Input
                                            label={t("marketing.enterPer")}
                                            inputType="primary"
                                            classname="w-80"
                                            value={"3"}
                                            showIcon={true}
                                            IconComponent={<Icon icon="percent" />}
                                        />
                                    )}
                                    {selectedOption === "fixed" && (
                                        <Input
                                            label={t("marketing.enterBon")}
                                            inputType="primary"
                                            classname="w-80"
                                            value={"10"}
                                            showIcon={true}
                                            IconComponent={<div className="text-text02 text-lg">₽</div>}
                                        />
                                    )}

                                </div>
                            )}
                        </div>
                    </ExpandedCard>
                ))}
                <div className="flex flex-col md:flex-row space-x-2">
                    <div className="flex space-x-2 items-center text-primary02 cursor-pointer w-28" onClick={addTier}>
                        <Icon icon="plus" />
                        <div>{t("marketing.addLevel")}</div>
                    </div>
                    <div className="text-text02">{t("marketing.levelsAre")}</div>
                </div>
            </div>
        </div>
    )
}

export default Levels;