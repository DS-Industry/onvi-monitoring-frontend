import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import WelcomeIcon from "@icons/Welcome.svg?react";
import ExpandedCard from "@/components/ui/Card/ExpandedCard";
import BirthdayIcon from "@icons/Birthday.svg?react";
import PresentIcon from "@icons/Present.svg?react";
import PercentageIcon from "@icons/Percentage.svg?react";
import DiamondIcon from "@icons/Diamond.svg?react";
import Input from "@/components/ui/Input/Input";
import Icon from "feather-icons-react";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Button from "@/components/ui/Button/Button";

const Events: React.FC = () => {
    const { t } = useTranslation();

    const [isDiscount, setIsDiscount] = useState(false);
    const [isBonus, setIsBonus] = useState(false);
    const [time, setTime] = useState("imm");
    const [visit, setVisit] = useState("one");

    const handleTime = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTime(event.target.value);
    };

    const handleVisit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVisit(event.target.value);
    };

    return (
        <div className="space-y-3">
            <div className="text-text02">
                <div>{t("marketing.setUp")}</div>
                <div>{t("marketing.if")}</div>
            </div>
            <ExpandedCard firstText={t("marketing.wel")} secondText={t("marketing.one")} Component={WelcomeIcon}>
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
                                        name="marketing"
                                        value="imm"
                                        checked={time === "imm"}
                                        onChange={handleTime}
                                    />
                                    <div className={`${time === "imm" ? "text-primary02" : "text-text02"}`}>{t("marketing.imm")}</div>
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="radio"
                                        name="marketing"
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
                                        name="marketing"
                                        value="imm"
                                        checked={visit === "one"}
                                        onChange={handleVisit}
                                    />
                                    <div className={`${visit === "one" ? "text-primary02" : "text-text02"}`}>{t("marketing.for")}</div>
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="radio"
                                        name="marketing"
                                        value="fixed"
                                        checked={visit === "fixed"}
                                        onChange={handleVisit}
                                    />
                                    <div className={`${visit === "fixed" ? "text-primary02" : "text-text02"}`}>{t("marketing.forAll")}</div>
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
                    <div className="flex space-x-4">
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
                    <div className="flex space-x-4">
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
        </div>
    )
}

export default Events;