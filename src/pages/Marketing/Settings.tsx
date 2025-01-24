import React, { useState } from "react";
import BonusImage from "@icons/BasicBonus.svg?react";
import { useTranslation } from "react-i18next";
// import Icon from "feather-icons-react";
import DropdownInput from "@ui/Input/DropdownInput";
import ExpandedCard from "@ui/Card/ExpandedCard";
import DiamondImage from "@icons/DiamondIcon.svg?react";
import GiftImage from "@icons/GiftIcon.svg?react";
// import Conversion from "@/assets/ConversionRate.png";
import Input from "@/components/ui/Input/Input";
import Alert from "@icons/AlertTriangle.svg?react";
import DiamondOne from "@/assets/DiamondOne.svg?react";
import TwoArrow from "@/assets/TwoArrow.svg?react";

const Settings: React.FC = () => {
    const { t } = useTranslation();
    const [isToggled, setIsToggled] = useState(false);
    const [isToggledTwo, setIsToggledTwo] = useState(false);
    const [isToggledThree, setIsToggledThree] = useState(false);
    const [isToggledFour, setIsToggledFour] = useState(false);

    const [selectedOption, setSelectedOption] = useState<string>("never");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(event.target.value);
    };

    const handleToggle = () => {
        setIsToggled(!isToggled);
    };

    const handleToggleTwo = () => {
        setIsToggledTwo(!isToggledTwo);
    };

    const handleToggleThree = () => {
        setIsToggledThree(!isToggledThree);
    };

    const handleToggleFour = () => {
        setIsToggledFour(!isToggledFour);
    };

    return (
        <div className="space-y-3">
            <ExpandedCard firstText={t("marketing.basic")} secondText={t("marketing.setup")} Component={BonusImage}>
                <div className="mt-5 pl-14">
                    {/* Expanded content goes here */}
                    <div className="text-2xl font-semibold text-text01">{t("marketing.branch")}</div>
                    <div className="text-text02">
                        <div>{t("marketing.setUpBranch")}</div>
                        <div>{t("marketing.branchCan")}</div>
                    </div>
                    <div className="flex space-x-10 mt-5">
                        <DropdownInput
                            title={t("marketing.cities")}
                            value={undefined}
                            options={[]}
                            classname="w-64"
                        />
                        <DropdownInput
                            title={t("marketing.carWash")}
                            value={undefined}
                            options={[]}
                            classname="w-64"
                        />
                        <DropdownInput
                            title={t("routes.segments")}
                            value={undefined}
                            options={[]}
                            classname="w-64"
                        />
                    </div>

                    <div className="mt-8">
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
                    </div>
                </div>
            </ExpandedCard>
            <ExpandedCard firstText={t("marketing.bonus")} secondText={t("marketing.setUpAcc")} Component={DiamondImage}>
                <div className="pl-14 space-y-6">
                    <div className="h-60 w-[640px] bg-disabledFill rounded-lg p-5">
                        <div className="text-lg font-semibold text-primary02">{t("marketing.work")}</div>
                        <div className="text-text02 w-[515px]">
                            <ul className="list-disc list-inside">
                                <li>{t("marketing.when")}</li>
                                <li>{t("marketing.bonuses")}</li>
                                <li>{t("marketing.minus")}</li>
                                <li>{t("marketing.whenRet")}</li>
                                <li>
                                    <span>{t("marketing.config")}</span>
                                    <span className="text-primary02">«{t("marketing.levels")}»</span>
                                </li>
                                <li>{t("marketing.to")}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-2xl text-text01 font-semibold">{t("marketing.accBonus")}</div>
                    <div className="flex space-x-2">
                        <div>
                            <div
                                onClick={handleToggleTwo}
                                className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${isToggledTwo ? 'bg-primary02' : 'bg-opacity01'
                                    }`}
                            >
                                <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isToggledTwo ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-text01">{t("marketing.delay")}</div>
                            <div className="text-text02">{t("marketing.cal")}</div>
                            <DropdownInput
                                value={undefined}
                                options={[]}
                                classname="w-40 mt-2"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-2">
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
                            <div className="text-lg font-semibold text-text01">{t("marketing.round")}</div>
                            <div className="text-text02">{t("marketing.whenCal")}</div>
                            <div className="text-text02">{t("marketing.whenWrit")}</div>
                        </div>
                    </div>
                    <div className="text-2xl text-text01 font-semibold">{t("marketing.write")}</div>
                    <div className="bg-Bonus-Image bg-blend-multiply h-40 rounded-lg w-80 bg-[#0a0a0b]/70 px-4 py-8 space-y-6">
                        <div className="text-background02 font-semibold text-3xl">{t("marketing.ex")}</div>
                        <div className="flex items-center justify-center space-x-4">
                            <DiamondOne />
                            <TwoArrow />
                            <Input
                                label={t("marketing.1")}
                                inputType="primary"
                                showIcon={true}
                                classname="w-48"
                                IconComponent={<div className="text-3xl font-semibold text-text01">₽</div>}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-text01">{t("marketing.max")}</div>
                        <div className="text-text02">{t("marketing.no")}</div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("marketing.maxi")}</div>
                        <Input
                            type="number"
                            value={50}
                            disabled={true}
                            classname="w-20"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <div>
                            <div
                                onClick={handleToggleThree}
                                className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${isToggledThree ? 'bg-primary02' : 'bg-opacity01'
                                    }`}
                            >
                                <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isToggledThree ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-text01">{t("marketing.use")}</div>
                            <div className="text-text02">{t("marketing.allow")}</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <div>
                            <div
                                onClick={handleToggleFour}
                                className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${isToggledFour ? 'bg-primary02' : 'bg-opacity01'
                                    }`}
                            >
                                <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isToggledFour ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </div>
                        </div>
                        <div className="max-w-[480px]">
                            <div className="text-lg font-semibold text-text01">{t("marketing.min")}</div>
                            <div className="text-text02">{t("marketing.set")}</div>
                            <Input
                                type="number"
                                value={1}
                                disabled={true}
                                classname="w-20"
                            />
                        </div>
                    </div>
                    <div className="max-w-[560px]">
                        <div className="text-2xl text-text01 font-semibold">{t("marketing.burni")}</div>
                        <div className="text-text02">{t("marketing.bonusesCan")}</div>
                    </div>
                    <div className="flex space-x-2">
                        <div className={`flex space-x-2 ${selectedOption === "never" ? "bg-background06" : "bg-disabledFill"} rounded-md px-5 py-[18px]`}>
                            <input
                                type="radio"
                                name="marketing"
                                value="never"
                                checked={selectedOption === "never"}
                                onChange={handleChange}
                            />
                            <div className={`${selectedOption === "never" ? "text-primary02" : "text-text01"}`}>{t("marketing.never")}</div>
                        </div>
                        <div className={`flex space-x-2 ${selectedOption === "from" ? "bg-background06" : "bg-disabledFill"} rounded-md px-5 py-[18px]`}>
                            <input
                                type="radio"
                                name="marketing"
                                value="from"
                                checked={selectedOption === "from"}
                                onChange={handleChange}
                            />
                            <div className={`${selectedOption === "from" ? "text-primary02" : "text-text01"}`}>{t("marketing.from")}</div>
                        </div>
                        <div className={`flex space-x-2 ${selectedOption === "fromThe" ? "bg-background06" : "bg-disabledFill"} rounded-md px-5 py-[18px]`}>
                            <input
                                type="radio"
                                name="marketing"
                                value="fromThe"
                                checked={selectedOption === "fromThe"}
                                onChange={handleChange}
                            />
                            <div className={`${selectedOption === "fromThe" ? "text-primary02" : "text-text01"}`}>{t("marketing.fromThe")}</div>
                        </div>
                    </div>
                    {selectedOption !== "never" && (
                        <div>
                            <div className="flex space-x-2 bg-disabledFill rounded-lg w-[600px] px-5 py-4">
                                <Alert />
                                <div className="text-text02">{t("marketing.after")}</div>
                            </div>
                            <DropdownInput
                                value={undefined}
                                options={[]}
                                title={t("marketing.burnout")}
                                classname="w-40"
                            />
                        </div>
                    )}
                </div>
            </ExpandedCard>
            <ExpandedCard firstText={t("marketing.present")} secondText={t("marketing.rules")} Component={GiftImage}>
                <div>

                </div>
            </ExpandedCard>
        </div>
    );
};

export default Settings;
