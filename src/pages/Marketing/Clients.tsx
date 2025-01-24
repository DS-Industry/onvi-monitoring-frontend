import NoDataUI from "@/components/ui/NoDataUI";
import React from "react";
import { useTranslation } from "react-i18next";
import ClientEmpty from "@/assets/NoMarketing.png";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Icon from "feather-icons-react";
import Button from "@/components/ui/Button/Button";
import MultiInput from "@/components/ui/Input/MultiInput";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsClient } from "@/utils/OverFlowTableData";
import { Tooltip } from "@material-tailwind/react";

const Clients: React.FC = () => {
    const { t } = useTranslation();

    const options = [
        { id: 1, label: "Red Option", color: "#EF4444" },
        { id: 2, label: "Blue Option", color: "#3B82F6" },
        { id: 3, label: "Green Option", color: "#10B981" },
        { id: 4, label: "Yellow Option", color: "#F59E0B" },
    ];

    const handleSelectionChange = (selected: any) => {
        console.log("Selected Options:", selected);
    };

    const tableData = [
        { type: "Физ.лицо", name: "Testing Profile" }
    ];
    return (
        <>
            {tableData.length > 0 ?
                <div className="mt-8">
                    <OverflowTable
                        tableData={tableData}
                        columns={columnsClient}
                        isDisplayEdit={true}
                        nameUrl="/marketing/clients/profile"
                    // handleChange={handleTableChange}
                    />
                </div> :
                <div className="flex flex-col justify-center items-center">
                    <NoDataUI
                        title={t("marketing.noClient")}
                        description={""}
                    >
                        <img src={ClientEmpty} className="mx-auto" />
                    </NoDataUI>
                </div>
            }
            <DrawerCreate>
                <form className="space-y-6">
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("marketing.new")}</div>
                    <span className="font-semibold text-sm text-text01">{t("warehouse.fields")}</span>
                    <div className="font-semibold text-2xl mb-5 text-text01">{t("warehouse.basic")}</div>
                    <Input
                        type="number"
                        title={`${t("marketing.type")}*`}
                        label={t("marketing.phys")}
                        classname="w-80"
                        changeValue={() => { }}
                    />
                    <Input
                        type=""
                        title={`${t("marketing.name")}*`}
                        label={t("marketing.enterName")}
                        classname="w-96"
                        changeValue={() => { }}
                    />
                    <Input
                        type="number"
                        title={t("marketing.floor")}
                        label={t("warehouse.notSel")}
                        classname="w-80"
                        changeValue={() => { }}
                    />
                    <Input
                        type="date"
                        title={t("register.date")}
                        classname="w-40"
                        changeValue={() => { }}
                    />
                    <Input
                        type=""
                        title={t("profile.telephone")}
                        label={t("warehouse.enterPhone")}
                        classname="w-96"
                        changeValue={() => { }}
                    />
                    <Input
                        type=""
                        title={"E-mail"}
                        label={t("marketing.enterEmail")}
                        classname="w-96"
                        changeValue={() => { }}
                    />
                    <Input
                        type=""
                        title={t("marketing.disc")}
                        classname="w-64"
                        changeValue={() => { }}
                    />
                    <MultilineInput
                        changeValue={() => { }}
                        title={t("equipment.comment")}
                        label={t("marketing.about")}
                        inputType="secondary"
                        classname="w-96"
                    />
                    <div className="flex items-center text-primary02">
                        <Icon icon="plus" className="w-5 h-5" />
                        <div className="font-semibold text-base">{t("marketing.add")}</div>
                    </div>
                    <MultiInput options={options} onChange={handleSelectionChange} />
                    <div>
                        <div className="flex items-center text-text01 space-x-2">
                            <div className="font-semibold text-2xl">{t("marketing.mess")}</div>
                            <Tooltip content={t("marketing.applies")} placement="right-end">
                                <span>
                                    <Icon icon="alert-circle" />
                                </span>
                            </Tooltip>
                        </div>
                        <div className="space-y-3 mt-3">
                            <div className="flex space-x-10">
                                <div className="flex space-x-2">
                                    <input type="checkbox" className="border-2 border-primary02" />
                                    <div className="text-text02">{t("marketing.sub")} WhatsApp</div>
                                </div>
                                <div className="flex space-x-2">
                                    <input type="checkbox" className="border-2 border-primary02" />
                                    <div className="text-text02">{t("marketing.sub")} Telegram</div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <input type="checkbox" className="border-2 border-primary02" />
                                <div className="text-text02">{t("marketing.sub")} Email</div>
                            </div>
                        </div>
                    </div>
                    <div className="font-semibold text-2xl text-text01">{t("marketing.loyalty")}</div>
                    <Input
                        type=""
                        title={`${t("marketing.card")}*`}
                        label={t("marketing.enterName")}
                        classname="w-96"
                        changeValue={() => { }}
                    />
                    <Input
                        type=""
                        title={`${t("marketing.un")}*`}
                        label={t("marketing.enterName")}
                        classname="w-96"
                        changeValue={() => { }}
                    />
                    <Input
                        type="date"
                        title={t("equipment.start")}
                        classname="w-40"
                        changeValue={() => { }}
                    />
                    <Input
                        type="date"
                        title={t("marketing.comp")}
                        classname="w-40"
                        changeValue={() => { }}
                    />
                    <Input
                        type="number"
                        title={t("marketing.cardType")}
                        label={t("warehouse.notSel")}
                        classname="w-80"
                        changeValue={() => { }}
                    />
                    <div className="flex space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                // resetForm();
                            }}
                        />
                        <Button
                            title={t("organizations.save")}
                            form={true}
                            // isLoading={isEditMode ? updatingInventory : isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </>
    )
}

export default Clients;