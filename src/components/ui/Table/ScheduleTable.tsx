import React, { useState } from "react";
import Modal from "../Modal/Modal";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import DropdownInput from "../Input/DropdownInput";
import Input from "../Input/Input";
import MultilineInput from "../Input/MultilineInput";
import useFormHook from "@/hooks/useFormHook";
import Icon from "feather-icons-react";
import Button from "../Button/Button";

interface Employee {
    id: number;
    branch: string;
    name: string;
    position: string;
    schedule: { [key: string]: string }; // Key: date, Value: shift/work info
}

interface FormData {
    hours: string;
    minutes: string;
    isSet: boolean;
    prize: string;
    fine: string;
    comment: string;
    isCal: boolean;
    dayType: string;
    grade: string;
}

const employees: Employee[] = [
    {
        id: 1,
        branch: "Мойка_1",
        name: "Иванов Иван Иванович",
        position: "Мойщик",
        schedule: {},
    },
    {
        id: 2,
        branch: "Мойка_1",
        name: "Петров Петр Петрович",
        position: "Мойщик",
        schedule: {},
    },
    {
        id: 3,
        branch: "Мойка_1",
        name: "Сидоров Игнат Артемович",
        position: "Мойщик",
        schedule: {},
    },
];

const dates = [
    { day: "СР", date: "1" },
    { day: "ЧТ", date: "2" },
    { day: "ПТ", date: "3" },
    { day: "СБ", date: "4" },
    { day: "ВС", date: "5" },
    { day: "ПН", date: "6" },
    { day: "ВТ", date: "7" },
    { day: "СР", date: "8" },
    { day: "ЧТ", date: "9" },
    { day: "ПТ", date: "10" },
    { day: "СБ", date: "11" },
    { day: "ВС", date: "12" },
];

const ScheduleTable: React.FC = () => {
    const { t } = useTranslation();
    const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});
    const [filledData, setFilledData] = useState<Record<string, FormData>>({});
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");

    // Initialize Form Hook
    const { register, handleSubmit, setValue, watch, reset } = useFormHook({
        hours: "",
        minutes: "",
        isSet: false,
        prize: "",
        fine: "",
        comment: "",
        isCal: false,
        dayType: "",
        grade: ""
    });

    // Watch form values to ensure updates
    const hours = watch("hours");
    const minutes = watch("minutes");
    const prize = watch("prize");
    const fine = watch("fine");
    const comment = watch("comment");
    const isSet = watch("isSet");
    const isCal = watch("isCal");
    const dayType = watch("dayType");
    const grade = watch("grade");

    const handleOpenModal = (emp: Employee, date: string) => {
        const modalKey = `${emp.id}-${date}`;

        if (!filledData[modalKey]) {
            reset({
                hours: "",
                minutes: "",
                isSet: false,
                prize: "",
                fine: "",
                comment: "",
            });
        } else {
            reset(filledData[modalKey]); // Restore saved data
        }

        setOpenModals((prev) => ({ ...prev, [modalKey]: true }));
        setSelectedEmployee(emp);
        setSelectedDate(date);
    };

    const handleCloseModal = () => {
        if (!selectedEmployee || !selectedDate) return;
        const modalKey = `${selectedEmployee.id}-${selectedDate}`;
        setFilledData((prev) => ({
            ...prev,
            [modalKey]: watch(), // Save current form values
        }));
        setOpenModals((prev) => ({ ...prev, [modalKey]: false }));
        setSelectedEmployee(null);
        setSelectedDate("");
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0.5">
                <thead>
                    <tr className="border-background02 bg-background06 px-2.5 py-5 text-start text-sm font-semibold text-text01 uppercase tracking-wider">
                        <th>Мойка/Филиал</th>
                        <th>ФИО Сотрудника</th>
                        {dates.map((d, index) => (
                            <th key={index} className="border-b border-background02 bg-background06 px-2.5 py-5 text-start text-sm font-semibold text-text01 uppercase tracking-wider">
                                {d.day} <br /> {d.date}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.id}>
                            <td className="border-b border-b-[#E4E5E7] bg-background02 py-2 px-2.5 text-start text-sm font-semibold text-primary02">{emp.branch}</td>
                            <td className="border-b border-b-[#E4E5E7] bg-background02 py-2 px-2.5 text-start text-sm text-text01">
                                <span className="text-primary02 font-semibold text-sm">{emp.name}</span> <br />
                                <span className="text-text02 text-sm">{emp.position}</span>
                            </td>
                            {dates.map((d, index) => (
                                <td
                                    key={index}
                                    className="border border-borderFill bg-background02 cursor-pointer hover:bg-background05 py-2 px-2.5 text-start whitespace-nowrap text-sm text-text01"
                                    onClick={() => handleOpenModal(emp, d.date)}
                                >
                                    {/* Placeholder for input data */}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedEmployee && selectedDate && (
                <Modal isOpen={openModals[`${selectedEmployee.id}-${selectedDate}`]} onClose={handleCloseModal} typeSubmit={true} classname="max-h-[600px] overflow-y-auto">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text01">{selectedEmployee.name}, смена: {selectedDate}</h2>
                        <Close onClick={handleCloseModal} className="cursor-pointer text-text01" />
                    </div>
                    <form onSubmit={handleSubmit((data) => console.log("Submitted Data:", data))} className="space-y-4 text-text02">
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" className="w-[18px] h-[18px]" {...register("isSet")} />
                            <div>{t("finance.set")}</div>
                        </div>
                        {isSet && (<div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div>{t("finance.sch")}</div>
                                <Input
                                    type="number"
                                    classname="w-24"
                                    inputType="secondary"
                                />
                                <div>{t("finance.thr")}</div>
                                <Input
                                    type="number"
                                    classname="w-24"
                                    inputType="secondary"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <div>{t("finance.sta")}</div>
                                <div className="flex text-primary02_Hover font-semibold">
                                    <div>{t("finance.sel")}</div>
                                    <Icon icon="chevron-down" />
                                </div>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <div>{t("finance.open")}</div>
                                <Input
                                    type="number"
                                    placeholder="09 ч"
                                    classname="w-[68px]"
                                    inputType="secondary"
                                />
                                <Input
                                    type="number"
                                    placeholder="00 м"
                                    classname="w-[70px]"
                                    inputType="secondary"
                                />
                                <div>-</div>
                                <Input
                                    type="number"
                                    placeholder="09 ч"
                                    classname="w-[68px]"
                                    inputType="secondary"
                                />
                                <Input
                                    type="number"
                                    placeholder="00 м"
                                    classname="w-[70px]"
                                    inputType="secondary"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <div>{t("finance.ex")}</div>
                                <Input
                                    type="number"
                                    classname="w-24"
                                    inputType="secondary"
                                />
                                <div>{t("finance.a")}</div>
                            </div>
                            <Button
                                title={t("finance.fill")}
                            />
                        </div>
                        )}
                        <DropdownInput
                            title={t("finance.day")}
                            {...register("dayType")}
                            value={dayType}
                            options={[
                                { name: t("finance.work"),value: "workingday" },
                                { name: t("finance.dayOff"),value: "dayoff" },
                                { name: t("finance.sick"),value: "sick" },
                                { name: t("finance.vac"),value: "vacation" },
                                { name: t("finance.time"),value: "timeoff" },
                                { name: t("finance.abs"),value: "absent" }
                            ]}
                            label={t("finance.selectDay")}
                            classname="w-96"
                            onChange={(value) => setValue("dayType", value)}
                        />
                        <div>
                            <div>{t("finance.num")}</div>
                            <div className="flex space-x-2">
                                <Input
                                    type="number"
                                    placeholder="00 ч"
                                    classname="w-[68px]"
                                    {...register("hours")}
                                    value={hours}
                                    changeValue={(e) => setValue("hours", e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="00 м"
                                    classname="w-[70px]"
                                    {...register("minutes")}
                                    value={minutes}
                                    changeValue={(e) => setValue("minutes", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                                <input type="checkbox" className="w-[18px] h-[18px]" {...register("isCal")} />
                                <div>{t("finance.cal")}</div>
                            </div>
                            {isCal && (<div className="flex space-x-8">
                                <div>
                                    <div>{t("finance.start")}</div>
                                    <div className="flex space-x-2">
                                        <Input
                                            type="number"
                                            placeholder="00 ч"
                                            classname="w-[68px]"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="00 м"
                                            classname="w-[70px]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div>{t("finance.endOf")}</div>
                                    <div className="flex space-x-2">
                                        <Input
                                            type="number"
                                            placeholder="00 ч"
                                            classname="w-[68px]"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="00 м"
                                            classname="w-[70px]"
                                        />
                                    </div>
                                </div>
                            </div>)}
                        </div>
                        <div className="flex space-x-8">
                            <Input
                                type="number"
                                title={t("finance.prize")}
                                classname="w-44"
                                {...register("prize")}
                                value={prize}
                                changeValue={(e) => setValue("prize", e.target.value)}
                            />
                            <Input
                                type="number"
                                title={t("finance.fine")}
                                classname="w-44"
                                {...register("fine")}
                                value={fine}
                                changeValue={(e) => setValue("fine", e.target.value)}
                            />
                        </div>
                        <DropdownInput
                            title={t("finance.grade")}
                            {...register("grade")}
                            value={grade}
                            options={[
                                { name: t("finance.noc"),value: "nocomment" },
                                { name: t("finance.gross"),value: "gross" },
                                { name: t("finance.minor"),value: "minor" },
                                { name: t("finance.one"),value: "onetime" }
                            ]}
                            label={t("finance.noc")}
                            classname="w-96"
                            onChange={(value) => setValue("grade", value)}
                        />
                        <MultilineInput
                            title={t("equipment.comment")}
                            {...register("comment")}
                            value={comment}
                            changeValue={(e) => setValue("comment", e.target.value)}
                            classname="w-96"
                            label={t("finance.desc")}
                            inputType="secondary"
                        />
                    </form>
                </Modal>
            )}
        </div>
    );
};


export default ScheduleTable;


