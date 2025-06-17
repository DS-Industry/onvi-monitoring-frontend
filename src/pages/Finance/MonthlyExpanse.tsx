import { useButtonCreate } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import useFormHook from "@/hooks/useFormHook";
import { getWorkers } from "@/services/api/equipment";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const MonthlyExpanse: React.FC = () => {

    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const workers = useMemo(() => {
        return workerData?.map((item) => ({
            name: item.name,
            value: item.id,
            surname: item.surname
        })) || [];
    }, [workerData]);

    const defaultValues = {
        startDate: '',
        endDate: '',
        startAmount: 0,
        endAmount: 0
    };

    const columnsExpanse = [
        {
            label: "Автомойка/ Филиал",
            key: "posName"
        },
        {
            label: "Наименование работ",
            key: "name"
        },
        {
            label: "Периодичность",
            key: "period"
        },
        {
            label: "Статус",
            key: "status"
        },
        {
            label: "Тип работы",
            key: "type"
        },
        {
            label: "Теги",
            key: "tags",
            type: "tags"
        },
        {
            label: "Дата начала работ",
            key: "startDate",
            type: "date"
        },
    ]

    const demoExpanse = [
        {
            id: 1,
            posName: "Автомойка №1 - Москва",
            name: "Замена фильтра воды",
            period: "Period 1",
            status: "Запланировано",
            type: "Техническое обслуживание",
            tags: [
                { id: 1, color: "blue", name: "вода" },
                { id: 2, color: "green", name: "фильтр" }
            ],
            startDate: "2025-06-15T09:00:00Z"
        },
        {
            id: 2,
            posName: "Филиал Центр - СПБ",
            name: "Проверка оборудования",
            period: "Period 2",
            status: "В процессе",
            type: "Диагностика",
            tags: [
                { id: 3, color: "gold", name: "оборудование" }
            ],
            startDate: "2025-06-18T10:00:00Z"
        },
        {
            id: 3,
            posName: "Автомойка Восток - Казань",
            name: "Обновление ПО",
            period: "Period 3",
            status: "Завершено",
            type: "Обновление",
            tags: [
                { id: 4, color: "volcano", name: "ПО" },
                { id: 5, color: "purple", name: "система" }
            ],
            startDate: "2025-06-10T08:30:00Z"
        },
        {
            id: 4,
            posName: "Филиал Юг - Ростов",
            name: "Тест системы подачи воды",
            period: "Period 4",
            status: "Ожидает подтверждения",
            type: "Тестирование",
            tags: [],
            startDate: "2025-06-20T14:00:00Z"
        }
    ];

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    type FieldType = "startDate" | "endDate" | "startAmount" | "endAmount";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ["startAmount", "endAmount"];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        // setIsEditMode(false);
        reset();
        // setEditIncidentId(0);
        setButtonOn(false);
    };

    const onSubmit = async () => {

    }

    return (
        <div>
            <Filter count={0}>
                <DropdownInput
                    title={t("equipment.user")}
                    value={""}
                    options={workers}
                    onChange={() => { }}
                    classname="w-full sm:w-80"
                />
            </Filter>
            <div className="mt-8">
                <DynamicTable
                    data={demoExpanse}
                    columns={columnsExpanse}
                    navigableFields={[{ key: "period", getPath: () => "/finance/report/period/edit" }]}
                />
            </div>
            <DrawerCreate>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl mx-auto p-4">
                    <span className="font-semibold text-xl md:text-3xl text-text01 mb-5">{t("pos.creating")}</span>
                    <Input
                        title={t("equipment.start")}
                        type="date"
                        classname="w-44"
                        value={formData.startDate ? dayjs(formData.startDate) : null}
                        changeValue={(date) => handleInputChange("startDate", date ? date.format("YYYY-MM-DDTHH:mm") : "")}
                        error={!!errors.startDate}
                        {...register('startDate', { required: 'Start Date is required' })}
                        helperText={errors.startDate?.message || ''}
                    />
                    <Input
                        title={t("equipment.end")}
                        type="date"
                        classname="w-44"
                        value={formData.endDate ? dayjs(formData.endDate) : null}
                        changeValue={(date) => handleInputChange("endDate", date ? date.format("YYYY-MM-DDTHH:mm") : "")}
                        error={!!errors.endDate}
                        {...register('endDate', { required: 'End Date is required' })}
                        helperText={errors.endDate?.message || ''}
                    />
                    <Input
                        title="Start Amount"
                        type="number"
                        classname="w-44"
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-xl">₽</div>}
                        value={formData.startAmount}
                        changeValue={(e) => handleInputChange('startAmount', e.target.value)}
                        error={!!errors.startAmount}
                        {...register('startAmount', { required: 'startAmount is required' })}
                        helperText={errors.startAmount?.message || ''}
                    />
                    <Input
                        title="End Amount"
                        type="number"
                        classname="w-44"
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-xl">₽</div>}
                        value={formData.endAmount}
                        changeValue={(e) => handleInputChange('endAmount', e.target.value)}
                        error={!!errors.endAmount}
                        {...register('endAmount', { required: 'endAmount is required' })}
                        helperText={errors.endAmount?.message || ''}
                    />
                    <Input
                        title={t("equipment.user")}
                        value={"User 1"}
                        classname="w-80"
                    />
                    <div className="flex space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                setButtonOn(!buttonOn)
                                resetForm();
                            }}
                        />
                        <Button
                            title={t("organizations.save")}
                            form={true}
                            // isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </div>
    )
}

export default MonthlyExpanse;