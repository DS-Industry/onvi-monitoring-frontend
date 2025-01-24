import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from 'feather-icons-react';
import SegmentsDialog from "@/components/ui/Dialog/SegmentsDialog";

const columns = [
    { label: "Тип клиента", key: "clientType" },
    { label: "Теги", key: "tags" },
    { label: "Дата регистрации", key: "registrationDate" },
    { label: "Количество посещений", key: "visitCount" },
    { label: "Средний чек", key: "averageCheck" },
    { label: "Сумма заказов", key: "orderSum" },
    { label: "Диапазон дат посещений", key: "visitDateRange" },
    { label: "Бонусная программа", key: "bonusProgram" },
    { label: "Скидочная программа", key: "discountProgram" },
    { label: "Без программы", key: "noProgram" },
];

const NewSegment: React.FC = () => {
    const { t } = useTranslation();

    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleColumnToggle = (key: string) => {
        setSelectedColumns((prev) =>
            prev.includes(key)
                ? prev.filter((col) => col !== key)
                : [...prev, key]
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <div className="flex font-semibold space-x-1">
                    <div className="text-text01">{t("routine.fields")}</div>
                    <div className="text-textError">*</div>
                    <div className="text-text01">{t("routine.are")}</div>
                </div>
                <div className="flex space-x-4">
                    <Input
                        title={t("marketing.segName")}
                        classname="w-96"
                    />
                    <DropdownInput
                        title={`${t("pos.city")}*`}
                        classname="w-64"
                        value={undefined}
                        options={[]}
                    />
                    <DropdownInput
                        title={t("equipment.carWash")}
                        classname="w-64"
                        value={undefined}
                        options={[]}
                    />
                </div>
            </div>
            <div className="shadow-card h-20 w-[1128px] rounded-2xl flex items-center justify-center">
                <div className="flex text-primary02 cursor-pointer items-center justify-center font-semibold space-x-1" onClick={() => setIsModalOpen(true)}>
                    <Icon icon="plus" className="w-6 h-6" />
                    <div>{t("marketing.addSel")}</div>
                </div>
            </div>
            <div className="p-8">
                <SegmentsDialog
                    columns={columns}
                    selectedColumns={selectedColumns}
                    onColumnToggle={handleColumnToggle}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    setSelectedColumns={setSelectedColumns}
                />
                <div className="mt-6">
                    <h2 className="text-lg font-semibold">Selected Columns:</h2>
                    <ul className="list-disc pl-6">
                        {selectedColumns.map((col) => (
                            <li key={col}>{col}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default NewSegment;