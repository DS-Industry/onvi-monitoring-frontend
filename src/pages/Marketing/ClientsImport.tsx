import Notification from "@/components/ui/Notification";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import { useButtonCreate } from "@/components/context/useContext";
import useSWRMutation from "swr/mutation";
import { createNomenclatureFile } from "@/services/api/warehouse";
import { useNavigate } from "react-router-dom";
import {
    DownloadOutlined,
    FileOutlined,
    CloseOutlined
} from "@ant-design/icons";

const ClientsImport: React.FC = () => {
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
        link.href = "src/assets/templates/template.xlsx";
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
            <div>
                {notificationVisible && <Notification
                    title={t("warehouse.loading")}
                    message={t("warehouse.importing")}
                    onClose={() => setNotificationVisible(false)}
                />}
                <div className="font-semibold text-2xl mt-5 text-primary02">{t("warehouse.fileSel")}</div>
                <div className="flex mt-5">
                    <div onClick={() => { setButtonOn(!buttonOn); }} className={`w-80 h-40 flex flex-col justify-center text-center cursor-pointer ${buttonOn ? "bg-white border-2 border-primary02" : "bg-background05"} rounded-2xl`}>
                        <div className={`flex justify-center text-center ${buttonOn ? "text-primary02" : "text-text01"}`}>
                            <FileOutlined />
                            <div className="ml-2 font-semibold text-lg">{t("warehouse.use")}</div>
                        </div>
                        <div className={`mt-2 ml-5 text-base ${buttonOn ? "text-text01" : "text-text02"} font-normal`}>{t("warehouse.download")}</div>
                    </div>
                </div>
                <div className="mt-14 w-[720px]">
                    <div className="flex items-center justify-between">
                        <div className=" text-text02 text-base font-normal">{t("warehouse.fileDown")}</div>
                        <div className="justify-end text-text02 text-base font-normal">{t("warehouse.xls")}</div>
                    </div>
                    <div className="border rounded-lg h-24 flex justify-center text-center flex-col">
                        {!selectedFile && (<div className={`flex m-auto`}>
                            <label htmlFor="file-upload" className="flex text-primary02 cursor-pointer space-x-2">
                                <DownloadOutlined />
                                <div>{t("warehouse.select")}</div>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="ml-2 text-text01">{t("warehouse.or")}</div>
                        </div>)}
                        {selectedFile && (
                            <div>
                                <div
                                    className="flex items-center justify-between space-x-3 p-2"
                                >
                                    <div className="flex">
                                        <div className="text-primary02">{selectedFile.name}</div>
                                        <div className="text-text01">({(selectedFile.size / 1024).toFixed(2)} kB)</div>
                                    </div>
                                    <button
                                        className="text-text02 justify-end"
                                        onClick={handleFileRemove}
                                    >
                                        <CloseOutlined />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex space-x-4 mt-10">
                    <Button
                        title={t("warehouse.reset")}
                        type='outline'
                        handleClick={() => { }}
                    />
                    <Button
                        title={t("pos.download")}
                        form={true}
                        handleClick={handleSubmit}
                        isLoading={isMutating}
                    />
                </div>
                <DrawerCreate classname="w-[444px]">
                    <div className="space-y-6">
                        <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("warehouse.fileReq")}</div>
                        <div className="font-normal text-base text-text01">{t("warehouse.toAvoid")}</div>
                        <div className="font-normal text-base text-text01">{t("warehouse.useCorr")}</div>
                        <div className="font-normal text-base text-text01">{t("warehouse.supp")}</div>
                        <Button
                            title={t("warehouse.down")}
                            type="outline"
                            iconDownload={true}
                            handleClick={handleDownload}
                        />
                    </div>
                </DrawerCreate>
            </div>
        </>
    )
}

export default ClientsImport;