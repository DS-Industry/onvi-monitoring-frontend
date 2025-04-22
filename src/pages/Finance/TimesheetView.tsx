import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ClockImage from "@icons/ClockImage.svg?react";
import Icon from 'feather-icons-react';
import { useLocation, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { createCashOper, getCashOperById, getCashOperCleanById, getCashOperRefundById, getCashOperSuspiciousById, getDayShiftById, returnDayShift, sendDayShift } from "@/services/api/finance";
import { columnsDataCashOper, columnsDataCashOperCleaning, columnsDataCashOperRefund, columnsDataCashOperSuspiciously } from "@/utils/OverFlowTableData";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { getDevices } from "@/services/api/equipment";
import useFormHook from "@/hooks/useFormHook";
import Button from "@/components/ui/Button/Button";
import useSWRMutation from "swr/mutation";
import NoDataUI from "@/components/ui/NoDataUI";
import NoTimeSheet from "@/assets/NoTimesheet.png";
import DynamicTable from "@/components/ui/Table/DynamicTable";

enum TypeWorkDayShiftReportCashOper {
    REFUND = "REFUND",
    REPLENISHMENT = "REPLENISHMENT"
}

type CreateCashOperBody = {
    type: TypeWorkDayShiftReportCashOper;
    sum: number;
    carWashDeviceId?: number;
    eventData?: Date;
    comment?: string;
}


const TimesheetView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('change');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenReturn, setIsModalOpenReturn] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { id: 'change', name: t("finance.change") },
        { id: 'exchange', name: t("finance.exchange") },
        { id: 'returns', name: t("finance.returns") },
        { id: 'cleaning', name: t("routes.cleaning") },
        { id: 'susp', name: t("finance.susp") }
    ];

    const { data: deviceData } = useSWR(location.state?.posId ? [`get-device`] : null, () => getDevices(location.state?.posId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const devices: { name: string; value: number; }[] = deviceData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const [ownerId, setOwnerId] = useState(location.state?.ownerId);

    useEffect(() => {
        if (location.state?.ownerId) {
            setOwnerId(location.state.ownerId);
        }
    }, [location.state?.ownerId]);

    const { data: dayShiftData, isValidating } = useSWR(
        ownerId ? [`get-shift-data`, ownerId] : null,  // Only fetch when ownerId is available
        () => getDayShiftById(ownerId),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const { data: cashOperData, isLoading: loadingCashOper } = useSWR(location.state?.ownerId ? [`get-cash-oper-data`] : null, () => getCashOperById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: cashOperReturnData, isLoading: loadingCashOperReturn } = useSWR(location.state?.ownerId ? [`get-cash-oper-return-data`] : null, () => getCashOperRefundById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: cashOperCleanData, isLoading: loadingCashOperClean } = useSWR(location.state?.ownerId ? [`get-cash-oper-clean-data`] : null, () => getCashOperCleanById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: cashOperSuspData, isLoading: loadingCashOperSusp } = useSWR(location.state?.ownerId ? [`get-cash-oper-susp-data`] : null, () => getCashOperSuspiciousById(location.state?.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const cashOperArray = cashOperData ? [cashOperData] : [];

    const cashOperReturnArray = cashOperReturnData?.map((item) => ({
        ...item.props,
        deviceName: devices.find((dev) => dev.value === item.props.carWashDeviceId)?.name
    })) || [];

    const transformDataForTable = (data: { deviceId: number; programData: { programName: string; countProgram: number; time: string }[] }[]) => {
        return data.flatMap(({ deviceId, programData }) =>
            programData.map(({ programName, countProgram, time }, index) => ({
                deviceName: index === 0 ? devices.find((dev) => dev.value === deviceId)?.name : null,
                programName,
                countProgram,
                time
            }))
        );
    };

    const cashOperCleanArray = cashOperCleanData && cashOperCleanData?.length > 0 ? transformDataForTable(cashOperCleanData) : [];

    const cashOperSubsArray = cashOperSuspData?.map((item) => ({
        ...item,
        deviceName: devices.find((dev) => dev.value === item.deviceId)?.name
    })) || [];

    const defaultValues = {
        type: undefined,
        sum: undefined,
        carWashDeviceId: undefined,
        eventData: undefined,
        comment: undefined
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook<CreateCashOperBody>(formData);

    const { trigger: createCash, isMutating: loadingCash } = useSWRMutation(['create-cash-oper'], async () => createCashOper({
        type: isModalOpenReturn ? "REFUND" as TypeWorkDayShiftReportCashOper : formData.type ? formData.type as TypeWorkDayShiftReportCashOper : "REPLENISHMENT" as TypeWorkDayShiftReportCashOper,
        sum: formData.sum || 0,
        carWashDeviceId: isModalOpenReturn ? undefined : formData.carWashDeviceId,
        eventData: formData.eventData,
        comment: formData.comment
    }, location.state?.ownerId));


    const { trigger: sendCash, isMutating: loadingSendCash } = useSWRMutation(['send-cash-oper'], async () => sendDayShift(location.state?.ownerId));

    const { trigger: returnCash, isMutating: loadingReturnCash } = useSWRMutation(['return-cash-oper'], async () => returnDayShift(location.state?.ownerId));

    type FieldType = "type" | "sum" | "carWashDeviceId" | "eventData" | "comment";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['sum', 'carWashDeviceId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
    };

    const onSubmit = async (data: unknown) => {
        console.log("Data of usbmit: ", data);

        const result = await createCash();

        if (result) {
            console.log("Result of the api: ", result);
            mutate([`get-cash-oper-return-data`]);
            mutate([`get-cash-oper-data`]);
        }
    }

    const handleSend = async () => {
        const result = await sendCash();

        if (result) {
            console.log("Result of the api: ", result);
            navigate(-1);
        }
    }

    const handleReturn = async () => {
        const result = await returnCash();

        if (result) {
            console.log("Result of the api: ", result);
            navigate(-1);
        }
    }

    if (isValidating && !dayShiftData) {
        return <TableSkeleton columnCount={5} />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* First Card */}
                <div className="w-full sm:w-[400px] h-auto sm:h-[148px] rounded-2xl shadow-card p-4 space-y-2">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="text-text01 font-semibold">{t("finance.shiftOver")}</div>
                            <div>
                                <div className="text-sm text-text02 font-semibold">{t("finance.curr")}</div>
                                <div className="flex space-x-2 text-text01">
                                    <div>
                                        {dayShiftData?.startWorkingTime
                                            ? (() => {
                                                const date = new Date(dayShiftData.startWorkingTime);
                                                const hours = date.getUTCHours();
                                                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                                                const period = hours >= 12 ? 'PM' : 'AM';
                                                const formattedHours = ((hours % 12) || 12).toString().padStart(2, '0');
                                                return `${formattedHours}:${minutes} ${period}`;
                                            })()
                                            : "09:00 AM"}
                                    </div>
                                    <div>-</div>
                                    <div>
                                        {dayShiftData?.endWorkingTime
                                            ? (() => {
                                                const date = new Date(dayShiftData.endWorkingTime);
                                                const hours = date.getUTCHours();
                                                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                                                const period = hours >= 12 ? 'PM' : 'AM';
                                                const formattedHours = ((hours % 12) || 12).toString().padStart(2, '0');
                                                return `${formattedHours}:${minutes} ${period}`;
                                            })()
                                            : "05:30 PM"}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#dbeafe] flex items-center justify-center">
                            <ClockImage />
                        </div>
                    </div>
                    <div className="w-full h-9 bg-[#f0fdf4] rounded flex space-x-2 items-center text-sm px-2 text-[#16a34a]">
                        <Icon icon="mail" className="w-[22px] h-[18px]" />
                        <div>{t("finance.status")}</div>
                        <div className="font-bold">{location.state?.status ? t(`tables.${location.state.status}`) : ""}</div>
                    </div>
                </div>

                {/* Second Card */}
                <div className="w-full sm:w-72 h-auto sm:h-[148px] rounded-2xl shadow-card p-4 space-y-2">
                    <div className="flex justify-between">
                        <div className="text-text01 font-semibold">{t("finance.grade")}</div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#fef9c3] flex items-center justify-center">
                            <Icon icon="star" className="text-[#ff9066] w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                    </div>
                    <div className={`w-full sm:w-[182px] h-14 ${dayShiftData?.estimation === "GROSS_VIOLATION" ? "bg-[#fef2f2] text-[#dc2626]" : dayShiftData?.estimation === "MINOR_VIOLATION" ? "bg-[#fff7ed] text-[#ea580c]" : dayShiftData?.estimation === "ONE_REMARK" ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-background05"} rounded-lg flex items-center justify-center text-sm px-2`}>
                        <div className="font-extrabold">{dayShiftData?.estimation ? t(`finance.${dayShiftData?.estimation}`) : ""}</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap space-x-4 border-b mb-6 w-full overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`pb-2 flex-1 min-w-[120px] sm:w-60 text-center ${activeTab === tab.id ? 'text-text01 border-b-4 border-primary02' : 'text-text02'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex space-x-10">
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.change") && (
                    <div className="flex flex-col">
                        <div className="flex flex-wrap gap-3 sm:gap-5">
                            <div className="flex flex-wrap gap-3">
                                <div className="h-28 w-full max-w-xs sm:max-w-sm md:max-w-md px-5 py-4 rounded-lg bg-background05 space-y-3">
                                    <div className="text-text01 font-bold text-xl sm:text-2xl md:text-3xl">{dayShiftData?.timeWorkedOut || "-"}</div>
                                    <div className="text-text02/70">{t("finance.time")}</div>
                                </div>
                                <div className="h-28 w-full max-w-xs sm:max-w-sm md:max-w-md px-5 py-4 rounded-lg bg-background05 space-y-3">
                                    <div className="text-successFill font-bold text-xl sm:text-2xl md:text-3xl">{dayShiftData?.prize ? `+${dayShiftData?.prize} ₽` : ""}</div>
                                    <div className="text-text02/70">{t("finance.prize")}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="h-28 w-full max-w-xs sm:max-w-sm md:max-w-md px-5 py-4 rounded-lg bg-background05 space-y-3">
                                    <div className="text-errorFill font-bold text-xl sm:text-2xl md:text-3xl">{dayShiftData?.fine ? `-${dayShiftData?.fine} ₽` : ""}</div>
                                    <div className="text-text02/70">{t("finance.fine")}</div>
                                </div>
                                <div className="h-28 w-full max-w-xs sm:max-w-sm md:max-w-lg px-5 py-4 rounded-lg bg-background05 space-y-3">
                                    <div className="text-text01">{dayShiftData?.comment || "-"}</div>
                                    <div className="text-text02/70">{t("equipment.comment")}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-start gap-3 sm:gap-4 mt-6 sm:mt-10">
                            {location.state.status === "SENT" && (
                                <Button
                                    title={t("finance.refund")}
                                    type="outline"
                                    handleClick={handleReturn}
                                    isLoading={loadingReturnCash}
                                />
                            )}
                            {location.state.status !== "SENT" && (
                                <Button
                                    title={t("finance.send")}
                                    handleClick={handleSend}
                                    isLoading={loadingSendCash}
                                />
                            )}
                        </div>
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.exchange") && (
                    <div className="w-full flex flex-col items-center">
                        <div className="w-full max-w-[1003px] h-fit rounded-2xl shadow-card px-3 sm:px-4 py-4 space-y-2 mt-5">
                            {location.state.status !== "SENT" && (
                                <button
                                    className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    {t("routes.add")}
                                </button>
                            )}
                            {loadingCashOper ? (
                                <TableSkeleton columnCount={columnsDataCashOper.length} />
                            ) : cashOperArray.length > 0 ? (
                                <DynamicTable data={cashOperArray.map((item, index) => ({ ...item, id: index }))} columns={columnsDataCashOper} />
                            ) : (
                                <div className="flex flex-col justify-center items-center">
                                    <NoDataUI title={t("finance.data")} description={t("finance.atThe")}>
                                        <img src={NoTimeSheet} className="mx-auto max-w-[80%] sm:max-w-[50%]" />
                                    </NoDataUI>
                                </div>
                            )}
                        </div>
                        {/* Modal */}
                        <Modal isOpen={isModalOpen}>
                            <div className="flex flex-row items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("finance.adding")}</h2>
                                <Close
                                    onClick={() => { resetForm(); setIsModalOpen(false); }}
                                    className="cursor-pointer text-text01"
                                />
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-text02">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DropdownInput
                                        title={t("finance.operType")}
                                        label={t("warehouse.notSel")}
                                        options={[
                                            { name: t("finance.REFUND"), value: "REFUND" },
                                            { name: t("finance.REPLENISHMENT"), value: "REPLENISHMENT" }
                                        ]}
                                        classname="w-full"
                                        {...register('type', { required: "Type is Required." })}
                                        value={formData.type}
                                        onChange={(value) => handleInputChange('type', value)}
                                        error={!!errors.type}
                                        helperText={errors.type?.message || ''}
                                    />
                                    <Input
                                        type="number"
                                        title={t("finance.sum")}
                                        classname="w-full"
                                        value={formData.sum}
                                        changeValue={(e) => handleInputChange('sum', e.target.value)}
                                        error={!!errors.sum}
                                        {...register('sum', { required: 'Sum is required' })}
                                        helperText={errors.sum?.message || ''}
                                    />
                                    <DropdownInput
                                        title={t("equipment.device")}
                                        label={devices.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                                        options={devices}
                                        classname="w-full"
                                        {...register('carWashDeviceId')}
                                        value={formData.carWashDeviceId}
                                        onChange={(value) => handleInputChange('carWashDeviceId', value)}
                                    />
                                    <Input
                                        type="datetime-local"
                                        title={t("finance.date")}
                                        classname="w-full"
                                        {...register('eventData')}
                                        value={formData.eventData}
                                        changeValue={(e) => handleInputChange('eventData', e.target.value)}
                                    />
                                </div>

                                <MultilineInput
                                    title={t("equipment.comment")}
                                    classname="w-full"
                                    {...register('comment')}
                                    value={formData.comment}
                                    changeValue={(e) => handleInputChange('comment', e.target.value)}
                                />

                                <div className="flex flex-wrap justify-end gap-3 mt-5">
                                    <Button
                                        title={"Сбросить"}
                                        handleClick={() => { resetForm(); setIsModalOpen(false); }}
                                        type="outline"
                                    />
                                    <Button
                                        title={"Сохранить"}
                                        form={true}
                                        isLoading={loadingCash}
                                    />
                                </div>
                            </form>
                        </Modal>
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.returns") && (
                    <div className="w-full flex flex-col items-center">
                        <div className="w-full max-w-full sm:max-w-[80%] lg:max-w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5 space-y-2">
                            {location.state.status !== "SENT" && (
                                <button
                                    className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal"
                                    onClick={() => setIsModalOpenReturn(true)}
                                >
                                    {t("routes.add")}
                                </button>
                            )}
                            {loadingCashOperReturn ? (
                                <TableSkeleton columnCount={columnsDataCashOperRefund.length} />
                            ) : cashOperReturnArray.length > 0 ? (
                                <DynamicTable data={cashOperReturnArray} columns={columnsDataCashOperRefund} />
                            ) : (
                                <div className="flex flex-col justify-center items-center">
                                    <NoDataUI title={t("finance.data")} description={t("finance.atThe")}>
                                        <img src={NoTimeSheet} className="mx-auto max-w-[80%] sm:max-w-[50%]" />
                                    </NoDataUI>
                                </div>
                            )}
                        </div>

                        {/* Modal */}
                        <Modal isOpen={isModalOpenReturn}>
                            <div className="flex flex-row items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("finance.adding")}</h2>
                                <Close
                                    onClick={() => { resetForm(); setIsModalOpenReturn(false); }}
                                    className="cursor-pointer text-text01"
                                />
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-text02">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        title={t("finance.sum")}
                                        classname="w-full"
                                        value={formData.sum}
                                        changeValue={(e) => handleInputChange('sum', e.target.value)}
                                        error={!!errors.sum}
                                        {...register('sum', { required: 'Sum is required' })}
                                        helperText={errors.sum?.message || ''}
                                    />
                                    <Input
                                        type="datetime-local"
                                        title={t("finance.date")}
                                        classname="w-full"
                                        {...register('eventData')}
                                        value={formData.eventData}
                                        changeValue={(e) => handleInputChange('eventData', e.target.value)}
                                    />
                                </div>
                                <MultilineInput
                                    title={t("equipment.comment")}
                                    classname="w-full"
                                    {...register('comment')}
                                    value={formData.comment}
                                    changeValue={(e) => handleInputChange('comment', e.target.value)}
                                />
                                <div className="flex flex-wrap justify-end gap-3 mt-5">
                                    <Button
                                        title={"Сбросить"}
                                        handleClick={() => { resetForm(); setIsModalOpenReturn(false); }}
                                        type="outline"
                                    />
                                    <Button
                                        title={"Сохранить"}
                                        form={true}
                                        isLoading={loadingCash}
                                    />
                                </div>
                            </form>
                        </Modal>
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("routes.cleaning") && (
                    <div className="w-full max-w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5 mx-auto">
                        {loadingCashOperClean ? (
                            <TableSkeleton columnCount={columnsDataCashOperCleaning.length} />
                        ) : cashOperCleanArray.length > 0 ? (
                            <DynamicTable
                                data={cashOperCleanArray.map((item, index) => ({ ...item, id: index }))}
                                columns={columnsDataCashOperCleaning}
                                showTotalClean={true}
                            />
                        ) : (
                            <div className="flex flex-col justify-center items-center text-center p-4">
                                <NoDataUI title={t("finance.data")} description={t("finance.atThe")}>
                                    <img src={NoTimeSheet} className="mx-auto w-3/4 sm:w-1/2 md:w-1/3" />
                                </NoDataUI>
                            </div>
                        )}
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.susp") && (
                    <div className="w-full max-w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5 mx-auto">
                        {loadingCashOperSusp ?
                            <TableSkeleton columnCount={columnsDataCashOperSuspiciously.length} />
                            : cashOperSubsArray.length > 0 ?
                                <DynamicTable
                                    data={cashOperSubsArray.map((item, index) => ({ ...item, id: index }))}
                                    columns={columnsDataCashOperSuspiciously}
                                /> : (
                                    <div className="flex flex-col justify-center items-center text-center p-4">
                                        <NoDataUI
                                            title={t("finance.data")}
                                            description={t("finance.atThe")}
                                        >
                                            <img src={NoTimeSheet} className="mx-auto w-3/4 sm:w-1/2 md:w-1/3" />
                                        </NoDataUI>
                                    </div>
                                )
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

export default TimesheetView;