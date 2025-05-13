import Notification from "@/components/ui/Notification";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from 'feather-icons-react';
import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import { useButtonCreate } from "@/components/context/useContext";
import useSWRMutation from "swr/mutation";
import { createNomenclatureFile } from "@/services/api/warehouse";
import { useNavigate } from "react-router-dom";

const InventoryImport: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null; // Get the first file
        setSelectedFile(file); // Update state with the single file
    };

    const handleFileRemove = () => {
        setSelectedFile(null); // Reset the selected file
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = "https://storage.yandexcloud.net/onvi-business/nomenclature/template.xlsx";
        link.download = "template.xlsx";
        link.click();
    };

    const { trigger: createInventory, isMutating } = useSWRMutation(
        ['create-inventory'],
        async (_, { arg }: { arg: { file: File } }) => {
            return createNomenclatureFile(arg);
        }
    );

    const handleSubmit = async () => {
        if (!selectedFile) {
            console.error("No file selected.");
            return;
        }

        const result = await createInventory({
            file: selectedFile
        });

        if (result) {
            navigate('/warehouse/inventory');
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6">
                {notificationVisible && (
                    <Notification
                        title={t("warehouse.loading")}
                        message={t("warehouse.importing")}
                        onClose={() => setNotificationVisible(false)}
                    />
                )}
                <div className="font-semibold text-xl sm:text-2xl mt-5 text-primary02">
                    {t("warehouse.fileSel")}
                </div>
                <div className="flex flex-col sm:flex-row mt-5 gap-4">
                    <div
                        onClick={() => setButtonOn(!buttonOn)}
                        className={`w-full sm:w-80 h-40 flex flex-col justify-center items-center cursor-pointer ${buttonOn ? "bg-white border-2 border-primary02" : "bg-background05"} rounded-2xl`}
                    >
                        <div className={`flex items-center space-x-2 ${buttonOn ? "text-primary02" : "text-text01"}`}>
                            <Icon icon="file" />
                            <div className="font-semibold text-lg">{t("warehouse.use")}</div>
                        </div>
                        <div
                            className={`mt-2 ml-5 text-base ${buttonOn ? "text-text01" : "text-text02"} font-normal`}
                        >
                            {t("warehouse.download")}
                        </div>
                    </div>
                </div>
                <div className="mt-10 w-full max-w-3xl">
                    <div className="flex flex-col sm:flex-row justify-between text-text02 text-base font-normal">
                        <div>{t("warehouse.fileDown")}</div>
                        <div>{t("warehouse.xls")}</div>
                    </div>
                    <div className="border rounded-lg h-24 flex justify-center items-center text-center mt-4">
                        {!selectedFile ? (
                            <div className="flex flex-wrap justify-center items-center gap-2">
                                <label htmlFor="file-upload" className="flex items-center text-primary02 cursor-pointer space-x-2">
                                    <Icon icon="download" />
                                    <div>{t("warehouse.select")}</div>
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className="text-text01">{t("warehouse.or")}</div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between space-x-3 p-2 w-full">
                                <div className="flex items-center truncate">
                                    <div className="text-primary02 truncate">{selectedFile.name}</div>
                                    <div className="text-text01 ml-2">({(selectedFile.size / 1024).toFixed(2)} kB)</div>
                                </div>
                                <button className="text-text02" onClick={handleFileRemove}>
                                    <Icon icon="x" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button title={t("warehouse.reset")} type="outline" handleClick={() => { }} />
                    <Button title={t("pos.download")} form handleClick={handleSubmit} isLoading={isMutating} />
                </div>
                <DrawerCreate classname="w-full max-w-lg">
                    <div className="space-y-6">
                        <div className="font-semibold text-xl sm:text-2xl mb-5 text-text01">
                            {t("warehouse.fileReq")}
                        </div>
                        <div className="font-normal text-base text-text01">{t("warehouse.toAvoid")}</div>
                        <div className="font-normal text-base text-text01">{t("warehouse.useCorr")}</div>
                        <div className="font-normal text-base text-text01">{t("warehouse.supp")}</div>
                        <div className="flex space-x-2">
                            <Button
                                title={t("organizations.cancel")}
                                handleClick={() => setButtonOn(false)}
                            />
                            <Button
                                title={t("warehouse.down")}
                                type="outline"
                                iconDownload={true}
                                handleClick={handleDownload}
                            />
                        </div>
                    </div>
                </DrawerCreate>
            </div>
        </>
    )
}

export default InventoryImport;