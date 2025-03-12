import React, { useState } from "react";
import Input from "../Input/Input";
import MultilineInput from "../Input/MultilineInput";
import ArrowUp from "@icons/ArrowUp.png";
import ArrowDown from "@icons/ArrowDown.png";
// import DropdownInput from "../Input/DropdownInput";

interface TableRow {
    id: number;
    [key: string]: any;
}

interface ColumnConfig {
    key: string;
    label: string;
    isEditable?: boolean;
    type?: "string" | "number" | "checkbox" | "date" | string;
    options?: { name: string; value: any }[];
    render?: any;
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
    tableData: any;
    columns: ColumnConfig[];
    handleChange?: (id: number, key: string, value: string | number) => void;
    addRow?: () => void;
    addProduct?: () => void;
}

const GoodsTable: React.FC<Props> = ({
    tableData,
    columns,
    handleChange,
    addRow,
    addProduct
}: Props) => {
    const [activeTab, setActiveTab] = useState("tab1");
    // const [columnss] = useState<ColumnConfig[]>(initialColumns);
    const [tableDatas, setTableData] = useState<TableRow[]>(initialData);

    const handleInputChange = (id: number, key: string, value: any) => {
        setTableData((prevData) =>
            prevData.map((row) =>
                row.id === id ? { ...row, [key]: value } : row
            )
        );
    };

    const calculateSummary = () => {
        const total = tableDatas.reduce((sum, row) => sum + row.total, 0);
        const vat = tableDatas.reduce(
            (sum, row) => sum + (row.total * row.vatPercent) / 100,
            0
        );
        return { total, vat };
    };

    const formatNumber = (num: number): string => {
        if (isNaN(num)) return num.toString();
        return num.toLocaleString("en-IN");
    };

    const { total, vat } = calculateSummary();

    return (
        <div className="py-4 px-2 sm:px-4 bg-white rounded-lg font-sans">
            {activeTab === "tab1" && (
                <div className="shadow-card rounded-2xl">
                    <div className="flex flex-wrap justify-between p-2 sm:p-4 gap-2">
                        <div className="space-x-2">
                            <button className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal" onClick={addProduct}>
                                Добавить товар
                            </button>
                            <button className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal" onClick={addRow}>
                                Отправить
                            </button>
                        </div>
                        <div className="space-x-2">
                            <button className="px-2 py-1 bg-background07/50 rounded">
                                <img src={ArrowUp} />
                            </button>
                            <button className="px-2 py-1 bg-background07/50 rounded">
                                <img src={ArrowDown} />
                            </button>
                        </div>
                    </div>

                    {/* Table Wrapper for Scrollable Table */}
                    <div className="w-full overflow-x-auto sm:overflow-visible">
                        <table className="w-full min-w-max">
                            <thead>
                                <tr>
                                    {columns?.map((column) => (
                                        <th key={column.key}
                                            className={`border-b border-x-2 border-background02 bg-background06 px-1 py-1.5 text-sm text-start font-semibold text-text01 uppercase tracking-wider ${column.key === "check" ? "w-8" : ""}`}>
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData?.map((row: any) => (
                                    <tr key={row.id}>
                                        {columns?.map((column) => (
                                            <td key={column.key}
                                                className="border-b border-x-4 border-b-[#E4E5E7] border-x-background02 bg-background02 py-1.5 px-1 whitespace-nowrap text-sm font-normal first:text-primary02 text-text01 overflow-x-visible">
                                                {column.type === "checkbox" ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={row[column.key]}
                                                        onChange={() => handleInputChange(row.id, column.key, !row[column.key])}
                                                    />
                                                )
                                                    : column.render ? column.render(row, handleChange)
                                                        : column.type === 'number' ? (
                                                            row[column.key] ? formatNumber(row[column.key]) : '-'
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

                    {/* Summary */}
                    <div className="flex flex-wrap gap-4 sm:gap-10 justify-end mt-6 p-2 sm:p-4">
                        <div className="flex">
                            <span className="font-semibold text-sm text-text02 flex justify-center items-center">Всего: </span>
                            <div className="border border-opacity01 rounded-md px-1 py-1.5 font-normal text-sm text-text02">{total.toFixed(2)}</div>
                        </div>
                        <div className="flex">
                            <span className="font-semibold text-sm text-text02 flex justify-center items-center">НДС в т.ч.: </span>
                            <div className="border border-opacity01 rounded-md px-1 py-1.5 font-normal text-sm text-text02">{vat.toFixed(2)}</div>
                        </div>
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
