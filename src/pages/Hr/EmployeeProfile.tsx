import SearchInput from "@/components/ui/Input/SearchInput";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from 'feather-icons-react';
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button/Button";

const EmployeeProfile: React.FC = () => {
    const { t } = useTranslation();
    const [searchEmp, setSearchEmp] = useState("");
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');

    const getInitials = (fullName: string) => {
        const words = fullName.trim().split(" ");

        if (words.length < 2) return "";

        return words.slice(0, 2).map(word => word[0].toUpperCase()).join("");
    }

    const employeeDetails = [
        { fullName: "Иванова Екатерина Валерьевна", job: t("hr.accountant") },
        { fullName: "Сидоров Егор Андреевич", job: t("hr.washer") },
        { fullName: "Попов Антон Владимирович", job: t("hr.washer") },
        { fullName: "Антонов Антон Антонович", job: t("hr.washer") },
        { fullName: "Иванов Константин Петрович", job: t("hr.lineOperator") },
        { fullName: "Семенов Семен Аркадьевич ич", job: t("hr.lineOperator") },
        { fullName: "Семенов Семен Аркадьевич ич", job: t("hr.lineOperator") },
        { fullName: "Семенов Семен Аркадьевич ич", job: t("hr.lineOperator") }
    ]

    const tabs = [
        { id: 'info', name: t("hr.info") },
        { id: 'addi', name: t("hr.addi") },
        { id: 'salary', name: t("hr.salary") },
        { id: 'sch', name: t("finance.sch") }
    ];

    return (
        <div className="mt-2">
            <hr />
            <div className="flex">
                <div className="w-72 border-r border-opacity01 h-screen p-4 space-y-4">
                    <div className="flex space-x-2 text-primary02 cursor-pointer" onClick={() => navigate(-1)}>
                        <Icon icon="chevron-left" className="h-6 w-6" />
                        <div>{t("login.back")}</div>
                    </div>
                    <SearchInput
                        value={searchEmp}
                        placeholder={t("hr.search")}
                        searchType="outlined"
                        onChange={(value) => setSearchEmp(value)}
                    />
                    <div className="w-60 max-h-[480px] overflow-y-auto">
                        {employeeDetails.map((emp) => (
                            <div className="flex rounded-lg hover:bg-background05 p-2.5 cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-background03 flex items-center justify-center text-xs text-text01">
                                    {getInitials(emp.fullName)}
                                </div>
                                <div>
                                    <div className="text-text01 font-semibold max-w-44 truncate overflow-hidden whitespace-nowrap">{emp.fullName}</div>
                                    <div className="text-text02 text-sm">{emp.job}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button
                        title={t("routes.addE")}
                        iconPlus={true}
                        type="outline"
                        classname="w-full"
                    />
                </div>
                <div className="px-4">
                    <div className="flex flex-wrap sm:flex-nowrap space-x-4 border-b mb-6 w-fit overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`p-2 flex-1 min-w-[120px] sm:w-40 text-center ${activeTab === tab.id ? 'text-text01 border-b-[3px] border-primary02' : 'text-text02'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4">
                        {activeTab === 'info' && (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-text02">{t("finance.status")}</div>
                                    <div className="rounded-2xl py-[2px] px-2 flex items-center gap-2 w-36 text-[#00A355] bg-[#D1FFEA]">
                                        <span className="w-2 h-2 bg-[#00A355] rounded-full"></span>
                                        {t("tables.ACTIVE")}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-text02">{t("hr.full")}</div>
                                    <div className="w-80 border border-borderFill rounded-md text-text01 p-1 pl-2">Сидоров Егор Андреевич</div>
                                </div>
                                <div>
                                    <div className="text-sm text-text02">{t("roles.job")}</div>
                                    <div className="w-64 border border-borderFill rounded-md text-text01 p-1 pl-2">{t("hr.washer")}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-text02">{t("hr.date")}</div>
                                    <div className="w-24 border border-borderFill rounded-md text-text01 p-1 pl-2">12.03.2024</div>
                                </div>
                                <div>
                                    <div className="text-sm text-text02">{t("profile.telephone")}</div>
                                    <div className="w-80 border border-borderFill rounded-md text-text01 p-1 pl-2">+7 (000) 000-00-00</div>
                                </div>
                                <div>
                                    <div className="text-sm text-text02">E-mail</div>
                                    <div className="w-80 border border-borderFill rounded-md text-text01 p-1 pl-2">Sidorov@mail</div>
                                </div>
                                <div>
                                    <div className="text-sm text-text02">{t("warehouse.desc")}</div>
                                    <div className="w-80 h-24 border border-borderFill rounded-md text-text01 p-1 pl-2">Comment entered by user</div>
                                </div>
                                <div>
                                    <div className="text-sm text-text02">{t("profile.photo")}</div>
                                    <div className="w-10 h-10 rounded-full bg-background03 flex items-center justify-center text-xs text-text01">FN</div>
                                </div>
                            </div>
                        )}
                        {activeTab === "addi" && (<div className="space-y-4">
                            <div>
                                <div className="text-sm text-text02">{t("hr.citi")}</div>
                                <div className="w-80 border border-borderFill rounded-md text-text01 p-1 pl-2">Citizenship</div>
                            </div>
                            <div>
                                <div className="text-sm text-text02">{t("marketing.floor")}</div>
                                <div className="w-64 border border-borderFill rounded-md text-text01 p-1 pl-2">Floor</div>
                            </div>
                            <div>
                                <div className="text-sm text-text02">{t("hr.pass")}</div>
                                <div className="w-80 h-24 border border-borderFill rounded-md text-text01 p-1 pl-2">Passport Details</div>
                            </div>
                            <div>
                                <div className="text-sm text-text02">{t("organizations.tin")}</div>
                                <div className="w-80 border border-borderFill rounded-md text-text01 p-1 pl-2">Tin</div>
                            </div>
                            <div>
                                <div className="text-sm text-text02">{t("hr.insu")}</div>
                                <div className="w-80 border border-borderFill rounded-md text-text01 p-1 pl-2">Insurance Details</div>
                            </div>
                        </div>)}
                        {activeTab === "salary" && (<div className="space-y-4">
                            <div>
                                <div className="text-sm text-text02">{t("hr.month")}</div>
                                <div className="w-44 border border-borderFill rounded-md text-text01 px-3 py-1 flex justify-between">
                                    <div>00</div>
                                    <div className="text-text02">₽</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-text02">{t("hr.daily")}</div>
                                <div className="w-44 border border-borderFill rounded-md text-text01 px-3 py-1 flex justify-between">
                                    <div>200</div>
                                    <div className="text-text02">₽</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-text02">{t("hr.insu")}</div>
                                <div className="w-44 border border-borderFill rounded-md text-text01 px-3 py-1 flex justify-between">
                                    <div>10</div>
                                    <div className="text-text02">%</div>
                                </div>
                            </div>
                        </div>)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeProfile;