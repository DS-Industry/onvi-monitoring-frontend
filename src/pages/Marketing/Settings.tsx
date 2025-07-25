import React, { useEffect, useState } from "react";
import BonusImage from "@icons/BasicBonus.svg?react";
import { useTranslation } from "react-i18next";
import DropdownInput from "@ui/Input/DropdownInput";
import ExpandedCard from "@ui/Card/ExpandedCard";
import DiamondImage from "@icons/DiamondIcon.svg?react";
import Input from "@/components/ui/Input/Input";
import Alert from "@icons/AlertTriangle.svg?react";
import DiamondOne from "@/assets/DiamondOne.png";
import TwoArrow from "@/assets/TwoArrow.png";
import { Select, Skeleton } from 'antd';
import useSWR, { mutate } from "swr";
import { getPlacement } from "@/services/api/device";
import { useCity, useSetCity } from "@/hooks/useAuthStore";
import { getOrganization } from "@/services/api/organization";
import useFormHook from "@/hooks/useFormHook";
import Button from "@/components/ui/Button/Button";
import useSWRMutation from "swr/mutation";
import { createLoyaltyProgram, getLoyaltyProgramById, updateLoyaltyProgram } from "@/services/api/marketing";
import { useLocation } from "react-router-dom";
import { useSnackbar } from "@/components/context/useContext";

const { Option } = Select;

type LoyaltyPrograms = {
    name: string;
    organizationIds: number[];
    lifetimeDays?: number;
}

type UpdateLoyalty = {
    loyaltyProgramId: number;
    name?: string;
    organizationIds?: number[];
}

type Props = {
    nextStep?: () => void;
}

const Settings: React.FC<Props> = ({ nextStep }) => {
    const { t } = useTranslation();
    const [isEditMode, setIsEditMode] = useState(false);
    const { showSnackbar } = useSnackbar();
    // const [isToggled, setIsToggled] = useState(false);
    // const [isToggledTwo, setIsToggledTwo] = useState(false);
    // const [isToggledThree, setIsToggledThree] = useState(false);
    // const [isToggledFour, setIsToggledFour] = useState(false);

    const [selectedOption, setSelectedOption] = useState<string>("never");

    const { data: cityData } = useSWR([`get-city`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const cities: { name: string; value: number | string }[] = [
        { name: t("analysis.all"), value: '*' },
        ...(cityData?.map((item) => ({ name: item.region, value: item.id })) || [])
    ];

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: placementId }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const organizations: { label: string; value: number | string }[] = organizationData?.map((item) => ({ label: item.name, value: item.id })) || [];

    const placementId = useCity();
    const setPlacementId = useSetCity();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(event.target.value);
    };

    const location = useLocation();

    const { data: loyaltyData, isValidating: loadingPrograms } = useSWR(location.state.ownerId !== 0 ? [`get-loyalty-program-by-id`] : null, () => getLoyaltyProgramById(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const loyaltyById = loyaltyData;

    // const handleToggle = () => {
    //     setIsToggled(!isToggled);
    // };

    // const handleToggleTwo = () => {
    //     setIsToggledTwo(!isToggledTwo);
    // };

    // const handleToggleThree = () => {
    //     setIsToggledThree(!isToggledThree);
    // };

    // const handleToggleFour = () => {
    //     setIsToggledFour(!isToggledFour);
    // };

    const defaultValues: LoyaltyPrograms = {
        name: '',
        organizationIds: [],
        lifetimeDays: undefined
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createLoyalty, isMutating } = useSWRMutation(['create-loyalty-program'], async () => createLoyaltyProgram({
        name: formData.name,
        organizationIds: formData.organizationIds,
        lifetimeDays: formData.lifetimeDays
    }));

    const payload: UpdateLoyalty = {
        loyaltyProgramId: location.state.ownerId,
        name: formData.name,
    };

    if (formData.organizationIds !== loyaltyById?.organizationIds) {
        payload.organizationIds = formData.organizationIds;
    }

    const { trigger: updateLoyalty } = useSWRMutation(['update-loyalty-program'], async () => updateLoyaltyProgram(payload));

    type FieldType = "name" | "organizationIds" | "lifetimeDays" | `organizationIds.${number}`;

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['lifetimeDays'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const handleChangeTags = (values: number[]) => {
        // setSelectedTags(values);
        setFormData((prev) => ({ ...prev, ["organizationIds"]: values }));
        setValue("organizationIds", values);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
    };

    const onSubmit = async () => {
        try {
            const result = await createLoyalty();
            if (result) {
                location.state.ownerId = result.props.id;
                nextStep;
                resetForm();
            } else {
                throw new Error('Invalid response from API');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
            showSnackbar("Error during form submission", "error");
        }
    };

    useEffect(() => {
        if (loyaltyById?.id) {
            setIsEditMode(true);
            setFormData({
                name: loyaltyById.name,
                organizationIds: loyaltyById.organizationIds,
                lifetimeDays: loyaltyById.lifetimeDays,
            });
            if (loyaltyById.lifetimeDays !== undefined)
                setSelectedOption("fromThe");
        }
    }, [loyaltyById]);

    const handleUpdate = async () => {
        try {

            const result = await updateLoyalty();
            if (result) {
                mutate([`get-loyalty-program-by-id`]);
            } else {
                throw new Error('Invalid response from API');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
            showSnackbar("Error during form submission", "error");
        }
    }

    return (
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <ExpandedCard firstText={t("marketing.basic")} secondText={t("marketing.setup")} Component={BonusImage} handleClick={location.state.ownerId !== 0 ? handleUpdate : undefined}>
                <div className="pl-14 mt-5">
                    {loadingPrograms ? (
                        <div className="space-y-6">
                            <Skeleton active paragraph={{ rows: 3 }} />
                            <Skeleton.Input active size="large" style={{ width: 320 }} />
                            <div className="flex flex-col sm:flex-row gap-4 mt-5">
                                <Skeleton.Input active size="large" style={{ width: 320 }} />
                                <Skeleton.Input active size="large" style={{ width: 320 }} />
                            </div>
                        </div>
                    ) : (<div>
                        {/* Expanded content goes here */}
                        <div className="text-2xl font-semibold text-text01">{t("marketing.branch")}</div>
                        <div className="text-text02">
                            <div>{t("marketing.setUpBranch")}</div>
                            <div>{t("marketing.branchCan")}</div>
                        </div>
                        <Input
                            title={t("equipment.name")}
                            classname="w-80"
                            inputType="secondary"
                            value={formData.name}
                            changeValue={(e) => handleInputChange('name', e.target.value)}
                            error={!!errors.name}
                            {...register('name', { required: !isEditMode && 'Name is required' })}
                            helperText={errors.name?.message || ''}
                        />
                        <div className="flex flex-col sm:flex-row gap-4 mt-5">
                            <DropdownInput
                                title={t("marketing.cities")}
                                value={placementId}
                                options={cities}
                                classname="w-64"
                                inputType="secondary"
                                onChange={(value) => setPlacementId(value)}
                            />
                            {/* <DropdownInput
                            title={t("marketing.carWash")}
                            value={undefined}
                            options={[]}
                            classname="w-64"
                        /> */}
                            <div>
                                <div className="text-sm text-text02">{t("warehouse.organization")}</div>
                                <Select
                                    mode="tags"
                                    allowClear
                                    placeholder="Select organizations"
                                    dropdownStyle={{ zIndex: 9999 }}
                                    style={{ width: '320px' }}
                                    status={errors.organizationIds ? 'error' : undefined}
                                    {...register('organizationIds', { required: !isEditMode && 'Organizations is required' })}
                                    onChange={handleChangeTags}
                                    value={formData.organizationIds}
                                    size="large"
                                >
                                    {organizations.map((tag) => (
                                        <Option key={tag.value} value={tag.value}>
                                            {tag.label}
                                        </Option>
                                    ))}
                                </Select>
                                {!!errors.organizationIds && (
                                    <div className={`text-[11px] font-normal ${errors.organizationIds ? 'text-errorFill' : 'text-text02'}`}>
                                        {errors.organizationIds.message || ''}
                                    </div>
                                )}
                            </div>
                            {/* <DropdownInput
                            title={t("routes.segments")}
                            value={undefined}
                            options={[]}
                            classname="w-64"
                        /> */}
                        </div>

                        {/* <div className="mt-8">
                        <div className="text-2xl font-semibold text-text01">{t("marketing.price")}</div>
                        <div className="text-text02">
                            <div>{t("marketing.amount")}</div>
                            <div>{t("marketing.based")}</div>
                        </div>
                        <label className="flex space-x-2 mt-5">
                            <div>
                                <div
                                    onClick={handleToggle}
                                    className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${isToggled ? 'bg-primary02' : 'bg-opacity01'
                                        }`}
                                >
                                    <div
                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isToggled ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-text01">{t("marketing.take")}</div>
                                <div className="text-text02">{t("marketing.addCost")}</div>
                            </div>
                        </label>
                    </div> */}
                    </div>)}
                </div>
            </ExpandedCard>
            <ExpandedCard firstText={t("marketing.bonus")} secondText={t("marketing.setUpAcc")} Component={DiamondImage}>
                <div className="px-4 sm:px-8 lg:pl-14 space-y-6">
                    {/* <div className="w-full bg-disabledFill rounded-lg p-5">
                        <div className="text-lg font-semibold text-primary02">{t("marketing.work")}</div>
                        <div className="text-text02 max-w-full lg:max-w-[515px]">
                            <ul className="list-disc list-inside space-y-1">
                                <li>{t("marketing.when")}</li>
                                <li>{t("marketing.bonuses")}</li>
                                <li>{t("marketing.minus")}</li>
                                <li>{t("marketing.whenRet")}</li>
                                <li>
                                    <span>{t("marketing.config")} </span>
                                    <span className="text-primary02">«{t("marketing.levels")}»</span>
                                </li>
                                <li>{t("marketing.to")}</li>
                            </ul>
                        </div>
                    </div> */}
                    {/* <div className="text-2xl text-text01 font-semibold">{t("marketing.accBonus")}</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div>
                            <div
                                onClick={handleToggleTwo}
                                className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${isToggledTwo ? 'bg-primary02' : 'bg-opacity01'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isToggledTwo ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-text01">{t("marketing.delay")}</div>
                            <div className="text-text02">{t("marketing.cal")}</div>
                            <DropdownInput value={undefined} options={[]} classname="w-full sm:w-40 mt-2" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div>
                            <div
                                onClick={handleToggle}
                                className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${isToggled ? 'bg-primary02' : 'bg-opacity01'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isToggled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-text01">{t("marketing.round")}</div>
                            <div className="text-text02">{t("marketing.whenCal")}</div>
                            <div className="text-text02">{t("marketing.whenWrit")}</div>
                        </div>
                    </div> */}

                    <div className="text-2xl text-text01 font-semibold mb-4">
                        {t("marketing.write")}
                    </div>

                    <div className="bg-Bonus-Image bg-blend-multiply h-auto min-h-40 rounded-lg w-full sm:w-96 bg-[#0a0a0b]/70 px-4 py-6 space-y-6">
                        <div className="text-background02 font-semibold text-2xl sm:text-3xl">
                            {t("marketing.ex")}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                            <div className="flex justify-center sm:justify-start">
                                <img src={DiamondOne} />
                            </div>

                            <div className="flex justify-center sm:justify-start">
                                <img src={TwoArrow} />
                            </div>

                            <Input
                                label={t("marketing.1")}
                                inputType="primary"
                                showIcon={true}
                                classname="w-full sm:w-48"
                                IconComponent={
                                    <div className="text-3xl font-semibold text-text01">₽</div>
                                }
                            />
                        </div>
                    </div>

                    {/* <div>
                        <div className="text-lg font-semibold text-text01">{t("marketing.max")}</div>
                        <div className="text-text02">{t("marketing.no")}</div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("marketing.maxi")}</div>
                        <Input type="number" value={50} disabled={true} classname="w-20" />
                    </div>

                    {[{ toggle: isToggledThree, handler: handleToggleThree, title: t("marketing.use"), desc: t("marketing.allow") },
                    { toggle: isToggledFour, handler: handleToggleFour, title: t("marketing.min"), desc: t("marketing.set"), input: true }].map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-4">
                            <div>
                                <div
                                    onClick={item.handler}
                                    className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${item.toggle ? 'bg-primary02' : 'bg-opacity01'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${item.toggle ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                            <div className="max-w-full sm:max-w-[480px]">
                                <div className="text-lg font-semibold text-text01">{item.title}</div>
                                <div className="text-text02">{item.desc}</div>
                                {item.input && (
                                    <Input type="number" value={1} disabled={true} classname="w-20" />
                                )}
                            </div>
                        </div>
                    ))} */}

                    <div className="max-w-full lg:max-w-[560px]">
                        <div className="text-2xl text-text01 font-semibold">{t("marketing.burni")}</div>
                        <div className="text-text02">{t("marketing.bonusesCan")}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['never', 'fromThe'].map(option => (
                            <div
                                key={option}
                                className={`flex items-center gap-2 ${selectedOption === option ? "bg-background06" : "bg-disabledFill"} rounded-md px-5 py-4`}
                            >
                                <input
                                    type="radio"
                                    name="marketing"
                                    value={option}
                                    checked={selectedOption === option}
                                    onChange={handleChange}
                                    disabled={location.state.ownerId !== 0}
                                />
                                <div className={selectedOption === option ? "text-primary02" : "text-text01"}>
                                    {t(`marketing.${option}`)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedOption !== "never" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-disabledFill rounded-lg px-5 py-4">
                                <Alert />
                                <div className="text-text02">{t("marketing.after")}</div>
                            </div>
                            <Input
                                type="number"
                                inputType="secondary"
                                value={formData.lifetimeDays}
                                title={t("marketing.burnout")}
                                classname="w-full sm:w-40"
                                changeValue={(e) => handleInputChange('lifetimeDays', e.target.value)}
                                {...register('lifetimeDays')}
                                disabled={location.state.ownerId !== 0}
                            />
                        </div>
                    )}
                </div>
            </ExpandedCard>
            {/* <ExpandedCard firstText={t("marketing.present")} secondText={t("marketing.rules")} Component={GiftImage}>
                <div>

                </div>
            </ExpandedCard> */}
            {location.state.ownerId === 0 && (<div className="flex space-x-4">
                <Button
                    title={t("organizations.cancel")}
                    type='outline'
                    handleClick={() => {
                        resetForm();
                    }}
                />
                <Button
                    title={t("organizations.save")}
                    form={true}
                    isLoading={isMutating}
                    handleClick={() => { }}
                />
            </div>)}
        </form>
    );
};

export default Settings;
