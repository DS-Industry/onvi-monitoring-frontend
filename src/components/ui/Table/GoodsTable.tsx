import React, { useState } from "react";
import Input from "@ui/Input/Input";
import MultilineInput from "@ui/Input/MultilineInput";
import ArrowUp from "@icons/ArrowUp.png";
import ArrowDown from "@icons/ArrowDown.png";
import { useTranslation } from "react-i18next";

interface TableRow {
    id: number;
    [key: string]: string | number | boolean;
}

interface ColumnConfig {
    key: string;
    label: string;
    isEditable?: boolean;
    type?: "string" | "number" | "checkbox" | "date" | string;
    options?: { name: string; value: unknown }[];
    render?: (record: TableRow, handleChange?: (id: number, key: string, value: string | number) => void) => React.ReactNode;
}

// const initialColumns: ColumnConfig[] = [
//     { key: "selected", label: "", isEditable: false, type: "checkbox" },
//     { key: "name", label: "Номенклатура", isEditable: false, type: "text" },
//     {
//         key: "routine", label: "Рутина", isEditable: true, type: "dropdown", options: [
//             { name: "Ежедневно", value: "Daily" },
//             { name: "Еженедельно", value: "Weekly" },
//             { name: "Ежемесячно", value: "Monthly" },
//             { name: "Ежемесячно", value: "Monthly" },
//             { name: "Ежемесячно", value: "Monthly" },
//             { name: "Ежемесячно", value: "Monthly" },
//         ]
//     },
//     { key: "quantity", label: "Количество", isEditable: true, type: "number" },
//     { key: "unit", label: "Ед. измерения", isEditable: false, type: "text" },
//     { key: "price", label: "Цена", isEditable: true, type: "number" },
//     { key: "total", label: "Всего", isEditable: false, type: "number" },
//     { key: "vatPercent", label: "% НДС", isEditable: true, type: "number" },
// ];

const initialData: TableRow[] = [
    {
        id: 1,
        selected: false,
        name: "Шампунь_1, 5 литров",
        routine: "Daily",
        quantity: 1,
        unit: "шт",
        price: 2500,
        total: 2500,
        vatPercent: 20,
    },
    {
        id: 2,
        selected: true,
        name: "Шампунь_2, 1 литр",
        routine: "Weekly",
        quantity: 5,
        unit: "шт",
        price: 500,
        total: 2500,
        vatPercent: 20,
    },
];

type Props = {
    tableData: TableRow[];
    columns: ColumnConfig[];
    handleChange?: (id: number, key: string, value: string | number) => void;
    addRow?: () => void;
    addProduct?: () => void;
    showDocument?: boolean;
    documentName?: string;
    documentTime?: string;
    deleteRow?: () => void;
}

const GoodsTable: React.FC<Props> = ({
    tableData,
    columns,
    handleChange,
    addRow,
    addProduct,
    showDocument,
    documentName,
    documentTime,
    deleteRow
}: Props) => {
    const { t } = useTranslation();
    const [activeTab] = useState("tab1");
    // const [columnss] = useState<ColumnConfig[]>(initialColumns);
    const [, setTableData] = useState<TableRow[]>(initialData);

    const handleInputChange = (id: number, key: string, value: string | number | boolean) => {
        setTableData((prevData) =>
            prevData.map((row) =>
                row.id === id ? { ...row, [key]: value } : row
            )
        );
    };

    // const calculateSummary = () => {
    //     const total = tableDatas.reduce((sum, row) => sum + row.total, 0);
    //     const vat = tableDatas.reduce(
    //         (sum, row) => sum + (row.total * row.vatPercent) / 100,
    //         0
    //     );
    //     return { total, vat };
    // };

    const formatNumber = (num: number): string => {
        if (isNaN(num)) return num.toString();
        return num.toLocaleString("en-IN");
    };

    // const { total, vat } = calculateSummary();

    return (
        <div className="py-4 px-2 sm:px-4 bg-white rounded-lg font-sans">
            {activeTab === "tab1" && (
                <div className="shadow-card rounded-2xl pb-10">
                    {!showDocument ? (<div className="flex flex-wrap justify-between p-2 sm:p-4 gap-2">
                        <div className="space-x-2">
                            <button className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal" onClick={addProduct}>
                                {t("roles.addPro")}
                            </button>
                            <button className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal" onClick={addRow}>
                                {t("routes.add")}
                            </button>
                            <button className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal" onClick={deleteRow}>
                                {t("marketing.delete")}
                            </button>
                        </div>
                        <div className="space-x-2">
                            <button className="px-2 py-1 bg-background07/50 rounded">
                                <img src={ArrowUp} loading="lazy" alt="Arrow Up" />
                            </button>
                            <button className="px-2 py-1 bg-background07/50 rounded">
                                <img src={ArrowDown} loading="lazy" alt="Arrow Down" />
                            </button>
                        </div>
                    </div>) : (
                        <div className="flex space-x-3 text-text02 font-semibold p-2 sm:p-4">
                            <div>{documentName}</div>
                            <div>{documentTime}</div>
                        </div>
                    )}

                    {/* Table Wrapper for Scrollable Table */}
                    <div className="w-full overflow-x-auto sm:overflow-visible">
                        <table className="w-full min-w-max">
                            <thead>
                                <tr>
                                    {columns?.map((column) => (
                                        <th key={column.key}
                                            className={`border-b border-x-2 border-background02 bg-background06 px-1 py-1.5 text-sm text-start font-semibold text-text01 uppercase tracking-wider ${column.key === "check" ? "w-8" : ""}
                                            ${column.key === "nomenclatureId" ? "w-auto whitespace-nowrap" : ""}`}>
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData?.map((row: TableRow) => (
                                    <tr key={row.id}>
                                        {columns?.map((column) => (
                                            <td key={column.key}
                                                className={`border-b border-x-4 border-b-[#E4E5E7] border-x-background02 bg-background02 py-1.5 px-1 whitespace-nowrap text-sm font-normal first:text-primary02 text-text01 overflow-x-visible ${column.key === "nomenclatureId" ? "w-auto whitespace-nowrap" : ""}`}>
                                                {column.type === "checkbox" ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(row[column.key])}
                                                        onChange={() => handleInputChange(row.id, column.key, !row[column.key])}
                                                    />
                                                )
                                                    : column.render ? column.render(row, handleChange)
                                                        : column.type === 'number' ? (
                                                            row[column.key] ? formatNumber(Number(row[column.key])) : '-'
                                                        ) : (
                                                            row[column.key]
                                                        )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "tab2" && (
                <div className="shadow-card rounded-2xl space-y-6 p-4 sm:p-10">
                    <Input
                        type={"number"}
                        changeValue={() => { }}
                        classname="w-full sm:w-64"
                        title="Ответственный *"
                        label="Выберите ответственное лицо"
                    />
                    <MultilineInput
                        changeValue={() => { }}
                        classname="w-full sm:w-80"
                        title="Комментарий"
                    />
                </div>
            )}
        </div>

    );
};

export default GoodsTable;
