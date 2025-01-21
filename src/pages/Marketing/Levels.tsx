import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Profile from "@icons/ProfileIcon.svg?react";
import ExpandedCard from "@ui/Card/ExpandedCard";
import Input from "@/components/ui/Input/Input";
import PercentageIcon from "@icons/Percentage.svg?react";
import DiamondIcon from "@icons/Diamond.svg?react";
import Button from "@/components/ui/Button/Button";
import Icon from 'feather-icons-react';

const Levels: React.FC = () => {
    const { t } = useTranslation();

    const [isDiscount, setIsDiscount] = useState(false);
    const [isBonus, setIsBonus] = useState(false);

    const [selectedOption, setSelectedOption] = useState<string>("percent");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(event.target.value);
    };

    return (
        <div className="space-y-3">
            <div className="text-text02">
                <div>{t("marketing.create")}</div>
                <div>{t("marketing.toMan")}</div>
            </div>
            <ExpandedCard firstText={t("marketing.newbie")} secondText="от 0 ₽ | Бонусы" Component={Profile}>
                <div className="pl-14 space-y-6">
                    <Input
                        label={t("marketing.enter")}
                        inputType="primary"
                        classname="w-80"
                        value={"≥ 0"}
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-lg">₽</div>}
                    />
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
                    <div className="flex space-x-4 mt-8">
                        <Button
                            title={t("organizations.save")}
                        />
                        <Button
                            title={t("marketing.close")}
                            type="outline"
                        />
                    </div>
                </div>
            </ExpandedCard>
            <ExpandedCard firstText={t("marketing.amateur")} secondText="от 0 ₽ | Бонусы" Component={Profile}>
                <div>

                </div>
            </ExpandedCard>

            <ExpandedCard firstText={t("marketing.advanced")} secondText="от 0 ₽ | Бонусы" Component={Profile}>
                <div>

                </div>
            </ExpandedCard>
        </div>
    )
}

export default Levels;