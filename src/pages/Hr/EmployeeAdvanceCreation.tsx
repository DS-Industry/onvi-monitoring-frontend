import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import { useCity } from "@/hooks/useAuthStore";
import useFormHook from "@/hooks/useFormHook";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getOrganization } from "@/services/api/organization";
import { addWorkerPrePayment, calculatePrepayment, createPrepayment, getPositions, getWorkers } from "@/services/api/hr";
import useSWRMutation from "swr/mutation";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { useNavigate } from "react-router-dom";
import { Button as AntDButton, DatePicker, message, Select, Transfer } from "antd";
import ArrowUp from "@icons/ArrowUp.png";
import ArrowDown from "@icons/ArrowDown.png";
import NoDataUI from "@/components/ui/NoDataUI";
import PositionEmpty from "@/assets/NoPosition.png";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import dayjs from "dayjs";
import { useSnackbar } from "@/components/context/useContext";

type PaymentCalculateBody = {
    organizationId: number;
    billingMonth: string;
    hrPositionId: number | '*';
}

type PaymentsCreation = {
    check: boolean;
    id: number;
    hrWorkerId: number;
    name: string;
    hrPositionId: number;
    billingMonth: Date;
    monthlySalary: number;
    dailySalary: number;
    percentageSalary: number;
    paymentDate: Date;
    countShifts: number;
    sum: number;
}

type AddWorker = {
    organizationId: number;
    billingMonth: string;
    workerIds: number[];
}

const EmployeeAdvanceCreation: React.FC = () => {
    const { t } = useTranslation();
    const city = useCity();
    const navigate = useNavigate();
    const [paymentsData, setPaymentsData] = useState<PaymentsCreation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAddButton, setShowAddButton] = useState(false);
    const { showSnackbar } = useSnackbar();

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: positionData } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: workersData } = useSWR([`get-workers`], () => getWorkers({
        placementId: "*",
        hrPositionId: "*",
        organizationId: "*"
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const organizations: { name: string; value: number }[] = [
        { name: t("chemical.select"), value: 0 },
        ...(organizationData?.map(item => ({ name: item.name, value: item.id })) || [])
    ];

    const workers: { key: string; title: string; value: number | "*"; }[] = [
        ...(workersData?.map((work) => ({
            key: String(work.props.id),
            title: work.props.name,
            value: work.props.id
        })) || [])
    ];

    const positions: { label: string; value: number | "*"; name: string; }[] = [
        { label: t("analysis.all"), value: "*", name: t("analysis.all") },
        ...(positionData?.map((pos) => ({
            label: pos.props.name,
            value: pos.props.id,
            name: pos.props.name
        })) || [])
    ];

    const defaultValues: PaymentCalculateBody = {
        organizationId: 0,
        billingMonth: "",
        hrPositionId: "*"
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    const { trigger: calculateSal, isMutating: calculatingSal } = useSWRMutation(
        ['calculate-salary'],
        async () => {
            const result = await calculatePrepayment({
                organizationId: formData.organizationId,
                billingMonth: formData.billingMonth,
                hrPositionId: formData.hrPositionId
            });

            // On successful API call
            setShowAddButton(true);
            return result;
        }
    );

    const { trigger: createSal, isMutating: creatingSal } = useSWRMutation(['create-salary'],
        async (_, { arg }: {
            arg: {
                payments: {
                    hrWorkerId: number;
                    paymentDate: Date;
                    billingMonth: Date;
                    countShifts: number;
                    sum: number;
                }[]
            }
        }) => {
            return createPrepayment(arg);
        });

    type FieldType = "organizationId" | "billingMonth" | "hrPositionId";

    const handleInputChange = (field: FieldType, value: string | number | "*") => {
        const numericFields = ['organizationId', 'hrPositionId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const handleTableChange = (id: number, key: string, value: string | number) => {
        setPaymentsData((prevData) =>
            prevData?.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
    };

    const onSubmit = async () => {

        try {
            const result = await calculateSal();
            if (result) {
                setPaymentsData(result.map((res, index) => ({
                    ...res,
                    paymentDate: new Date(),
                    check: false,
                    countShifts: 0,
                    prize: 0,
                    fine: 0,
                    sum: 0,
                    id: index
                })));
            } else {
                throw new Error('Invalid update data.');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
            showSnackbar("Error during form submission", "error");
        }
    }

    const handlePaymentCreation = async () => {

        for (let i = 0; i < paymentsData.length; i++) {
            const item = paymentsData[i];
            const errors = [];

            if (!item.paymentDate) errors.push("Дата выдачи");
            if (item.countShifts == null || item.countShifts <= 0) errors.push("Количество отработанных смен");
            if (item.sum == null || item.sum <= 0) errors.push("Выплачено ЗП");

            if (errors.length > 0) {
                message.error(`Строка ${i + 1}: Заполните корректно поля: ${errors.join(", ")}`);
                return;
            }
        }

        const paymentCreate: {
            hrWorkerId: number;
            paymentDate: Date;
            billingMonth: Date;
            countShifts: number;
            sum: number;
        }[] = paymentsData?.map((data) => ({
            hrWorkerId: data.hrWorkerId,
            paymentDate: data.paymentDate,
            billingMonth: data.billingMonth,
            countShifts: Number(data.countShifts),
            sum: Number(data.sum)
        })) || [];

        const result = await createSal({
            payments: paymentCreate
        });

        if (result) {
            navigate(-1);
        }
    };

    const columnsPaymentsCreation = [
        {
            label: "",
            key: "check",
            render: (row: { check: boolean | undefined; id: number; }, handleChange: (arg0: number, arg1: string, arg2: boolean) => void) => (
                <input
                    type="checkbox"
                    checked={row.check}
                    className="w-[18px] h-[18px]"
                    onChange={() =>
                        handleChange(row.id, "check", !row.check)
                    }
                />
            ),
        },
        {
            label: "ФИО",
            key: "name"
        },
        {
            label: "Должность",
            key: "hrPosition"
        },
        {
            label: "Месяц расчёта",
            key: "billingMonth",
            type: "date"
        },
        {
            label: "Оклад",
            key: "monthlySalary",
            type: "number"
        },
        {
            label: "Посменное начисление",
            key: "dailySalary",
            type: "number"
        },
        {
            label: "Процент",
            key: "percentageSalary",
            type: "number"
        },
        {
            label: "Количество отработанных смен",
            key: "countShifts",
            render: (row: { countShifts: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
                <Input
                    type="number"
                    placeholder="00,00"
                    value={row.countShifts}
                    changeValue={(e) => handleChange(row.id, "countShifts", e.target.value)}
                />
            ),
        },
        {
            label: "Выплачено ЗП",
            key: "sum",
            render: (row: { sum: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
                <Input
                    type="number"
                    placeholder="00,00"
                    value={row.sum}
                    changeValue={(e) => handleChange(row.id, "sum", e.target.value)}
                />
            ),
        },
        {
            label: "Дата выдачи",
            key: "paymentDate",
            render: (row: { paymentDate: Date; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
                <Input
                    type="date"
                    placeholder="00,00"
                    value={row.paymentDate}
                    changeValue={(e) => handleChange(row.id, "paymentDate", e.target.value)}
                />
            ),
        }
    ]

    const deleteRow = () => {
        setPaymentsData((prevData) => prevData.filter((row) => !row.check));
    };

    const defaultValuesWorker: AddWorker = {
        organizationId: 0,
        billingMonth: '',
        workerIds: []
    }

    const [formDataWorker, setFormDataWorker] = useState(defaultValuesWorker);

    const { handleSubmit: handleSubmitWorker, setValue: setValueWorker, reset: resetWorker } = useFormHook(formDataWorker);

    const { trigger: addWork, isMutating: addingWorker } = useSWRMutation(['adding-worker'], async () => addWorkerPrePayment({
        organizationId: formData.organizationId,
        billingMonth: formData.billingMonth,
        workerIds: formDataWorker.workerIds
    }));

    const handleTransfer = (nextTargetKeys: (string | number | bigint)[]) => {
        const numericKeys = nextTargetKeys.map((key) => Number(key));

        setFormDataWorker((prev) => ({ ...prev, workerIds: numericKeys }));
        setValueWorker("workerIds", numericKeys);
    };

    const resetFormWorker = () => {
        setFormDataWorker(defaultValuesWorker);
        // setIsEditMode(false);
        resetWorker();
        // setEditInventoryId(0);
        // setButtonOn(!buttonOn);
    };

    const onSubmitWorker = async () => {
        try {
            const result = await addWork();
            if (result) {
                if (result.length === 0)
                    message.error(t("hr.noAdvance"));
                setPaymentsData(result.map((res, index) => ({
                    ...res,
                    paymentDate: new Date(),
                    check: false,
                    countShifts: 0,
                    prize: 0,
                    fine: 0,
                    sum: 0,
                    id: index
                })));
                resetFormWorker();
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
            showSnackbar("Error during form submission", "error");
        }
    };

    return (
        <div>
            <Modal isOpen={isModalOpen}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("roles.create")}</h2>
                    <Close
                        onClick={() => { resetFormWorker(); setIsModalOpen(false); }}
                        className="cursor-pointer text-text01"
                    />
                </div>
                <form onSubmit={handleSubmitWorker(onSubmitWorker)}>
                    <div className="flex flex-col space-y-4 text-text02">
                        <Transfer
                            dataSource={workers}
                            targetKeys={formDataWorker.workerIds.map(String)}
                            onChange={handleTransfer}
                            render={(item) => item.title}
                            showSearch
                            listStyle={{
                                width: 'calc(50% - 8px)',
                                height: 300,
                            }}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-5">
                        <Button
                            title={"Сбросить"}
                            handleClick={() => setIsModalOpen(false)}
                            type="outline"
                        />
                        <Button
                            title={"Сохранить"}
                            form={true}
                            isLoading={addingWorker}
                        />
                    </div>
                </form>
            </Modal>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <div>
                        <div className="text-sm text-text02">{t("warehouse.organization")}</div>
                        <Select
                            className="w-64 h-10"
                            options={organizations.map((item) => ({ label: item.name, value: item.value }))}
                            value={formData.organizationId}
                            {...register('organizationId', {
                                required: 'Organization Id is required',
                                validate: (value) =>
                                    (value !== 0) || "Organization Id is required"
                            })}
                            onChange={(value) => handleInputChange('organizationId', value)}
                            dropdownRender={(menu) => (
                                <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                    {menu}
                                </div>
                            )}
                            status={errors.organizationId ? 'error' : ''}
                        />
                        {errors.organizationId?.message && (
                            <div className="text-xs text-errorFill mt-1">{errors.organizationId.message}</div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("hr.billing")}</div>
                        <DatePicker
                            picker="month"
                            {...register('billingMonth', {
                                required: 'Billing Month is required'
                            })}
                            value={formData.billingMonth ? dayjs(formData.billingMonth) : null}
                            onChange={(_date, dateString) => handleInputChange('billingMonth', dateString.toString())}
                            className="w-40 h-10"
                            status={errors.billingMonth ? 'error' : ''}
                            placeholder={t("finance.selMon")}
                        />
                        {errors.billingMonth?.message && (
                            <div className="text-xs text-errorFill mt-1">{errors.billingMonth.message}</div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("routes.employees")}</div>
                        <Select
                            className="w-64 h-10"
                            options={positions}
                            value={formData.hrPositionId}
                            {...register('hrPositionId')}
                            onChange={(value) => handleInputChange('hrPositionId', value)}
                            dropdownRender={(menu) => (
                                <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                    {menu}
                                </div>
                            )}
                        />
                    </div>
                </div>
                <div className="flex space-x-4">
                    <Button
                        type="outline"
                        title={t("organizations.cancel")}
                        handleClick={() => navigate(-1)}
                    />
                    <Button
                        title={t("finance.form")}
                        isLoading={calculatingSal}
                        form={true}
                    />
                </div>
            </form>
            {calculatingSal ? (
                <TableSkeleton columnCount={columnsPaymentsCreation.length} />
            ) : paymentsData.length > 0 ? (
                <div className="mt-8 space-y-5 shadow-card rounded-2xl p-5">
                    <div className="flex flex-wrap justify-between gap-2">
                        <div className="flex space-x-4">
                            <AntDButton onClick={deleteRow} danger>{t("marketing.delete")}</AntDButton>
                            <Button
                                title={t("finance.addE")}
                                type="outline"
                                iconPlus={true}
                                handleClick={() => setIsModalOpen(true)}
                            />
                        </div>
                        <div className="space-x-2">
                            <button
                                className="px-2 py-1 bg-background07/50 rounded"
                                onClick={() => {
                                    const sortedData = [...paymentsData].sort((a, b) => a.id - b.id);
                                    setPaymentsData(sortedData);
                                }}
                            >
                                <img src={ArrowUp} loading="lazy" alt="Arrow Up" />
                            </button>
                            <button
                                className="px-2 py-1 bg-background07/50 rounded"
                                onClick={() => {
                                    const sortedData = [...paymentsData].sort((a, b) => b.id - a.id);
                                    setPaymentsData(sortedData);
                                }}
                            >
                                <img src={ArrowDown} loading="lazy" alt="Arrow Down" />
                            </button>
                        </div>
                    </div>
                    <DynamicTable
                        data={paymentsData.map((item, index) => ({
                            ...item,
                            id: index,
                            hrPosition: positions.find((pos) => pos.value === item.hrPositionId)?.name || ""
                        }))}
                        columns={columnsPaymentsCreation}
                        handleChange={handleTableChange}
                    />
                    <div>
                        <div className="flex space-x-4">
                            <Button
                                title={t("organizations.save")}
                                isLoading={creatingSal}
                                handleClick={handlePaymentCreation}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                showAddButton && (
                    <div className="flex flex-col justify-center items-center space-y-4">
                        <NoDataUI
                            title={t("marketing.nodata")}
                            description={""}
                        >
                            <img src={PositionEmpty} className="mx-auto" loading="lazy" alt="Position Empty" />
                        </NoDataUI>
                        <Button
                            title={t("finance.addE")}
                            type="outline"
                            iconPlus={true}
                            handleClick={() => setIsModalOpen(true)}
                        />
                    </div>
                ))}
        </div>
    )
}

export default EmployeeAdvanceCreation;