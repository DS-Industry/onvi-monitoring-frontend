import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ClockImage from "@icons/ClockImage.svg?react";
import Icon from 'feather-icons-react';
import { useLocation } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { createCashOper, getCashOperById, getCashOperCleanById, getCashOperRefundById, getCashOperSuspiciousById, getDayShiftById, returnDayShift, sendDayShift } from "@/services/api/finance";
import OverflowTable from "@/components/ui/Table/OverflowTable";
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

    const cashOperArray = [cashOperData];

    const cashOperReturnArray = cashOperReturnData?.map((item) => item.props) || [];

    const transformDataForTable = (data: { deviceId: number; programData: { programName: string; countProgram: number; time: string }[] }[]) => {
        return data.flatMap(({ deviceId, programData }) =>
            programData.map(({ programName, countProgram, time }, index) => ({
                deviceId: index === 0 ? deviceId : null,
                programName,
                countProgram,
                time
            }))
        );
    };

    const cashOperCleanArray = cashOperCleanData && cashOperCleanData?.length > 0 ? transformDataForTable(cashOperCleanData) : [];

    const cashOperSubsArray = cashOperSuspData || [];

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
        type: isModalOpen ? "REFUND" as TypeWorkDayShiftReportCashOper : formData.type ? formData.type as TypeWorkDayShiftReportCashOper : "REPLENISHMENT" as TypeWorkDayShiftReportCashOper,
        sum: formData.sum || 0,
        carWashDeviceId: isModalOpen ? undefined : formData.carWashDeviceId,
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
            if (isModalOpenReturn)
                mutate([`get-cash-oper-return-data`]);
            if (isModalOpen)
                mutate([`get-cash-oper-data`]);
        }
    }

    const handleSend = async () => {
        const result = await sendCash();

        if (result) {
            console.log("Result of the api: ", result);
            // navigate("/finance/timesheet/creation");
        }
    }

    const handleReturn = async () => {
        const result = await returnCash();

        if (result) {
            console.log("Result of the api: ", result);
            // navigate("/finance/timesheet/creation");
        }
    }

    if (isValidating && !dayShiftData) {
        return <TableSkeleton columnCount={5} />;
    }

    return (
        <div className="space-y-4">
            <div className="flex space-x-4">
                <div className="w-[400px] h-[148px] rounded-2xl shadow-card p-4 space-y-2">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="text-text01 font-semibold">{t("finance.shiftOver")}</div>
                            <div>
                                <div className="text-sm text-text02 font-semibold">{t("finance.curr")}</div>
                                <div className="flex space-x-2 text-text01">
                                    <div>{dayShiftData?.startWorkingTime ? `${new Date(dayShiftData.startWorkingTime).getHours()} : ${new Date(dayShiftData.startWorkingTime).getMinutes()}` : "9:00"}</div>
                                    <div>-</div>
                                    <div>{dayShiftData?.endWorkingTime ? `${new Date(dayShiftData.endWorkingTime).getHours()} : ${new Date(dayShiftData.endWorkingTime).getMinutes()}` : "5:30"}</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-[#dbeafe] flex items-center justify-center">
                            <ClockImage />
                        </div>
                    </div>
                    <div className="w-[373px] h-9 bg-[#f0fdf4] rounded flex space-x-2 items-center text-sm px-2 text-[#16a34a]">
                        <Icon icon="truck" className="w-[22px] h-[18px]" />
                        <div>{t("finance.status")}</div>
                        <div className="font-bold">{location.state?.status ? t(`tables.${location.state.status}`) : ""}</div>
                    </div>
                </div>
                <div className="w-72 h-[148px] rounded-2xl shadow-card p-4">
                    <div className="flex justify-between">
                        <div className="text-text01 font-semibold">{t("finance.grade")}</div>
                        <div className="w-16 h-16 rounded-full bg-[#fef9c3] flex items-center justify-center">
                            <Icon icon="star" className="text-[#ff9066] w-8 h-8" />
                        </div>
                    </div>
                    <div className="w-[182px] h-14 bg-[#f0fdf4] rounded-lg flex items-center justify-center text-sm px-2 text-[#16a34a]">
                        <div className="font-extrabold">{dayShiftData?.estimation ? t(`finance.${dayShiftData?.estimation}`) : ""}</div>
                    </div>
                </div>
            </div>
            <div className="flex space-x-4 border-b mb-6 w-full">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`pb-2 w-60 ${activeTab === tab.id ? 'text-text01 border-b-4 border-primary02' : 'text-text02'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex space-x-10">
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.change") && (
                    <div className="flex flex-col">
                        <div className="space-y-3">
                            <div className="flex space-x-3">
                                {/* <div className="h-28 w-64 px-5 py-4 rounded-lg bg-background05 space-y-3">
                                <div className="text-text01 font-bold text-3xl">{dayShiftData?.prize} ₽</div>
                                <div className="text-text02/70">{t("finance.salary")}</div>
                            </div> */}
                                <div className="h-28 w-64 px-5 py-4 rounded-lg bg-background05 space-y-3">
                                    <div className="text-text01 font-bold text-3xl">{dayShiftData?.timeWorkedOut || "-"}</div>
                                    <div className="text-text02/70">{t("finance.time")}</div>
                                </div>
                                <div className="h-28 w-[440px] px-5 py-4 rounded-lg bg-background05 space-y-3">
                                    <div className="text-text01">{dayShiftData?.comment || "-"}</div>
                                    <div className="text-text02/70">{t("equipment.comment")}</div>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <div className="h-28 w-64 px-5 py-4 rounded-lg bg-background05 space-y-3">
                                    <div className="text-errorFill font-bold text-3xl">{dayShiftData?.fine ? `-${dayShiftData?.fine} ₽` : ""}</div>
                                    <div className="text-text02/70">{t("finance.fine")}</div>
                                </div>
                                <div className="h-28 w-64 px-5 py-4 rounded-lg bg-background05 space-y-3">
                                    <div className="text-successFill font-bold text-3xl">{dayShiftData?.prize ? `+${dayShiftData?.prize} ₽` : ""}</div>
                                    <div className="text-text02/70">{t("finance.prize")}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4 mt-10">
                            <Button
                                title={t("finance.refund")}
                                type="outline"
                                handleClick={handleReturn}
                                isLoading={loadingReturnCash}
                            />
                            {location.state.status !== "SENT" && <Button
                                title={t("finance.change")}
                                handleClick={handleSend}
                                isLoading={loadingSendCash}
                            />}
                        </div>
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.exchange") && (
                    <div>
                        <div className="w-[1003px] h-fit rounded-2xl shadow-card p-4 space-y-2 mt-5">
                            {location.state.status !== "SENT" && <button className="px-1.5 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal" onClick={() => setIsModalOpen(true)}>
                                {t("routes.add")}
                            </button>}
                            {loadingCashOper ?
                                <TableSkeleton columnCount={columnsDataCashOper.length} />
                                : cashOperArray.length > 0 ?
                                    <OverflowTable
                                        tableData={cashOperArray}
                                        columns={columnsDataCashOper}
                                    /> : <></>
                            }
                        </div>
                        <Modal isOpen={isModalOpen}>
                            <div className="flex flex-row items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text01">{t("finance.adding")}</h2>
                                <Close onClick={() => { resetForm(); setIsModalOpen(false); }} className="cursor-pointer text-text01" />
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-text02">
                                <Input
                                    type="number"
                                    title={t("finance.sum")}
                                    classname="w-80"
                                    value={formData.sum}
                                    changeValue={(e) => handleInputChange('sum', e.target.value)}
                                    error={!!errors.sum}
                                    {...register('sum', { required: 'Sum is required' })}
                                    helperText={errors.sum?.message || ''}
                                />
                                <Input
                                    type="datetime-local"
                                    title={t("finance.date")}
                                    classname="w-52"
                                    {...register('eventData')}
                                    value={formData.eventData}
                                    changeValue={(e) => handleInputChange('eventData', e.target.value)}
                                />
                                <MultilineInput
                                    title={t("equipment.comment")}
                                    classname="w-96"
                                    {...register('comment')}
                                    value={formData.comment}
                                    changeValue={(e) => handleInputChange('comment', e.target.value)}
                                />
                                <div className="flex justify-end gap-3 mt-5">
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
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.returns") && (
                    <div>
                        <div className="w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5 space-y-2">
                            {location.state.status !== "SENT" && <button className="px-1.5 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal" onClick={() => setIsModalOpenReturn(true)}>
                                {t("routes.add")}
                            </button>}
                            {loadingCashOperReturn ?
                                <TableSkeleton columnCount={columnsDataCashOperRefund.length} />
                                : cashOperReturnArray.length > 0 ?
                                    <OverflowTable
                                        tableData={cashOperReturnArray}
                                        columns={columnsDataCashOperRefund}
                                    /> : <></>
                            }
                        </div>
                        <Modal isOpen={isModalOpenReturn}>
                            <div className="flex flex-row items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text01">{t("finance.adding")}</h2>
                                <Close onClick={() => { resetForm(); setIsModalOpenReturn(false); }} className="cursor-pointer text-text01" />
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-text02">
                                <DropdownInput
                                    title={t("finance.operType")}
                                    options={[
                                        { name: t("finance.REFUND"), value: "REFUND" },
                                        { name: t("finance.REPLENISHMENT"), value: "REPLENISHMENT" }
                                    ]}
                                    classname="w-96"
                                    {...register('type', { required: "Type is Required." })}
                                    value={formData.type}
                                    onChange={(value) => handleInputChange('type', value)}
                                    error={!!errors.type}
                                    helperText={errors.type?.message || ''}
                                />
                                <Input
                                    type="number"
                                    title={t("finance.sum")}
                                    classname="w-80"
                                    value={formData.sum}
                                    changeValue={(e) => handleInputChange('sum', e.target.value)}
                                    error={!!errors.sum}
                                    {...register('sum', { required: 'Sum is required' })}
                                    helperText={errors.sum?.message || ''}
                                />
                                <DropdownInput
                                    title={t("equipment.device")}
                                    options={devices}
                                    classname="w-96"
                                    {...register('carWashDeviceId')}
                                    value={formData.carWashDeviceId}
                                    onChange={(value) => handleInputChange('carWashDeviceId', value)}
                                />
                                <Input
                                    type="datetime-local"
                                    title={t("finance.date")}
                                    classname="w-52"
                                    {...register('eventData')}
                                    value={formData.eventData}
                                    changeValue={(e) => handleInputChange('eventData', e.target.value)}
                                />
                                <MultilineInput
                                    title={t("equipment.comment")}
                                    classname="w-96"
                                    {...register('comment')}
                                    value={formData.comment}
                                    changeValue={(e) => handleInputChange('comment', e.target.value)}
                                />
                                <div className="flex justify-end gap-3 mt-5">
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
                    <div className="w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5">
                        {loadingCashOperClean ?
                            <TableSkeleton columnCount={columnsDataCashOperCleaning.length} />
                            : cashOperCleanArray.length > 0 ?
                                <OverflowTable
                                    tableData={cashOperCleanArray}
                                    columns={columnsDataCashOperCleaning}
                                /> : <></>
                        }
                    </div>
                )}
                {tabs.find((tab) => tab.id === activeTab)?.name === t("finance.susp") && (
                    <div className="w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5">
                        {loadingCashOperSusp ?
                            <TableSkeleton columnCount={columnsDataCashOperSuspiciously.length} />
                            : cashOperSubsArray.length > 0 ?
                                <OverflowTable
                                    tableData={cashOperSubsArray}
                                    columns={columnsDataCashOperSuspiciously}
                                /> : <></>
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

export default TimesheetView;