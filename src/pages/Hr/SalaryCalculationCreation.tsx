import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import { useCity } from "@/hooks/useAuthStore";
import useFormHook from "@/hooks/useFormHook";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getOrganization } from "@/services/api/organization";
import { calculatePayment, createPayment, getPositions } from "@/services/api/hr";
import useSWRMutation from "swr/mutation";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { useNavigate } from "react-router-dom";

type PaymentCalculateBody = {
    organizationId: number;
    billingMonth: Date;
    hrPositionId: number | '*';
}

type PaymentsCreation = {
    id: number;
    hrWorkerId: number;
    name: string;
    hrPositionId: number;
    billingMonth: Date;
    monthlySalary: number;
    dailySalary: number;
    percentageSalary: number;
    prepaymentSum: number;
    prepaymentCountShifts: number;
    paymentDate: Date;
    countShifts: number;
    sum: number;
    prize: number;
    fine: number;
}

const SalaryCalculationCreation: React.FC = () => {
    const { t } = useTranslation();
    const city = useCity();
    const navigate = useNavigate();
    const [paymentsData, setPaymentsData] = useState<PaymentsCreation[]>([]);

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: positionData } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const positions: { name: string; value: number; label: string; }[] = positionData?.map((item) => ({ name: item.props.name, value: item.props.id, label: item.props.name })) || [];

    const defaultValues: PaymentCalculateBody = {
        organizationId: 0,
        billingMonth: new Date(),
        hrPositionId: "*"
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    const { trigger: calculateSal, isMutating: calculatingSal } = useSWRMutation(['calculate-salary'], async () => calculatePayment({
        organizationId: formData.organizationId,
        billingMonth: formData.billingMonth,
        hrPositionId: formData.hrPositionId
    }));

    const { trigger: createSal, isMutating: creatingSal } = useSWRMutation(['create-salary'],
        async (_, { arg }: {
            arg: {
                payments: {
                    hrWorkerId: number;
                    paymentDate: Date;
                    billingMonth: Date;
                    countShifts: number;
                    sum: number;
                    prize: number;
                    fine: number;
                }[]
            }
        }) => {
            return createPayment(arg);
        });

    type FieldType = "organizationId" | "billingMonth" | "hrPositionId";

    const handleInputChange = (field: FieldType, value: Date | number | "*") => {
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

    const onSubmit = async (data: unknown) => {
        console.log('Form data:', data);

        try {
            const result = await calculateSal();
            console.log(result);
            if (result) {
                console.log(result);
                setPaymentsData(result.map((res, index) => ({
                    ...res,
                    paymentDate: new Date(),
                    countShifts: 0,
                    prize: 0,
                    fine: 0,
                    sum: 0,
                    id: index
                })))
            } else {
                throw new Error('Invalid update data.');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    }

    const handlePaymentCreation = async () => {
        console.log("Final Task Values:", paymentsData);

        const paymentCreate: {
            hrWorkerId: number;
            paymentDate: Date;
            billingMonth: Date;
            countShifts: number;
            sum: number;
            prize: number;
            fine: number;
        }[] = paymentsData?.map((data) => ({
            hrWorkerId: data.hrWorkerId,
            paymentDate: data.paymentDate,
            billingMonth: data.billingMonth,
            countShifts: Number(data.countShifts),
            sum: data.monthlySalary + data.dailySalary * data.countShifts - data.prepaymentSum,
            prize: Number(data.prize),
            fine: Number(data.fine)
        })) || [];

        console.log("Payload for API:", paymentCreate);

        const result = await createSal({
            payments: paymentCreate
        });

        if (result) {
            console.log("Result of the api: ", result);
            navigate(-1);
        }
    };

    const columnsPaymentsCreation = [
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
            label: "Выплачено аванс",
            key: "prepaymentSum",
            type: "number"
        },
        {
            label: "Количество отработанных смен аванс",
            key: "prepaymentCountShifts",
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
            label: "Количество отработанных смен итог",
            key: "totalCountShifts",
            type: "number"
        },
        {
            label: "Выплачено ЗП",
            key: "sum",
            type: "number"
        },
        {
            label: "Премия",
            key: "prize",
            render: (row: { prize: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
                <Input
                    type="number"
                    placeholder="00,00"
                    value={row.prize}
                    changeValue={(e) => handleChange(row.id, "prize", e.target.value)}
                />
            ),
        },
        {
            label: "Штраф",
            key: "fine",
            render: (row: { fine: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
                <Input
                    type="number"
                    placeholder="00,00"
                    value={row.fine}
                    changeValue={(e) => handleChange(row.id, "fine", e.target.value)}
                />
            ),
        },
        {
            label: "Выплачено итог",
            key: "totalPayment",
            type: "number"
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

    return (
        <div>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <DropdownInput
                        title={t("finance.carWash")}
                        options={organizations}
                        classname="w-64"
                        {...register('organizationId', {
                            required: 'Pos ID is required',
                            validate: (value) =>
                                (value !== 0) || "Organization Id is required"
                        })}
                        value={formData.organizationId}
                        onChange={(value) => handleInputChange('organizationId', value)}
                        error={!!errors.organizationId}
                        helperText={errors.organizationId?.message}
                    />
                    <Input
                        type="date"
                        title={t("hr.billing")}
                        classname="w-40"
                        value={
                            formData.billingMonth instanceof Date
                                ? formData.billingMonth.toISOString().split("T")[0]
                                : ""
                        }
                        changeValue={(e) => handleInputChange('billingMonth', new Date(e.target.value))}
                        error={!!errors.billingMonth}
                        {...register('billingMonth', {
                            required: 'Billing Month is required'
                        })}
                        helperText={errors.billingMonth?.message || ''}
                    />
                    <DropdownInput
                        title={t("routes.employees")}
                        options={positions}
                        classname="w-64"
                        {...register('hrPositionId')}
                        value={formData.hrPositionId}
                        onChange={(value) => handleInputChange('hrPositionId', value)}
                    />
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
            ) : paymentsData.length > 0 ? (<div className="mt-8">
                <DynamicTable
                    data={paymentsData.map((item, index) => ({
                        ...item,
                        id: index,
                        hrPosition: positions.find((pos) => pos.value === item.hrPositionId)?.name || ""
                    }))}
                    columns={columnsPaymentsCreation}
                    handleChange={handleTableChange}
                />
                <div className="mt-5">
                    <div className="flex space-x-4">
                        <Button
                            title={t("organizations.save")}
                            isLoading={creatingSal}
                            handleClick={handlePaymentCreation}
                        />
                    </div>
                </div>
            </div>) : (
                <></>
            )}
        </div>
    )
}

export default SalaryCalculationCreation;