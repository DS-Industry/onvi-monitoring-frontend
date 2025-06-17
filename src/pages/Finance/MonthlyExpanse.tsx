import { useButtonCreate } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import useFormHook from "@/hooks/useFormHook";
import { getWorkers } from "@/services/api/equipment";
import { Table, Button as AntButton, Input as AntInput, Select, DatePicker, Space } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import React, { ClassAttributes, ThHTMLAttributes, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

interface DataRecord {
    id: number;
    posName: string;
    name: string;
    period: string;
    status: string;
    type: string;
    startDate: string;
}

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

    const [data, setData] = useState<DataRecord[]>([
        {
            id: 1,
            posName: "Автомойка №1 - Москва",
            name: "Замена фильтра воды",
            period: "Period 1",
            status: "Запланировано",
            type: "Техническое обслуживание",
            startDate: "2025-06-15T09:00:00Z"
        },
        {
            id: 2,
            posName: "Филиал Центр - СПБ",
            name: "Проверка оборудования",
            period: "Period 2",
            status: "В процессе",
            type: "Диагностика",
            startDate: "2025-06-18T10:00:00Z"
        },
        {
            id: 3,
            posName: "Автомойка Восток - Казань",
            name: "Обновление ПО",
            period: "Period 3",
            status: "Завершено",
            type: "Обновление",
            startDate: "2025-06-10T08:30:00Z"
        },
        {
            id: 4,
            posName: "Филиал Юг - Ростов",
            name: "Тест системы подачи воды",
            period: "Period 4",
            status: "Ожидает подтверждения",
            type: "Тестирование",
            startDate: "2025-06-20T14:00:00Z"
        }
    ]);

    const [editingKey, setEditingKey] = useState<string>('');
    const [editingData, setEditingData] = useState<Partial<DataRecord>>({});

    const isEditing = (record: DataRecord): boolean => record.id.toString() === editingKey;

    const edit = (record: DataRecord): void => {
        setEditingKey(record.id.toString());
        setEditingData({ ...record });
    };

    const cancel = (): void => {
        setEditingKey('');
        setEditingData({});
    };

    const save = async (id: number): Promise<void> => {
        try {
            const newData = [...data];
            const index = newData.findIndex((item) => id === item.id);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...editingData } as DataRecord);
                setData(newData);
                setEditingKey('');
                setEditingData({});
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const handleInputTableChange = (field: keyof DataRecord, value: string | null): void => {
        setEditingData({
            ...editingData,
            [field]: value
        });
    };

    const statusOptions: string[] = [
        "Запланировано",
        "В процессе",
        "Завершено",
        "Ожидает подтверждения"
    ];

    const typeOptions: string[] = [
        "Техническое обслуживание",
        "Диагностика",
        "Обновление",
        "Тестирование"
    ];

    const navigate = useNavigate();

    const columnsExpanse: ColumnsType<DataRecord> = [
        {
            title: "Автомойка/ Филиал",
            dataIndex: "posName",
            render: (text: string, record: DataRecord) => {
                if (isEditing(record)) {
                    return (
                        <AntInput
                            value={editingData.posName || text}
                            onChange={(e) => handleInputTableChange('posName', e.target.value)}
                        />
                    );
                }
                return text;
            }
        },
        {
            title: "Наименование работ",
            dataIndex: "name",
            render: (text: string, record: DataRecord) => {
                if (isEditing(record)) {
                    return (
                        <AntInput
                            value={editingData.name || text}
                            onChange={(e) => handleInputTableChange('name', e.target.value)}
                        />
                    );
                }
                return text;
            }
        },
        {
            title: "Периодичность",
            dataIndex: "period",
            render: (text: string, record: DataRecord) => {
                if (isEditing(record)) {
                    return (
                        <AntInput
                            value={editingData.period || text}
                            onChange={(e) => handleInputTableChange('period', e.target.value)}
                        />
                    );
                }
                return (
                    <div className="text-primary02 hover:text-primary02_Hover cursor-pointer font-semibold" onClick={() => navigate("/finance/report/period/edit")}>
                        {text}
                    </div>
                );
            }
        },
        {
            title: "Статус",
            dataIndex: "status",
            render: (text: string, record: DataRecord) => {
                if (isEditing(record)) {
                    return (
                        <Select
                            value={editingData.status || text}
                            onChange={(value: string) => handleInputTableChange('status', value)}
                            style={{ width: '100%' }}
                        >
                            {statusOptions.map((option: string) => (
                                <Option key={option} value={option}>{option}</Option>
                            ))}
                        </Select>
                    );
                }
                return text;
            }
        },
        {
            title: "Тип работы",
            dataIndex: "type",
            render: (text: string, record: DataRecord) => {
                if (isEditing(record)) {
                    return (
                        <Select
                            value={editingData.type || text}
                            onChange={(value: string) => handleInputTableChange('type', value)}
                            style={{ width: '100%' }}
                        >
                            {typeOptions.map((option: string) => (
                                <Option key={option} value={option}>{option}</Option>
                            ))}
                        </Select>
                    );
                }
                return text;
            }
        },
        {
            title: "Дата начала работ",
            dataIndex: "startDate",
            render: (text: string, record: DataRecord) => {
                if (isEditing(record)) {
                    return (
                        <DatePicker
                            showTime
                            value={editingData.startDate ? dayjs(editingData.startDate) : dayjs(text)}
                            onChange={(date: Dayjs | null) => handleInputTableChange('startDate', date ? date.toISOString() : null)}
                            format="YYYY-MM-DD HH:mm:ss"
                            style={{ width: '100%' }}
                        />
                    );
                }
                return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        {
            title: "Действия",
            dataIndex: "actions",
            render: (_: any, record: DataRecord) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <AntButton
                            type="primary"
                            size="small"
                            icon={<SaveOutlined />}
                            onClick={() => save(record.id)}
                        >
                            Сохранить
                        </AntButton>
                        <AntButton
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={cancel}
                        >
                            Отмена
                        </AntButton>
                    </Space>
                ) : (
                    <AntButton
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        disabled={editingKey !== ''}
                        onClick={() => edit(record)}
                    >
                        Редактировать
                    </AntButton>
                );
            }
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
                <Table
                    dataSource={data}
                    columns={columnsExpanse}
                    components={{
                        header: {
                            cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableHeaderCellElement> & ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
                                <th
                                    {...props}
                                    style={{ backgroundColor: "#E4F0FF", fontWeight: "semi-bold", paddingLeft: "9px", paddingTop: "20px", paddingBottom: "20px", textAlign: "left", borderRadius: "0px" }}
                                    className="border-b border-[1px] border-background02 bg-background06 px-2.5 text-sm font-semibold text-text01 tracking-wider"
                                />
                            ),
                        },
                        body: {
                            cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableDataCellElement> & ThHTMLAttributes<HTMLTableDataCellElement>) => (
                                <td
                                    {...props}
                                    style={{ paddingLeft: "9px", paddingTop: "10px", paddingBottom: "10px" }}
                                />
                            ),
                        },
                    }}
                    scroll={{ x: "max-content" }}
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