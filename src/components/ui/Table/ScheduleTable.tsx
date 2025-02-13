import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import DropdownInput from "../Input/DropdownInput";
import Input from "../Input/Input";
import MultilineInput from "../Input/MultilineInput";
import useFormHook from "@/hooks/useFormHook";
import Icon from "feather-icons-react";
import Button from "../Button/Button";
import RedDot from "@icons/RedDot.svg?react";
import OrangeDot from "@icons/OrangeDot.svg?react";
import GreenDot from "@icons/GreenDot.svg?react";
import BN from "@icons/Бл.svg?react";
import OTN from "@icons/ОТП.svg?react";
import O from "@icons/О.svg?react";
import NP from "@icons/Пр.svg?react"
import useSWR from "swr";
import { getPoses, getWorkers } from "@/services/api/equipment";
import useSWRMutation from "swr/mutation";
import { addWorker, getShiftById } from "@/services/api/finance";
import { useLocation } from "react-router-dom";

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

// const emps: Employee[] = [
//     {
//         id: 1,
//         branch: "Мойка_1",
//         name: "Иванов Иван Иванович",
//         position: "Мойщик",
//         schedule: {},
//     },
//     {
//         id: 2,
//         branch: "Мойка_1",
//         name: "Петров Петр Петрович",
//         position: "Мойщик",
//         schedule: {},
//     },
//     {
//         id: 3,
//         branch: "Мойка_1",
//         name: "Сидоров Игнат Артемович",
//         position: "Мойщик",
//         schedule: {},
//     },
// ];

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

type Props = {
    id: number;
}

const ScheduleTable: React.FC<Props> = ({
    id
}: Props) => {
    const { t } = useTranslation();
    const location = useLocation();

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const { data: shiftData } = useSWR(location?.state?.ownerId !== 0 ? [`get-shift-data`] : null, () => getShiftById(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const emp: {
        id: number;
        branch: string;
        name: string;
        position: string;
        schedule: { [key: string]: string }; // Key: date, Value: shift/work info
    }[] = [];
    const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});
    const [filledData, setFilledData] = useState<Record<string, FormData>>({});
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [employees, setEmployees] = useState(emp);
    const [userId, setUserId] = useState(0);
    const [isUser, setIsUser] = useState(false);

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

    const { trigger: addWork } = useSWRMutation(userId !== 0 ? ['add-worker'] : null, async () => addWorker({
        userId: userId
    }, id));

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

    useEffect(() => {
        if (shiftData) {
            const newEmployee: Employee[] = shiftData.workers.map((item) => ({
                id: item.workerId,
                name: item.name + " " + item.middlename + " " + item.surname,
                branch: poses.find((pos) => pos.value === shiftData.posId)?.name || "",
                position: item.position,
                schedule: {}
            }));
            setEmployees([...newEmployee]);
        } else {
            setEmployees([]);
        }
    }, [shiftData]);

    useEffect(() => {
        if (userId !== 0) {
            addWork().then((result) => {
                if (result) {
                    const newEmployee: Employee[] = result.workers.map((item) => ({
                        id: item.workerId,
                        name: item.name + " " + item.middlename + " " + item.surname,
                        branch: poses.find((pos) => pos.value === result.posId)?.name || "",
                        position: item.position,
                        schedule: {}
                    }));
                    setEmployees([...newEmployee]);
                }
            });
        }
    }, [userId]); // Trigger API call whenever userId changes

    const addNewRow = (value: React.SetStateAction<number>) => {
        setUserId(value); // This change will now trigger the API call via useEffect
    };


    // const addNewRow = async (value: React.SetStateAction<number>) => {
    //     setUserId(value)
    //     const result = await addWork();
    //     let newEmployee: Employee[] = [];
    //     if (result) {
    //         newEmployee = result.workers.map((item) => ({
    //             id: item.workerId,
    //             name: item.name + " " + item.middlename + " " + item.surname,
    //             branch: poses.find((pos) => pos.value === result.posId)?.name || "",
    //             position: item.position,
    //             schedule: {}
    //         }))
    //     }
    //     setEmployees([...newEmployee]);
    // };

    return (
        <div className="overflow-x-auto">
            {id !== 0 && employees && (<table className="w-full border-separate border-spacing-0.5">
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
                                    className={`border border-borderFill ${filledData[`${emp.id}-${d.date}`]?.dayType === "workingday" ? "bg-[#DDF5FF]" : "bg-background02"} cursor-pointer hover:bg-background05 py-2 px-2.5 items-center whitespace-nowrap text-sm text-text01`}
                                    onClick={() => handleOpenModal(emp, d.date)}
                                >   <div className="flex flex-col justify-between h-full min-h-[40px]">
                                        <div className="flex items-center m-auto"> {/* Center top div */}
                                            {filledData[`${emp.id}-${d.date}`]?.dayType === "sick" ? <BN /> :
                                                filledData[`${emp.id}-${d.date}`]?.dayType === "vacation" ? <OTN /> :
                                                    filledData[`${emp.id}-${d.date}`]?.dayType === "timeoff" ? <O /> :
                                                        filledData[`${emp.id}-${d.date}`]?.dayType === "absent" ? <NP /> :
                                                            <></>
                                            }
                                        </div>
                                        <div className="flex items-center justify-between mt-auto"> {/* Push bottom div to bottom */}
                                            {filledData[`${emp.id}-${d.date}`]?.grade === "gross" ? <RedDot className="w-2 h-2" /> :
                                                filledData[`${emp.id}-${d.date}`]?.grade === "minor" ? <OrangeDot className="w-2 h-2" /> :
                                                    filledData[`${emp.id}-${d.date}`]?.grade === "onetime" ? <GreenDot className="w-2 h-2" /> :
                                                        <></>
                                            }
                                            <div className="text-text02 text-xs"></div>
                                        </div>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>)}
            {id !== 0 && <div className="mt-5 flex space-x-1 text-primary02 items-center cursor-pointer" onClick={() => setIsUser(true)}>
                <Icon icon="plus" className="w-5 h-5" />
                <div>{t("finance.addE")}</div>
            </div>}
            {isUser && <div className="mt-5">
                <DropdownInput
                    value={userId}
                    options={workers}
                    onChange={addNewRow}
                    classname="w-64"
                />
            </div>}
            {id !== 0 && <div className="mt-5">
                <div className="flex justify-center space-x-10">
                    <div className="flex space-x-2 items-center">
                        <RedDot />
                        <div className="text-text01">{t("finance.gross")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <OrangeDot />
                        <div className="text-text01">{t("finance.minor")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <GreenDot />
                        <div className="text-text01">{t("finance.one")}</div>
                    </div>
                </div>
            </div>}
            {id !== 0 && <div className="mt-5">
                <div className="flex justify-center space-x-10">
                    <div className="flex space-x-2 items-center">
                        <div className="w-4 h-4 bg-[#DDF5FF]"></div>
                        <div className="text-text01">{t("finance.work")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <div className="w-4 h-4 border border-borderFill"></div>
                        <div className="text-text01">{t("finance.dayOff")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <BN />
                        <div className="text-text01">{t("finance.sick")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <OTN />
                        <div className="text-text01">{t("finance.vac")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <O />
                        <div className="text-text01">{t("finance.time")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <NP />
                        <div className="text-text01">{t("finance.abs")}</div>
                    </div>
                </div>
            </div>}
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
                                { name: t("finance.work"), value: "workingday" },
                                { name: t("finance.dayOff"), value: "dayoff" },
                                { name: t("finance.sick"), value: "sick" },
                                { name: t("finance.vac"), value: "vacation" },
                                { name: t("finance.time"), value: "timeoff" },
                                { name: t("finance.abs"), value: "absent" }
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
                                { name: t("finance.noc"), value: "nocomment" },
                                { name: t("finance.gross"), value: "gross" },
                                { name: t("finance.minor"), value: "minor" },
                                { name: t("finance.one"), value: "onetime" }
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


