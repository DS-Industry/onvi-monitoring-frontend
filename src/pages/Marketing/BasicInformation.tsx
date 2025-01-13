import React from "react";
import { useTranslation } from "react-i18next";
import Icon from 'feather-icons-react';
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import PieChart from "@icons/PieChart.png";
import Check from "@/assets/icons/CheckCircle.png";

const BasicInformation: React.FC = () => {
    const { t } = useTranslation();

    const options = [
        { id: 1, label: "Red Option", color: "#EF4444" },
        { id: 2, label: "Blue Option", color: "#3B82F6" },
        { id: 3, label: "Green Option", color: "#10B981" },
        { id: 4, label: "Yellow Option", color: "#F59E0B" },
    ];

    return (
        <div className="max-w-6xl">
            <form className="flex flex-col md:flex-row gap-6 mb-5">
                <div className="flex flex-col space-y-6 w-full">
                    <div className="font-semibold text-2xl text-text01">{t("warehouse.basic")}</div>
                    <Input
                        title={t("marketing.type")}
                        inputType="secondary"
                        classname="w-64"
                    />
                    <Input
                        title={t("marketing.name")}
                        inputType="secondary"
                        classname="w-96"
                    />
                    <Input
                        title={t("marketing.floor")}
                        inputType="secondary"
                        classname="w-14"
                    />
                    <Input
                        title={t("register.date")}
                        inputType="secondary"
                        classname="w-36"
                    />
                    <Input
                        title={t("profile.telephone")}
                        inputType="secondary"
                        classname="w-96"
                    />
                    <Input
                        title={"E-mail"}
                        inputType="secondary"
                        classname="w-96"
                    />
                    <MultilineInput
                        changeValue={() => { }}
                        title={t("equipment.comment")}
                        label={t("marketing.about")}
                        inputType="secondary"
                        classname="w-96"
                    />
                    <div>
                        <div className="text-sm text-text02">{t("marketing.tags")}</div>
                        <div className="rounded-md w-96 flex items-center gap-2 flex-wrap bg-white">
                            {options.map((option) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center gap-2 p-2.5 text-sm font-semibold rounded`}
                                    style={{ backgroundColor: option.color, color: "#fff" }}
                                >
                                    {option.label}
                                    <button
                                        className="text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // handleRemove(option.id);
                                        }}
                                    >
                                        <Icon icon="x" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("routes.segments")}</div>
                        <div className="flex space-x-2">
                            <div className="flex text-primary02 border rounded-md px-3 py-2 border-text01">
                                <img src={PieChart} />
                                <div>{t("marketing.regular")}</div>
                            </div>
                            <div className="flex text-primary02 border rounded-md px-3 py-2 border-text01">
                                <img src={PieChart} />
                                <div>{t("marketing.checks")}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:ml-40 w-full">
                    <div className="flex items-center text-text01 space-x-2">
                        <div className="font-semibold text-2xl text-nowrap">{t("marketing.mess")}</div>
                        <Icon icon="alert-circle" />
                    </div>
                    <div className="space-y-3 mt-3">
                        <div className="flex space-x-10">
                            <div className="flex space-x-2">
                                <img src={Check} />
                                <div className="text-text02 text-nowrap">{t("marketing.sub")} WhatsApp</div>
                            </div>
                            <div className="flex space-x-2">
                                <img src={Check} />
                                <div className="text-text02 text-nowrap">{t("marketing.sub")} Telegram</div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <img src={Check} />
                            <div className="text-text02">{t("marketing.sub")} Email</div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default BasicInformation;