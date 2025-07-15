import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.png"
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import {
    ArrowUpOutlined,
    ArrowDownOutlined
} from "@ant-design/icons";

const DailyReports: React.FC = () => {
    const { t } = useTranslation();

    const [openSetting, setOpenSetting] = useState(false);

    return (
        <>
            <DrawerCreate>
                <form className="space-y-6">
                    <div className="text-text01 font-semibold text-2xl">{t("daily.report")}</div>
                    <div className="flex">
                        <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
                        <span className="text-errorFill">*</span>
                        <span className="font-semibold text-sm text-text01">{t("routine.are")}</span>
                    </div>
                    <Input
                        type="date"
                        title={`${t("daily.date")} *`}
                        classname="w-36"
                    />
                    <DropdownInput
                        title={t("pos.city")}
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
                    <div className="text-text01 font-semibold text-2xl">{t("daily.exam")}</div>
                    <Input
                        title={t("daily.rem")}
                        classname="w-44"
                    />
                    <div className="space-y-2">
                        <Input
                            title={t("daily.check")}
                            classname="w-96"
                        />
                        <div className="flex space-x-2 items-center">
                            <input
                                type="checkbox"
                                className="w-[18px] h-[18px]"
                            />
                            <div className="text-text02">{t("daily.norm")}</div>
                        </div>
                    </div>
                    <Input
                        title={t("daily.mile")}
                        classname="w-44"
                    />
                    <MultilineInput
                        title={t("daily.route")}
                        classname="w-96"
                        changeValue={() => { }}
                    />
                    <div className="text-text01 font-semibold text-2xl">{t("daily.elec")}</div>
                    <Input
                        title={t("daily.count")}
                        classname="w-44"
                    />
                    <div>
                        <div className="text-text02">{t("daily.trans")}</div>
                        <Input
                            classname="w-44"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01" onClick={() => setOpenSetting(!openSetting)}>
                            {openSetting ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        </div>
                        <div className="text-text01 font-semibold text-2xl">{t("daily.setting")}</div>
                    </div>
                    {openSetting && (<div className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                title={t("daily.press")}
                                classname="w-96"
                            />
                            <div className="flex space-x-2 items-center">
                                <input
                                    type="checkbox"
                                    className="w-[18px] h-[18px]"
                                />
                                <div className="text-text02">{t("daily.norm")}</div>
                            </div>
                        </div>
                        <Input
                            title={t("daily.boost")}
                            classname="w-96"
                        />
                        <div className="space-y-2">
                            <div>
                                <div className="text-text02">{t("daily.pre")}</div>
                                <Input
                                    title={t("daily.che")}
                                    classname="w-96"
                                />
                            </div>
                            <div className="flex space-x-2 items-center">
                                <input
                                    type="checkbox"
                                    className="w-[18px] h-[18px]"
                                />
                                <div className="text-text02">{t("daily.norm")}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-text02">{t("daily.pre")}</div>
                            <Input
                                title={t("daily.multi")}
                                classname="w-96"
                            />
                        </div>
                        <DropdownInput
                            title={t("daily.comp")}
                            classname="w-96"
                            value={undefined}
                            options={[]}
                        />
                        <div className="space-y-2">
                            <Input
                                title={t("daily.hour")}
                                classname="w-96"
                            />
                            <div className="flex space-x-2 items-center">
                                <input
                                    type="checkbox"
                                    className="w-[18px] h-[18px]"
                                />
                                <div className="text-text02">{t("daily.oil")}</div>
                            </div>
                        </div>
                    </div>)}
                </form>
            </DrawerCreate>
            <NoDataUI
                title={t("daily.noText")}
                description={t("daily.create")}
            >
                <img src={SalyImage} className="mx-auto" loading="lazy" alt="DAILY" />
            </NoDataUI>
        </>
    )
}

export default DailyReports;