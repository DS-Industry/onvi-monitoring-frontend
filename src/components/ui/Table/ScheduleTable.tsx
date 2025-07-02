import React, { useEffect, useMemo, useState } from "react";
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
import useSWR, { mutate } from "swr";
import { getPoses, getWorkers } from "@/services/api/equipment";
import useSWRMutation from "swr/mutation";
import { addWorker, createDayShift, getShiftById, updateDayShift } from "@/services/api/finance";
import { useLocation, useNavigate } from "react-router-dom";
import { useCity, usePosType } from "@/hooks/useAuthStore";

interface Employee {
    id: number;
    branch: string;
    name: string;
    position: string;
    userId: number;
}

type FormData = {
    typeWorkDay?: TypeWorkDay;
    timeWorkedOut?: string;
    hours_timeWorkedOut?: string;
    minutes_timeWorkedOut?: string;
    startWorkingTime?: string;
    hours_startWorkingTime?: string;
    minutes_startWorkingTime?: string;
    endWorkingTime?: string;
    hours_endWorkingTime?: string;
    minutes_endWorkingTime?: string;
    estimation?: TypeEstimation | null;
    prize?: number | null;
    fine?: number | null;
    comment?: string;
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

// const dates = [
//     { day: "СР", date: "1" },
//     { day: "ЧТ", date: "2" },
//     { day: "ПТ", date: "3" },
//     { day: "СБ", date: "4" },
//     { day: "ВС", date: "5" },
//     { day: "ПН", date: "6" },
//     { day: "ВТ", date: "7" },
//     { day: "СР", date: "8" },
//     { day: "ЧТ", date: "9" },
//     { day: "ПТ", date: "10" },
//     { day: "СБ", date: "11" },
//     { day: "ВС", date: "12" },
// ];

type TimeSheet = {
    props: {
        id: number;
        posId: number;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        updatedById: number;
    }
}

type Props = {
    id: number;
    shift: TimeSheet;
}

enum TypeWorkDay {
    WORKING = "WORKING",
    WEEKEND = "WEEKEND",
    MEDICAL = "MEDICAL",
    VACATION = "VACATION",
    TIMEOFF = "TIMEOFF",
    TRUANCY = "TRUANCY"
}

enum TypeEstimation {
    NO_VIOLATION = "NO_VIOLATION",
    GROSS_VIOLATION = "GROSS_VIOLATION",
    MINOR_VIOLATION = "MINOR_VIOLATION",
    ONE_REMARK = "ONE_REMARK"
}

const ScheduleTable: React.FC<Props> = ({
    id,
    shift
}: Props) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const city = useCity();

    useEffect(() => {
        if (shift?.props?.startDate && shift?.props?.endDate) {
            setStartDate(shift.props.startDate);
            setEndDate(shift.props.endDate);
        }
    }, [shift]);

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses = useMemo(() => {
        return posData?.map((item) => ({ name: item.name, value: item.id })) || [];
    }, [posData]);

    const workers = useMemo(() => {
        return workerData?.map((item) => ({
            name: item.name,
            value: item.id,
            surname: item.surname
        })) || [];
    }, [workerData]);

    const { data: shiftData } = useSWR(location.state?.ownerId ? [`get-shift-data`] : null, () => getShiftById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const emp: {
        id: number;
        branch: string;
        name: string;
        position: string;
        userId: number;
    }[] = [];
    const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});
    const [filledData, setFilledData] = useState<Record<string, FormData>>({});
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [employees, setEmployees] = useState(emp);
    const [userId, setUserId] = useState(0);
    const [openModalId, setOpenModalId] = useState(0);
    const [status, setStatus] = useState("");
    const [openAddRow, setOpenAddRow] = useState(false);
    const navigate = useNavigate();
    const posType = usePosType();
    const [posId, setPosId] = useState(posType);

    // Initialize Form Hook
    const { register, handleSubmit, setValue, watch, reset, errors } = useFormHook<FormData>({
        prize: undefined,
        fine: undefined,
        comment: "",
        typeWorkDay: "WEEKEND" as TypeWorkDay,
        estimation: undefined,
        timeWorkedOut: "",
        startWorkingTime: "",
        endWorkingTime: "",
        hours_timeWorkedOut: "",
        minutes_timeWorkedOut: "",
        hours_startWorkingTime: "",
        minutes_startWorkingTime: "",
        hours_endWorkingTime: "",
        minutes_endWorkingTime: ""
    });

    const { trigger: addWork, isMutating: addingWorker } = useSWRMutation(
        userId !== 0 ? ['add-worker'] : null,
        (_, { arg }: { arg: { userId: number; } }) => addWorker(arg, id)
    );

    const { trigger: createDay } = useSWRMutation(['create-day'],
        async (_, { arg }: {
            arg: {
                shiftReportId: number;
                userId: number;
                workDate: Date;
            }
        }) => {
            return createDayShift(arg);
        });

    const { trigger: updateDay, isMutating: updatingDayShift } = useSWRMutation(
        ['update-day-shift'],
        async (_, { arg }: {
            arg: {
                id: number; // ✅ Ensure id is passed
                typeWorkDay?: TypeWorkDay;
                timeWorkedOut?: string;
                startWorkingTime?: Date;
                endWorkingTime?: Date;
                estimation?: TypeEstimation;
                prize?: number;
                fine?: number;
                comment?: string;
            }
        }) => {
            return updateDayShift(arg, arg.id); // ✅ Pass id separately
        }
    );

    // Watch form values to ensure updates
    const prize = watch("prize");
    const fine = watch("fine");
    const comment = watch("comment");
    const typeWorkDay = watch("typeWorkDay");
    const estimation = watch("estimation");

    const watchFields = watch();

    const updateTime = (baseDate: string, hours: string, minutes: string) => {
        const date = new Date(baseDate);
        date.setUTCHours(parseInt(hours, 10));
        date.setUTCMinutes(parseInt(minutes, 10));
        return date.toISOString();
    };

    const handleTimeChange = (
        field: "timeWorkedOut" | "startWorkingTime" | "endWorkingTime",
        type: "hours" | "minutes",
        value: string
    ) => {
        const fieldHours = `hours_${field}` as keyof typeof watchFields;
        const fieldMinutes = `minutes_${field}` as keyof typeof watchFields;

        const startedTime = selectedDate.slice(0, 10);
        const endTime = selectedDate.slice(0, 10);

        setValue(type === "hours" ? fieldHours : fieldMinutes, value);

        const updatedHours = type === "hours"
            ? value
            : String(watchFields[fieldHours] || "00"); // Ensure it's a string

        const updatedMinutes = type === "minutes"
            ? value
            : String(watchFields[fieldMinutes] || "00"); // Ensure it's a string

        if (updatedHours !== "" && updatedMinutes !== "") {
            if (field === "startWorkingTime" && startedTime)
                setValue(field, updateTime(startedTime, updatedHours, updatedMinutes));
            else if (field === "endWorkingTime" && endTime)
                setValue(field, updateTime(endTime, updatedHours, updatedMinutes));
            else
                setValue(field, updatedHours.padStart(2, "0") + ":" + updatedMinutes.padStart(2, "0"));
        }
    };

    const handleOpenModal = async (emp: Employee, date: string) => {
        const modalKey = `${emp.userId}-${date}`;

        // Always update modal state first
        setOpenModals((prev) => ({ ...prev, [modalKey]: true }));
        setSelectedEmployee(emp);
        setSelectedDate(date);

        // Create or fetch the workday entry
        const result = await createDay({
            shiftReportId: id,
            userId: emp.userId,
            workDate: new Date(date)
        });

        setOpenModalId(result?.id);
        setStatus(result?.status || "");

        const updatedFormData = {
            typeWorkDay: result?.typeWorkDay || "",
            timeWorkedOut: result?.timeWorkedOut || "",
            hours_timeWorkedOut: result.timeWorkedOut?.split(":")[0] || "",
            minutes_timeWorkedOut: result.timeWorkedOut?.split(":")[1] || "",
            startWorkingTime: result?.startWorkingTime ? new Date(result.startWorkingTime).toISOString() : "",
            hours_startWorkingTime: result?.startWorkingTime ? new Date(result.startWorkingTime).getUTCHours().toString().padStart(2, "0") : "",
            minutes_startWorkingTime: result?.startWorkingTime ? new Date(result.startWorkingTime).getUTCMinutes().toString().padStart(2, "0") : "",
            endWorkingTime: result?.endWorkingTime ? new Date(result.endWorkingTime).toISOString() : "",
            hours_endWorkingTime: result?.endWorkingTime ? new Date(result.endWorkingTime).getUTCHours().toString().padStart(2, "0") : "",
            minutes_endWorkingTime: result?.endWorkingTime ? new Date(result.endWorkingTime).getUTCMinutes().toString().padStart(2, "0") : "",
            estimation: result?.estimation || undefined,
            prize: result?.prize ?? undefined, // Ensure it's empty when no value is provided
            fine: result?.fine ?? undefined,
            comment: result?.comment || ""
        };

        // Update filledData state
        setFilledData((prev) => ({
            ...prev,
            [modalKey]: updatedFormData, // Store API response
        }));

        // ✅ Reset form safely
        reset(updatedFormData);
    };

    const handleCloseModal = () => {
        if (!selectedEmployee || !selectedDate) return;

        const modalKey = `${selectedEmployee.userId}-${selectedDate}`;

        const formValues = watch();

        const updatedFormData: FormData = {
            typeWorkDay: formValues.typeWorkDay as TypeWorkDay, // Ensure correct type
            timeWorkedOut: formValues.timeWorkedOut || "",
            hours_timeWorkedOut: formValues.hours_timeWorkedOut || "",
            minutes_timeWorkedOut: formValues.minutes_timeWorkedOut || "",
            startWorkingTime: formValues.startWorkingTime || "",
            hours_startWorkingTime: formValues.hours_startWorkingTime || "",
            minutes_startWorkingTime: formValues.minutes_startWorkingTime || "",
            endWorkingTime: formValues.endWorkingTime || "",
            hours_endWorkingTime: formValues.hours_endWorkingTime || "",
            minutes_endWorkingTime: formValues.minutes_endWorkingTime || "",
            estimation: formValues.estimation ?? undefined, // Ensure it's null instead of undefined
            prize: formValues.prize ?? undefined,
            fine: formValues.fine ?? undefined,
            comment: formValues.comment || "",
        };

        setFilledData((prev) => ({
            ...prev,
            [modalKey]: updatedFormData, // Ensure correct type assignment
        }));

        setOpenModals((prev) => ({ ...prev, [modalKey]: false }));
        setSelectedEmployee(null);
        setSelectedDate("");
    };


    useEffect(() => {
        if (shiftData?.workers?.length) {  // Ensure workers array exists and is not empty
            const newEmployee: Employee[] = shiftData.workers.map((item) => ({
                id: item.workerId,
                name: `${item.name} ${item.middlename} ${item.surname}`,
                branch: poses.find((pos) => pos.value === shiftData.posId)?.name || "",
                position: item.position,
                userId: workers.find((work) => work.surname === item.surname)?.value || 0
            }));

            const newFilledData: { [key: string]: any } = {};
            shiftData.workers.forEach((worker) => {
                worker.workDays?.forEach((work) => {  // Ensure workDays exists before iterating
                    const modalKey = `${worker.workerId}-${work.workDate}`;
                    newFilledData[modalKey] = {
                        typeWorkDay: work.typeWorkDay,
                        timeWorkedOut: work.timeWorkedOut,
                        startWorkingTime: work.startWorkingTime,
                        endWorkingTime: work.endWorkingTime,
                        estimation: work.estimation,
                        prize: work.prize,
                        fine: work.fine
                    };
                });
            });

            setFilledData((prev) => {
                return JSON.stringify(prev) === JSON.stringify(newFilledData) ? prev : newFilledData;
            });

            setEmployees((prev) => {
                return JSON.stringify(prev) === JSON.stringify(newEmployee) ? prev : [...newEmployee];
            });

            setStartDate(shiftData.startDate);
            setEndDate(shiftData.endDate);
            setPosId(shiftData.posId);
        } else {
            setEmployees([]);
        }
    }, [shiftData, filledData, workers, poses]);

    const generateDates = (start: string | Date, end: string | Date) => {
        const dates = [];
        const daysOfWeek = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

        const startDate = new Date(start);
        const endDate = new Date(end);

        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        for (let time = startTime; time <= endTime; time += 86400000) {
            const currentDate = new Date(time);
            dates.push({
                day: daysOfWeek[currentDate.getDay()],
                date: currentDate.getDate().toString(),
                workDate: currentDate.toISOString()
            });
        }

        return dates;
    };

    const dates = generateDates(startDate, endDate);


    const handleModalSubmit = async () => {
        if (userId) {

            try {
                const result = await addWork({ userId: userId });

                if (result) {
                    const newEmployee: Employee[] = result.workers.map((item) => ({
                        id: item.workerId,
                        name: item.name + " " + item.middlename + " " + item.surname,
                        branch: poses.find((pos) => pos.value === result.posId)?.name || "",
                        position: item.position,
                        userId: workers.find((work) => work.name === item.name)?.value || 0
                    }));
                    setEmployees([...newEmployee]);
                    setOpenAddRow(false);
                } else {
                    console.error("Adding worker did not return expected data:", result);
                }
            } catch (error) {
                console.error("Error adding worker:", error);
            }
        }
    };

    const addNewRow = (value: React.SetStateAction<number>) => {
        setUserId(value);
    };


    const onSubmit = async () => {
        // Call API
        const result = await updateDay({
            id: openModalId,
            typeWorkDay: typeWorkDay as TypeWorkDay,
            timeWorkedOut: watchFields["timeWorkedOut"],
            startWorkingTime: watchFields["startWorkingTime"] ? new Date(watchFields["startWorkingTime"]) : undefined,
            endWorkingTime: watchFields["endWorkingTime"] ? new Date(watchFields["endWorkingTime"]) : undefined,
            estimation: estimation as unknown as TypeEstimation,
            prize: Number(prize),
            fine: Number(fine),
            comment: comment
        });

        if (result) {
            reset({
                typeWorkDay: result.typeWorkDay,
                timeWorkedOut: result.timeWorkedOut,
                hours_timeWorkedOut: result.timeWorkedOut?.split(":")[0],
                minutes_timeWorkedOut: result.timeWorkedOut?.split(":")[1],
                startWorkingTime: result.startWorkingTime ? new Date(result.startWorkingTime).toISOString() : undefined,
                endWorkingTime: result.endWorkingTime ? new Date(result.endWorkingTime).toISOString() : undefined,
                estimation: result.estimation,
                prize: result.prize,
                fine: result.fine,
                comment: result.comment
            });
            if (result.typeWorkDay === "WORKING") {
                const name = workers.find((work) => work.value === result.workerId)?.name;
                const surname = workers.find((work) => work.value === result.workerId)?.surname;
                navigate("/finance/timesheet/view", { state: { ownerId: result.id, posId: posId, name: `${name} ${surname}`, date: result.workDate, status: result.status } });
            }
            mutate([`get-shift-data`]);
        }
    }

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
        <div>
            {id !== 0 && employees && (
                <div className="max-w-7xl overflow-x-auto">
                    <table className="w-fit table-fixed border-separate border-spacing-0.5">
                        <thead>
                            <tr className="border-background02 bg-background06 px-2.5 py-5 text-start text-sm font-semibold text-text01 uppercase">
                                <th className="w-32 h-16">Мойка/Филиал</th>
                                <th className="w-60 h-16">ФИО Сотрудника</th>
                                {dates.map((d, index) => (
                                    <th key={index} className="border-b border-background02 bg-background06 px-2.5 py-5 text-start text-sm font-semibold text-text01 uppercase tracking-wider w-16 h-16">
                                        {d.day} <br /> {d.date}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td className="border-b border-b-[#E4E5E7] bg-background02 py-2 px-2.5 text-start text-sm font-semibold text-primary02 w-32 h-16">{emp.branch}</td>
                                    <td className="border-b border-b-[#E4E5E7] bg-background02 py-2 px-2.5 text-start text-sm text-text01 w-60 h-16">
                                        <span className="text-primary02 font-semibold text-sm">{emp.name}</span> <br />
                                        <span className="text-text02 text-sm">{emp.position}</span>
                                    </td>
                                    {dates.map((d, index) => {
                                        const cellKey = `${emp.userId}-${d.workDate}`;
                                        const currentData = filledData[cellKey];

                                        const start = currentData?.startWorkingTime ? new Date(currentData.startWorkingTime) : null;
                                        const end = currentData?.endWorkingTime ? new Date(currentData.endWorkingTime) : null;

                                        const isCrossDayShift = start && end && start > end;

                                        const splitWorkedTime = { current: "", next: "" };

                                        if (isCrossDayShift && start && end && currentData) {
                                            const hoursWorked = currentData.timeWorkedOut
                                                ? parseFloat(currentData.timeWorkedOut.split(":")[0])
                                                : 0;
                                            const currentDayHours = 24 - start.getHours();
                                            const nextDayHours = hoursWorked - currentDayHours;

                                            splitWorkedTime.current = `${currentDayHours}:00`;
                                            splitWorkedTime.next = `${nextDayHours}:00`;
                                        }


                                        const isWorking = currentData?.typeWorkDay === "WORKING";

                                        const leftHalfForIndex = new Set();

                                        dates.forEach((d, index) => {
                                            const cellKey = `${emp.userId}-${d.workDate}`;
                                            const currentData = filledData[cellKey];
                                            const start = currentData?.startWorkingTime ? new Date(currentData.startWorkingTime) : null;
                                            const end = currentData?.endWorkingTime ? new Date(currentData.endWorkingTime) : null;

                                            const isCross = start && end && start > end;

                                            if (isCross && index + 1 < dates.length) {
                                                leftHalfForIndex.add(index + 1);
                                            }
                                        });

                                        const hasLeftHalf = leftHalfForIndex.has(index);

                                        // Set style for split background
                                        const cellStyle = isCrossDayShift
                                            ? { background: 'linear-gradient(to right, transparent 50%, #DDF5FF 50%)' }
                                            : hasLeftHalf
                                                ? { background: 'linear-gradient(to left, transparent 50%, #DDF5FF 50%)' }
                                                : {};

                                        return (
                                            <td
                                                key={index}
                                                className={`relative border border-borderFill w-16 h-16
                cursor-pointer hover:bg-background05 text-sm text-text01 ${isWorking ? "bg-background06" : ""}`}
                                                style={cellStyle}
                                                onClick={() => handleOpenModal(emp, d.workDate)}
                                            >
                                                <div className="flex flex-col justify-between overflow-hidden">
                                                    <div className="flex items-center justify-center">
                                                        {currentData?.timeWorkedOut ? (
                                                            <div>{currentData.timeWorkedOut}</div>
                                                        ) : currentData?.typeWorkDay === "MEDICAL" ? (
                                                            <BN />
                                                        ) : currentData?.typeWorkDay === "VACATION" ? (
                                                            <OTN />
                                                        ) : currentData?.typeWorkDay === "TIMEOFF" ? (
                                                            <O />
                                                        ) : currentData?.typeWorkDay === "TRUANCY" ? (
                                                            <NP />
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        {currentData?.estimation === "GROSS_VIOLATION" ? (
                                                            <RedDot className="w-2 h-2" />
                                                        ) : currentData?.estimation === "MINOR_VIOLATION" ? (
                                                            <OrangeDot className="w-2 h-2" />
                                                        ) : currentData?.estimation === "ONE_REMARK" ? (
                                                            <GreenDot className="w-2 h-2" />
                                                        ) : (
                                                            <></>
                                                        )}
                                                        <div className="flex ml-auto space-x-1">
                                                            <div className="text-text02 text-xs max-w-[25px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                                {currentData?.prize ? `+${currentData.prize}` : ""}
                                                            </div>
                                                            <div className="text-text02 text-xs max-w-[25px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                                {currentData?.fine ? `-${currentData.fine}` : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>)}
            {id !== 0 && <div className="mt-5 flex space-x-1 text-primary02 items-center cursor-pointer" onClick={() => setOpenAddRow(true)}>
                <Icon icon="plus" className="w-5 h-5" />
                <div>{t("finance.addE")}</div>
            </div>}
            {id !== 0 && (
                <div className="mt-5">
                    {/* First Row */}
                    <div className="flex flex-wrap justify-center gap-x-10 sm:gap-x-5 gap-y-3">
                        <div className="flex space-x-2 items-center">
                            <RedDot />
                            <div className="text-text01">{t("finance.GROSS_VIOLATION")}</div>
                        </div>
                        <div className="flex space-x-2 items-center">
                            <OrangeDot />
                            <div className="text-text01">{t("finance.MINOR_VIOLATION")}</div>
                        </div>
                        <div className="flex space-x-2 items-center">
                            <GreenDot />
                            <div className="text-text01">{t("finance.ONE_REMARK")}</div>
                        </div>
                    </div>
                </div>
            )}
            {id !== 0 && (
                <div className="mt-5">
                    {/* Second Row */}
                    <div className="flex flex-wrap justify-center gap-x-10 sm:gap-x-5 gap-y-3">
                        <div className="flex space-x-2 items-center">
                            <div className="w-4 h-4 bg-[#DDF5FF]"></div>
                            <div className="text-text01">{t("finance.WORKING")}</div>
                        </div>
                        <div className="flex space-x-2 items-center">
                            <div className="w-4 h-4 border border-borderFill"></div>
                            <div className="text-text01">{t("finance.WEEKEND")}</div>
                        </div>
                        <div className="flex space-x-2 items-center">
                            <BN />
                            <div className="text-text01">{t("finance.MEDICAL")}</div>
                        </div>
                        <div className="flex space-x-2 items-center">
                            <OTN />
                            <div className="text-text01">{t("finance.VACATION")}</div>
                        </div>
                        <div className="flex space-x-2 items-center">
                            <O />
                            <div className="text-text01">{t("finance.TIMEOFF")}</div>
                        </div>
                        <div className="flex space-x-2 items-center">
                            <NP />
                            <div className="text-text01">{t("finance.TRUANCY")}</div>
                        </div>
                    </div>
                </div>
            )}
            {selectedEmployee && selectedDate && (
                <Modal isOpen={openModals[`${selectedEmployee.userId}-${selectedDate}`]} classname="max-h-[650px] px-8 py-8 overflow-y-auto">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text01">{selectedEmployee.name}, смена: {new Date(selectedDate).getDate()}</h2>
                        <Close onClick={handleCloseModal} className="cursor-pointer text-text01" />
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="text-text02">
                        {/* <div className="flex items-center space-x-2">
                            <input type="checkbox" className="w-[18px] h-[18px]" />
                            <div>{t("finance.set")}</div>
                        </div> */}
                        {/* {isSet && (<div className="space-y-4">
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
                        )} */}
                        <DropdownInput
                            title={t("finance.day")}
                            {...register("typeWorkDay")}
                            value={typeWorkDay}
                            options={[
                                { name: t("finance.WORKING"), value: "WORKING" },
                                { name: t("finance.WEEKEND"), value: "WEEKEND" },
                                { name: t("finance.MEDICAL"), value: "MEDICAL" },
                                { name: t("finance.VACATION"), value: "VACATION" },
                                { name: t("finance.TIMEOFF"), value: "TIMEOFF" },
                                { name: t("finance.TRUANCY"), value: "TRUANCY" }
                            ]}
                            classname="w-80 sm:w-96 mb-4"
                            onChange={(value) => setValue("typeWorkDay", value)}
                            isDisabled={status === "SENT"}
                        />
                        {typeWorkDay === "WORKING" && (<div className="space-y-2">
                            <div>
                                <div>{t("finance.num")}</div>
                                <div className="flex space-x-2">
                                    <Input
                                        type="number"
                                        placeholder="00 ч"
                                        classname="w-[68px]"
                                        {...register("hours_timeWorkedOut", {
                                            required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                        })}
                                        value={watchFields["hours_timeWorkedOut"]}
                                        changeValue={(e) => handleTimeChange("timeWorkedOut", "hours", e.target.value)}
                                        error={!!errors.hours_timeWorkedOut}
                                        disabled={status === "SENT"}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="00 м"
                                        classname="w-[70px]"
                                        {...register("minutes_timeWorkedOut", {
                                            required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                        })}
                                        value={watchFields["minutes_timeWorkedOut"]}
                                        changeValue={(e) => handleTimeChange("timeWorkedOut", "minutes", e.target.value)}
                                        error={!!errors.minutes_timeWorkedOut}
                                        disabled={status === "SENT"}
                                    />
                                </div>
                                {/* <div className="flex items-center space-x-2 mt-2">
                                <input type="checkbox" className="w-[18px] h-[18px]" {...register("isCal")} />
                                <div>{t("finance.cal")}</div>
                            </div> */}
                                <div className="flex space-x-8 mt-2">
                                    <div>
                                        <div>{t("finance.start")}</div>
                                        <div className="flex space-x-2">
                                            <Input
                                                type="number"
                                                placeholder="00 ч"
                                                classname="w-[68px]"
                                                {...register("hours_startWorkingTime", {
                                                    required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                                })}
                                                value={watchFields["hours_startWorkingTime"]}
                                                changeValue={(e) => handleTimeChange("startWorkingTime", "hours", e.target.value)}
                                                error={!!errors.hours_startWorkingTime}
                                                disabled={status === "SENT"}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="00 м"
                                                classname="w-[70px]"
                                                {...register("minutes_startWorkingTime", {
                                                    required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                                })}
                                                value={watchFields["minutes_startWorkingTime"]}
                                                changeValue={(e) => handleTimeChange("startWorkingTime", "minutes", e.target.value)}
                                                error={!!errors.minutes_startWorkingTime}
                                                disabled={status === "SENT"}
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
                                                {...register("hours_endWorkingTime", {
                                                    required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                                })}
                                                value={watchFields["hours_endWorkingTime"]}
                                                changeValue={(e) => handleTimeChange("endWorkingTime", "hours", e.target.value)}
                                                error={!!errors.hours_endWorkingTime}
                                                disabled={status === "SENT"}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="00 м"
                                                classname="w-[70px]"
                                                {...register("minutes_endWorkingTime", {
                                                    required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                                })}
                                                value={watchFields["minutes_endWorkingTime"]}
                                                changeValue={(e) => handleTimeChange("endWorkingTime", "minutes", e.target.value)}
                                                error={!!errors.minutes_endWorkingTime}
                                                disabled={status === "SENT"}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-8">
                                <Input
                                    type="number"
                                    title={t("finance.prize")}
                                    classname="w-44"
                                    {...register("prize")}
                                    value={prize}
                                    changeValue={(e) => setValue("prize", e.target.value)}
                                    disabled={status === "SENT"}
                                />
                                <Input
                                    type="number"
                                    title={t("finance.fine")}
                                    classname="w-44"
                                    {...register("fine")}
                                    value={fine}
                                    changeValue={(e) => setValue("fine", e.target.value)}
                                    disabled={status === "SENT"}
                                />
                            </div>
                            <DropdownInput
                                title={t("finance.grade")}
                                {...register("estimation")}
                                value={estimation}
                                options={[
                                    { name: t("finance.NO_VIOLATION"), value: "NO_VIOLATION" },
                                    { name: t("finance.GROSS_VIOLATION"), value: "GROSS_VIOLATION" },
                                    { name: t("finance.MINOR_VIOLATION"), value: "MINOR_VIOLATION" },
                                    { name: t("finance.ONE_REMARK"), value: "ONE_REMARK" }
                                ]}
                                classname="w-80 sm:w-96"
                                onChange={(value) => setValue("estimation", value)}
                                isDisabled={status === "SENT"}
                            />
                            <MultilineInput
                                title={t("equipment.comment")}
                                {...register("comment")}
                                value={comment}
                                changeValue={(e) => setValue("comment", e.target.value)}
                                classname="w-80 sm:w-96"
                                // label={t("finance.desc")}
                                inputType="secondary"
                                disabled={status === "SENT"}
                            />
                        </div>)}
                        <div className="flex gap-3 mt-14">
                            <Button
                                title={t("warehouse.reset")}
                                handleClick={handleCloseModal}
                                type="outline"
                            />
                            <Button
                                title={t("finance.openR")}
                                form={true}
                                isLoading={updatingDayShift}
                            />
                        </div>
                    </form>
                </Modal>
            )}
            <Modal isOpen={openAddRow} onClose={() => setOpenAddRow(false)} handleClick={handleModalSubmit} loading={addingWorker}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01">{t("finance.addNew")}</h2>
                    <Close onClick={() => setOpenAddRow(false)} className="cursor-pointer text-text01" />
                </div>
                <div className="mt-5">
                    <DropdownInput
                        value={userId}
                        options={workers}
                        onChange={addNewRow}
                        classname="w-[292px]"
                    />
                </div>
            </Modal>
        </div>
    );
};


export default ScheduleTable;


