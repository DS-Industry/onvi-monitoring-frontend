import { useButtonCreate, useFilterOn } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import useFormHook from "@/hooks/useFormHook";
import { getWorkers } from "@/services/api/equipment";
import { Table, Select, Space, Menu, Dropdown, Modal, message, InputNumber, Form, Input as AntInput, DatePicker, Tag } from 'antd';
import { CloseOutlined, CheckOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import React, { ClassAttributes, ThHTMLAttributes, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import { useLocation, useNavigate } from "react-router-dom";
import DateInput from "@/components/ui/Input/DateInput";
import { usePageNumber, useSetPageNumber, useCurrentPage, usePageSize, useSetCurrentPage, useSetPageSize } from "@/hooks/useAuthStore";
import { useUser } from "@/hooks/useUserStore";
import { createManagerPaperPeriod, deleteManagerPaperPeriod, getAllManagerPeriods, updateManagerPaperPeriod } from "@/services/api/finance";
import DateTimeInput from "@/components/ui/Input/DateTimeInput";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import useSWRMutation from "swr/mutation";
import Icon from "feather-icons-react";
import TableUtils from "@/utils/TableUtils.tsx";

const { Option } = Select;

enum ManagerReportPeriodStatus {
    SAVE = "SAVE",
    SENT = "SENT"
}
interface DataRecord {
    id: number;
    period: string;
    sumStartPeriod: number;
    sumEndPeriod: number;
    shortage: number;
    userId: number;
    status: ManagerReportPeriodStatus;
}


type ManagerPeriodParams = {
    startPeriod: Date;
    endPeriod: Date;
    userId: number;
    page?: number;
    size?: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    inputType: 'number' | 'text' | 'select' | 'period';
    record: DataRecord;
    index: number;
    selectOptions?: Array<{ name: string; value: string | number }>;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    inputType,
    selectOptions,
    children,
    ...restProps
}) => {
    const getInputNode = () => {
        switch (inputType) {
            case 'number':
                return <InputNumber style={{ width: '100%' }} />;
            case 'select':
                return (
                    <Select style={{ width: '100%' }}>
                        {selectOptions?.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.name}
                            </Option>
                        ))}
                    </Select>
                );
            case 'period':
                // This case is handled separately below
                return null;
            default:
                return <AntInput />;
        }
    };

    return (
        <td {...restProps}>
            {editing ? (
                inputType === 'period' ? (
                    <Space>
                        <Form.Item
                            name="startPeriod"
                            style={{ margin: 0 }}
                            rules={[{ required: true, message: `Введите дату начала!` }]}
                        >
                            <DatePicker
                                format="DD.MM.YYYY"
                                style={{ width: 130 }}
                                placeholder="Start Date"
                            />
                        </Form.Item>
                        <Form.Item
                            name="endPeriod"
                            style={{ margin: 0 }}
                            rules={[{ required: true, message: `Введите дату окончания!` }]}
                        >
                            <DatePicker
                                format="DD.MM.YYYY"
                                style={{ width: 130 }}
                                placeholder="End Date"
                            />
                        </Form.Item>
                    </Space>
                ) : (
                    <Form.Item
                        name={dataIndex}
                        style={{ margin: 0 }}
                    >
                        {getInputNode()}
                    </Form.Item>
                )
            ) : (
                children
            )}
        </td>
    );
};

const MonthlyExpanse: React.FC = () => {

    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const user = useUser();
    const [startPeriod, setStartPeriod] = useState<Dayjs>(dayjs().startOf('month'));
    const [endPeriod, setEndPeriod] = useState<Dayjs>(dayjs().endOf('month'));
    const [userId, setUserId] = useState<number>(user.id);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const pageNumber = usePageNumber();
    const setPageNumber = useSetPageNumber();
    const currentPage = useCurrentPage();
    const { filterOn, setFilterOn } = useFilterOn();
    const pageSize = usePageNumber();
    const location = useLocation();
    const curr = useCurrentPage();
    const setCurr = useSetCurrentPage();
    const rowsPerPage = usePageNumber();
    const totalCount = usePageSize();
    const totalPages = Math.ceil(totalCount / rowsPerPage);

    const formatNumber = (num: number, type: 'number' | 'double' = 'number'): string => {
        if (num === null || num === undefined || isNaN(num)) return "-";

        return new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: type === 'double' ? 2 : 0,
            maximumFractionDigits: type === 'double' ? 2 : 0,
            useGrouping: true,
        }).format(num);
    };

    const generatePaginationRange = () => {
        const range: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
        } else {
            range.push(1);

            if (curr > 3) range.push("...");

            const start = Math.max(2, curr - 1);
            const end = Math.min(totalPages - 1, curr + 1);
            for (let i = start; i <= end; i++) range.push(i);

            if (curr < totalPages - 2) range.push("...");

            range.push(totalPages);
        }

        return range;
    };

    const handlePageClick = (page: number | string) => {
        if (typeof page === "number") {
            setFilterOn(!filterOn);
            setCurr(page);
        }
    };

    const setCurrentPage = useSetCurrentPage();
    const setPageSize = useSetPageNumber();
    const setTotalCount = useSetPageSize();

    const { data: managerPeriodData, isLoading: periodsLoading, mutate: managerPeriodsMutating } = useSWR([`get-manager-period`], () => getAllManagerPeriods({
        startPeriod: dataFilter.startPeriod,
        endPeriod: dataFilter.endPeriod,
        userId: dataFilter.userId,
        page: dataFilter.page,
        size: dataFilter.size
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const managerPeriods = useMemo(
        () => managerPeriodData?.managerReportPeriods || [],
        [managerPeriodData]
    );

    const initialFilter = {
        startPeriod: startPeriod ? startPeriod.toDate() : new Date(),
        endPeriod: endPeriod ? endPeriod.toDate() : new Date(),
        userId: userId,
        page: currentPage,
        size: pageNumber
    }

    useEffect(() => {
        if (managerPeriods) {
            setData(managerPeriods);
        }
    }, [managerPeriods]);

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const workers = useMemo(() => {
        return workerData?.map((item) => ({
            name: item.name,
            value: item.id,
            surname: item.surname
        })) || [];
    }, [workerData]);

    const defaultValues = {
        startPeriod: new Date(),
        endPeriod: new Date(),
        sumStartPeriod: 0,
        sumEndPeriod: 0,
        userId: 0
    };

    const [data, setData] = useState<DataRecord[]>([]);

    const [editingKey, setEditingKey] = useState<string>('');

    const isEditing = (record: DataRecord): boolean => record.id.toString() === editingKey;

    const edit = (record: DataRecord): void => {
        const [startStr, endStr] = record.period.split(" - ");
        const startDate = dayjs(startStr, "DD.MM.YYYY");
        const endDate = dayjs(endStr, "DD.MM.YYYY");

        form.setFieldsValue({
            ...record,
            startPeriod: startDate,
            endPeriod: endDate
        });
        setEditingKey(record.id.toString());
    };

    const cancel = (): void => {
        setEditingKey('');
        form.resetFields();
    };

    const save = async (id: number): Promise<void> => {
        try {
            const row = await form.validateFields();

            const result = await updateManagerPer({
                managerReportPeriodId: id,
                sumStartPeriod: row.sumStartPeriod,
                sumEndPeriod: row.sumEndPeriod,
                startPeriod: row.startPeriod ? row.startPeriod.toDate() : undefined,
                endPeriod: row.endPeriod ? row.endPeriod.toDate() : undefined,
            });

            if (result) {
                mutate([`get-manager-period`]);
                message.success('Record updated successfully');
                setEditingKey('');
                form.resetFields();
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
            message.error('Please check the form fields');
        }
    };

    const getStatusTag = (status: string) => {
        if (status === t("tables.ACTIVE") || status === t("tables.SENT") || status === t("tables.In Progress") || status === t("analysis.PROGRESS"))
            return <Tag color="green">{status}</Tag>;
        if (status === t("tables.OVERDUE") || status === t("tables.Done") || status === t("tables.FINISHED") || status === t("tables.PAUSE") || status === t("analysis.DONE"))
            return <Tag color="red">{status}</Tag>;
        if (status === t("tables.SAVED") || status === t("tables.VERIFICATE"))
            return <Tag color="orange">{status}</Tag>;
        else return <Tag color="default">{status}</Tag>;
    };

    const statusOptions: { name: string, value: ManagerReportPeriodStatus }[] = [
        { name: t("tables.SAVED"), value: ManagerReportPeriodStatus.SAVE },
        { name: t("tables.SENT"), value: ManagerReportPeriodStatus.SENT }
    ];

    const navigate = useNavigate();

    const handleDelete = (id: string | number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this record?',
            content: 'This action cannot be undone.',
            okText: 'Yes, delete it',
            okType: 'danger',
            cancelText: 'Cancel',
            async onOk() {
                try {
                    const result = await mutate(
                        [`delete-manager-data`],
                        () => deleteManagerPaperPeriod(Number(id)),
                        false
                    );

                    if (result) {
                        mutate([`get-manager-period`]);
                        const newData = data.filter(item => item.id !== id);
                        setData(newData);
                        message.success('Record deleted successfully');
                    }
                } catch (error) {
                    console.error("Error deleting nomenclature:", error);
                }
            },
            onCancel() {
                message.info('Delete cancelled');
            }
        });
    };

    const columnsExpanse: ColumnsType<DataRecord> = [
        {
            title: "ID",
            dataIndex: "id",
            onCell: (record: DataRecord) => ({
                record,
                inputType: 'text',
                dataIndex: 'id',
                title: 'ID',
                editing: false,
            }),
        },
        {
            title: "Период",
            dataIndex: "period",
            render: (_: string, record: DataRecord) => {
                const [startStr, endStr] = record.period.split(" - ");
                const start = dayjs(startStr, "DD.MM.YYYY").format("DD.MM.YYYY");
                const end = dayjs(endStr, "DD.MM.YYYY").format("DD.MM.YYYY");
                return (
                    <div
                        className="text-primary02 hover:text-primary02_Hover cursor-pointer font-semibold"
                        onClick={() => navigate("/finance/report/period/edit", { state: { ownerId: record.id, status: record.status } })}
                    >
                        {`${start} - ${end}`}
                    </div>
                );
            },
            onCell: (record: DataRecord) => ({
                record,
                inputType: 'period',
                dataIndex: 'period',
                title: 'Период',
                editing: isEditing(record),
            }),
        },
        {
            title: "Входная сумма",
            dataIndex: "sumStartPeriod",
            render: (text: number, record: DataRecord) => {
                if (!isEditing(record)) {
                    return (
                        <div
                            className="text-text01"
                        >
                            {TableUtils.createCurrencyFormat(formatNumber(text))}
                        </div>
                    );
                }
                return text;
            },
            onCell: (record: DataRecord) => ({
                record,
                inputType: 'number',
                dataIndex: 'sumStartPeriod',
                title: 'Входная сумма',
                editing: isEditing(record),
            }),
        },
        {
            title: "Выходная сумма",
            dataIndex: "sumEndPeriod",
            render: (text: number, record: DataRecord) => {
                if (!isEditing(record)) {
                    return (
                        <div
                            className="text-text01"
                        >
                            {TableUtils.createCurrencyFormat(formatNumber(text))}
                        </div>
                    );
                }
                return text;
            },
            onCell: (record: DataRecord) => ({
                record,
                inputType: 'number',
                dataIndex: 'sumEndPeriod',
                title: 'Выходная сумма',
                editing: isEditing(record),
            }),
        },
        {
            title: "Статус",
            dataIndex: "status",
            render: (text: string) => {
                const statusOption = statusOptions.find(option => option.value === text);
                return statusOption ? getStatusTag(statusOption.name) : text;
            }
        },
        {
            title: "Недостача",
            dataIndex: "shortage",
            render: (text: number) => {
                return (
                    <div className={`${text < 0 ? "text-errorFill" : "text-text01"}`}>
                        {formatNumber(text)}
                    </div>
                )
            },
            onCell: (record: DataRecord) => ({
                record,
                inputType: 'number',
                dataIndex: 'shortage',
                title: 'Недостача',
                editing: false,
            }),
        },
        {
            title: "Пользователь",
            dataIndex: "userId",
            render: (text: number) => {
                const worker = workers.find(worker => worker.value === text);
                return worker ? `${worker.name} ${worker.surname}` : text;
            },
            onCell: (record: DataRecord) => ({
                record,
                inputType: 'text',
                dataIndex: 'userId',
                title: 'Пользователь',
                editing: false,
            }),
        },
        {
            title: "Действия",
            dataIndex: "actions",
            render: (_, record: DataRecord) => {
                const editable = isEditing(record);

                if (editable) {
                    return (
                        <Space className="flex space-x-4">
                            <div
                                className="cursor-pointer text-errorFill"
                                onClick={cancel}
                            >
                                <CloseOutlined />
                            </div>
                            <div
                                className="cursor-pointer text-successFill"
                                onClick={() => save(record.id)}
                            >
                                <CheckOutlined />
                            </div>
                        </Space>
                    );
                }

                const menu = (
                    <Menu
                        onClick={({ key }) => {
                            if (key === 'edit') edit(record);
                            else if (key === 'delete') handleDelete(record.id);
                        }}
                        items={[
                            { key: 'edit', label: 'Редактировать' },
                            { key: 'delete', label: 'Удалить', danger: true }
                        ]}
                    />
                );

                return (
                    <Dropdown overlay={menu} trigger={['click']}>
                        <div className="cursor-pointer text-primary02">
                            <MoreOutlined style={{ fontSize: 18 }} />
                        </div>
                    </Dropdown>
                );
            },
        }
    ];

    const memoizedColumns =
        columnsExpanse.map((col) => {
            if (!col.onCell) {
                return col;
            }
            return {
                ...col,
                onCell: (record: DataRecord) => col.onCell!(record),
            };
        });

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createManagerPer, isMutating } = useSWRMutation(['create-manager-period'], async () => createManagerPaperPeriod({
        startPeriod: formData.startPeriod,
        endPeriod: formData.endPeriod,
        sumStartPeriod: formData.sumStartPeriod,
        sumEndPeriod: formData.sumEndPeriod,
        userId: formData.userId
    }));

    const { trigger: updateManagerPer } = useSWRMutation(
        ['update-manager-period'],
        async (_, { arg }: {
            arg: {
                managerReportPeriodId: number;
                startPeriod?: Date;
                endPeriod?: Date;
                sumStartPeriod?: number;
                sumEndPeriod?: number;
            };
        }) => {
            return updateManagerPaperPeriod(arg);
        }
    );

    type FieldType = "startPeriod" | "endPeriod" | "userId" | "sumStartPeriod" | "sumEndPeriod";

    const handleInputChange = (field: FieldType, value: Date | number) => {
        const numericFields = ["sumStartPeriod", "sumEndPeriod", "userId"];
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
        try {
            const result = await createManagerPer();
            if (result) {
                mutate([`get-manager-period`]);
                resetForm();
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    }

    const [dataFilter, setDataFilter] = useState<ManagerPeriodParams>(initialFilter);

    useEffect(() => {
        setCurrentPage(1);
        setDataFilter((prevFilter) => ({
            ...prevFilter,
            page: 1
        }));
    }, [location, setCurrentPage]);

    const totalRecords = managerPeriodData?.totalCount || 0;
    const maxPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        if (currentPage > maxPages) {
            setCurrentPage(maxPages > 0 ? maxPages : 1);
            setDataFilter((prevFilter) => ({
                ...prevFilter,
                page: maxPages > 0 ? maxPages : 1
            }));
        }
    }, [maxPages, currentPage, setCurrentPage]);

    const handleDataFilter = (newFilterData: Partial<ManagerPeriodParams>) => {
        setDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.startPeriod) {
            setStartPeriod(dayjs(newFilterData.startPeriod));
        }

        if (newFilterData.endPeriod) {
            setEndPeriod(dayjs(newFilterData.endPeriod));
        }

        if (newFilterData.userId) setUserId(newFilterData.userId);
        if (newFilterData.page) setCurrentPage(newFilterData.page);
        if (newFilterData.size) setPageNumber(newFilterData.size);
    }

    useEffect(() => {
        handleDataFilter({
            startPeriod: startPeriod?.toDate(),
            endPeriod: endPeriod?.toDate(),
            userId: userId,
            page: currentPage,
            size: pageNumber
        })
    }, [filterOn]);

    useEffect(() => {
        managerPeriodsMutating().then(() => setIsTableLoading(false));
    }, [dataFilter, managerPeriodsMutating]);

    useEffect(() => {
        if (!periodsLoading && managerPeriodData?.totalCount)
            setTotalCount(managerPeriodData?.totalCount)
    }, [managerPeriodData, periodsLoading, setTotalCount]);

    const handleClear = () => {
        setStartPeriod(dayjs().startOf('month'));
        setEndPeriod(dayjs().endOf('month'));
        setUserId(user.id);
        setPageSize(15);
        setCurrentPage(1);
    }


    return (
        <div>
            <Filter count={managerPeriods.length} hideDateTime={true} hideCity={true} hideSearch={true} handleClear={handleClear}>
                <DateTimeInput
                    title={t("hr.startPaymentDate")}
                    classname="w-64"
                    value={startPeriod}
                    changeValue={(date) => setStartPeriod(dayjs(date))}
                />
                <DateTimeInput
                    title={t("hr.endPaymentDate")}
                    classname="w-64"
                    value={endPeriod}
                    changeValue={(date) => setEndPeriod(dayjs(date))}
                />
                <DropdownInput
                    title={t("routes.employees")}
                    classname="w-full sm:w-80"
                    label={t("warehouse.notSel")}
                    options={workers}
                    value={userId}
                    onChange={(value) => setUserId(value)}
                />
            </Filter>
            <div className="mt-8">
                {periodsLoading || isTableLoading ? (
                    <TableSkeleton columnCount={columnsExpanse.length} />
                ) : (
                    <Form form={form} component={false}>
                        <Table
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
                                    cell: EditableCell
                                },
                            }}
                            dataSource={data}
                            columns={memoizedColumns}
                            rowClassName="editable-row"
                            pagination={false}
                            rowKey="id"
                            scroll={{ x: "max-content" }}
                        />
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => {
                                    const newPage = Math.max(1, curr - 1);
                                    setFilterOn(!filterOn);
                                    setCurr(newPage);
                                }}
                                disabled={curr === 1}
                                className={`px-2 py-1 ${curr === 1 ? "text-gray-400 cursor-not-allowed" : "text-text01"}`}
                            >
                                <Icon icon="chevron-left" />
                            </button>
                            {generatePaginationRange().map((page, index) =>
                                page === "..." ? (
                                    <span key={index} className="px-2 py-1 text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={() => handlePageClick(page)}
                                        className={`px-4 py-2 font-semibold ${curr === page ? "bg-white text-primary02 rounded-lg border border-primary02" : "text-text01"}`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => {
                                    setFilterOn(!filterOn);
                                    setCurr(Math.min(totalPages, curr + 1));
                                }}
                                disabled={curr === totalPages}
                                className={`px-2 py-1 ${curr === totalPages ? "text-gray-400 cursor-not-allowed" : "text-text01"}`}
                            >
                                <Icon icon="chevron-right" />
                            </button>
                        </div>
                    </Form>
                )}
            </div>

            <DrawerCreate>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl mx-auto p-4">
                    <span className="font-semibold text-xl md:text-3xl text-text01 mb-5">{t("pos.creating")}</span>
                    <DateInput
                        title={`${t("finance.begin")}*`}
                        classname="w-44"
                        value={formData.startPeriod ? dayjs(formData.startPeriod) : null}
                        changeValue={(date) => handleInputChange("startPeriod", date ? date.toDate() : new Date())}
                        error={!!errors.startPeriod}
                        {...register('startPeriod', { required: 'Start Date is required' })}
                        helperText={errors.startPeriod?.message || ''}
                    />
                    <DateInput
                        title={`${t("finance.end")}*`}
                        classname="w-44"
                        value={formData.endPeriod ? dayjs(formData.endPeriod) : null}
                        changeValue={(date) => handleInputChange("endPeriod", date ? date.toDate() : new Date())}
                        error={!!errors.endPeriod}
                        {...register('endPeriod', { required: 'End Date is required' })}
                        helperText={errors.endPeriod?.message || ''}
                    />
                    <Input
                        title={`${t("analysis.sumStart")}*`}
                        type="number"
                        classname="w-44"
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-xl">₽</div>}
                        value={formData.sumStartPeriod}
                        changeValue={(e) => handleInputChange('sumStartPeriod', e.target.value)}
                        error={!!errors.sumStartPeriod}
                        {...register('sumStartPeriod', { required: 'sumStartPeriod is required' })}
                        helperText={errors.sumStartPeriod?.message || ''}
                    />
                    <Input
                        title={`${t("analysis.sumEnd")}*`}
                        type="number"
                        classname="w-44"
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-xl">₽</div>}
                        value={formData.sumEndPeriod}
                        changeValue={(e) => handleInputChange('sumEndPeriod', e.target.value)}
                        error={!!errors.sumEndPeriod}
                        {...register('sumEndPeriod', { required: 'sumEndPeriod is required' })}
                        helperText={errors.sumEndPeriod?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("equipment.user")}*`}
                        options={workers}
                        classname="w-80"
                        {...register('userId', {
                            required: 'User ID is required',
                            validate: (value) =>
                                (value !== 0) || "User ID is required"
                        })}
                        value={formData.userId}
                        onChange={(value) => handleInputChange('userId', value)}
                        error={!!errors.userId}
                        helperText={errors.userId?.message || ''}
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
                            isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </div>
    )
}

export default MonthlyExpanse;