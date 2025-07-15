import React, { useState } from "react";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import { useTranslation } from "react-i18next";
import SegmentsDialog from "@/components/ui/Dialog/SegmentsDialog";
import Button from "@/components/ui/Button/Button";
import {
    PlusOutlined
} from "@ant-design/icons";

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

// Define mapping between column keys and Input components
const inputComponents: Record<string, React.ReactNode> = {
    clientType: <DropdownInput title="Тип клиента" classname="w-80" value={undefined} options={[]} />,
    tags: <Input title="Теги" classname="w-80" />,
    registrationDate: <Input type="date" title="Дата регистрации" classname="w-80" />,
    visitCount: (
        <div className="flex space-x-2">
            <Input type="number" title="Количество посещений (от)" classname="w-64" />
            <Input type="number" title="Количество посещений (до)" classname="w-64" />
        </div>
    ),
    averageCheck: (
        <div className="flex space-x-2">
            <Input type="number" title="Средний чек (от)" classname="w-64" />
            <Input type="number" title="Средний чек (до)" classname="w-64" />
        </div>
    ),
    orderSum: (
        <div className="flex space-x-2">
            <Input type="number" title="Сумма заказов (от)" classname="w-64" />
            <Input type="number" title="Сумма заказов (до)" classname="w-64" />
        </div>
    ),
    visitDateRange: (
        <div className="flex space-x-2">
            <Input type="date" title="Диапазон дат посещений (с)" classname="w-64" />
            <Input type="date" title="Диапазон дат посещений (по)" classname="w-64" />
        </div>
    ),
    bonusProgram: <Input title="Бонусная программа" classname="w-80" />,
    discountProgram: <Input title="Скидочная программа" classname="w-80" />,
    noProgram: <Input title="Без программы" classname="w-80" />,
};

const NewSegment: React.FC = () => {
    const { t } = useTranslation();
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const groupKeys = {
        "СЕГМЕНТАЦИЯ ПО ДАННЫМ КЛИЕНТА": ["clientType", "tags", "registrationDate"],
        "СЕГМЕНТАЦИЯ ПО ПОСЕЩЕНИЯМ": ["visitCount", "averageCheck", "orderSum", "visitDateRange"],
        "СЕГМЕНТАЦИЯ ПО ПРОГРАММЕ ЛОЯЛЬНОСТИ": ["bonusProgram", "discountProgram", "noProgram"],
    };

    const handleColumnToggle = (key: string) => {
        setSelectedColumns((prev) =>
            prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
        );
    };

    // Group selected columns by groupKeys
    const groupedInputs = Object.entries(groupKeys).reduce((acc, [group, keys]) => {
        const groupSelectedColumns = keys.filter((key) => selectedColumns.includes(key));
        if (groupSelectedColumns.length > 0) {
            acc.push({ group, components: groupSelectedColumns });
        }
        return acc;
    }, [] as { group: string; components: string[] }[]);

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div>
                <div className="flex font-semibold space-x-1">
                    <div className="text-text01">{t("routine.fields")}</div>
                    <div className="text-textError">*</div>
                    <div className="text-text01">{t("routine.are")}</div>
                </div>
                <div className="flex space-x-4">
                    <Input title={t("marketing.segName")} classname="w-96" />
                    <DropdownInput title={`${t("pos.city")}*`} classname="w-64" value={undefined} options={[]} />
                    <DropdownInput title={t("equipment.carWash")} classname="w-64" value={undefined} options={[]} />
                </div>
            </div>

            {/* Add Selection Button */}
            {selectedColumns.length === 0 && <div className="shadow-card h-20 w-[1128px] rounded-2xl flex items-center justify-center">
                <div
                    className="flex text-primary02 cursor-pointer items-center justify-center font-semibold space-x-1"
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusOutlined className="w-6 h-6" />
                    <div>{t("marketing.addSel")}</div>
                </div>
            </div>}

            {/* Dynamic Inputs Section */}
            <div>
                <SegmentsDialog
                    columns={columns}
                    selectedColumns={selectedColumns}
                    onColumnToggle={handleColumnToggle}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    setSelectedColumns={setSelectedColumns}
                />
                {selectedColumns.length > 0 && <div className="mt-6 space-y-4">
                    <div className="font-semibold text-2xl text-text01">{t("marketing.filterC")}</div>
                    {groupedInputs.map(({ group, components }) => (
                        <div key={group}>
                            <div className="text-sm text-text01 uppercase mb-4">{group}</div>
                            <div className="flex flex-wrap space-x-4">
                                {components.map((key) => (
                                    <div key={key}>{inputComponents[key]}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex space-x-4 items-center">
                        <Button
                            title={t("warehouse.reset")}
                            type="outline"
                        />
                        <Button
                            title={t("marketing.apply")}
                        />
                        <div className="text-primary02 cursor-pointer font-semibold" onClick={() => setIsModalOpen(true)}>
                            {t("marketing.edit")}
                        </div>
                    </div>
                    <div className="font-semibold text-2xl text-text01">{t("marketing.list")}</div>
                </div>
                }
            </div>
        </div>
    );
};

export default NewSegment;
