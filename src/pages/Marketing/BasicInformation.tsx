import React from "react";
import { useTranslation } from "react-i18next";
import Icon from 'feather-icons-react';
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import PieChart from "@icons/PieChart.png";
import Check from "@/assets/icons/CheckCircle.png";

type Props = {
    isEditing: boolean;
}

const BasicInformation: React.FC<Props> = ({ isEditing }: Props) => {
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
                    {isEditing ? <Input
                        title={t("marketing.type")}
                        inputType="secondary"
                        classname="w-64"
                    /> : (
                        <div>
                            <div className="text-text02">{t("marketing.type")}</div>
                            <div className="border border-opacity01 w-64 rounded-md px-3 py-1 text-text01">
                                Физ. лицо
                            </div>
                        </div>
                    )}
                    {isEditing ? <Input
                        title={t("marketing.name")}
                        inputType="secondary"
                        classname="w-96"
                    /> : (
                        <div>
                            <div className="text-text02">{t("marketing.name")}</div>
                            <div className="border border-opacity01 w-96 rounded-md px-3 py-1 text-text01">
                                Олег Сидоров
                            </div>
                        </div>
                    )}
                    {isEditing ? <Input
                        title={t("marketing.floor")}
                        inputType="secondary"
                        classname="w-14"
                    /> : (
                        <div>
                            <div className="text-text02">{t("marketing.floor")}</div>
                            <div className="border border-opacity01 w-14 rounded-md px-3 py-1 text-text01">
                                Муж
                            </div>
                        </div>
                    )}
                    {isEditing ? <Input
                        type="date"
                        title={t("register.date")}
                        inputType="secondary"
                        classname="w-36"
                    /> : (
                        <div>
                            <div className="text-text02">{t("register.date")}</div>
                            <div className="border border-opacity01 w-36 rounded-md px-3 py-1 text-text01">
                                01.06.1984
                            </div>
                        </div>
                    )}
                    {isEditing ? <Input
                        title={t("profile.telephone")}
                        inputType="secondary"
                        classname="w-96"
                    /> : (
                        <div>
                            <div className="text-text02">{t("profile.telephone")}</div>
                            <div className="border border-opacity01 w-96 rounded-md px-3 py-1 text-text01">
                                +7 (988) 000-00-00
                            </div>
                        </div>
                    )}
                    {isEditing ? <Input
                        title={"E-mail"}
                        inputType="secondary"
                        classname="w-96"
                    /> : (
                        <div>
                            <div className="text-text02">{"E-mail"}</div>
                            <div className="border border-opacity01 w-96 rounded-md px-3 py-1 text-text01">
                                Oleg@mail.ru
                            </div>
                        </div>
                    )}
                    {isEditing ? <MultilineInput
                        changeValue={() => { }}
                        title={t("equipment.comment")}
                        label={t("marketing.about")}
                        inputType="secondary"
                        classname="w-96"
                    /> : (
                        <div>
                            <div className="text-text02">{t("equipment.comment")}</div>
                            <div className="border border-opacity01 w-96 h-20 rounded-md px-3 py-1 text-text03 bg-disabledFill">
                                {t("marketing.about")}
                            </div>
                        </div>
                    )}
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