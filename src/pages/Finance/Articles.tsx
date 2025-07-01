import Filter from "@/components/ui/Filter/Filter";
import React, { ClassAttributes, ThHTMLAttributes, useEffect, useMemo, useState } from "react";
import { DatePicker, message, Skeleton, TableProps, Tag, Upload } from 'antd';
import { Card, Row, Col, Typography, Space, Form, Popconfirm, Table, Button as AntDButton } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, LineChartOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import SearchDropdownInput from "@/components/ui/Input/SearchDropdownInput";
import useSWR, { mutate } from "swr";
import { getPoses } from "@/services/api/equipment";
import { useCity, useCurrentPage, usePageNumber, usePageSize, useSetCurrentPage, useSetPageNumber, useSetPageSize } from "@/hooks/useAuthStore";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import useFormHook from "@/hooks/useFormHook";
import dayjs, { Dayjs } from "dayjs";
import DateInput from "@/components/ui/Input/DateInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { createManagerPaper, deleteManagerPapers, getAllManagerPaper, getAllManagerPaperGraph, getAllManagerPaperTypes, getAllWorkers, updateManagerPaper } from "@/services/api/finance";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import useSWRMutation from "swr/mutation";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import { getWorkers } from "@/services/api/hr";
import { useFilterOn } from "@/components/context/useContext";
import DateTimeInput from "@/components/ui/Input/DateTimeInput";
import { useLocation } from "react-router-dom";
import Icon from "feather-icons-react";
import { useUser } from "@/hooks/useUserStore";

const { Title, Text } = Typography;

interface FinancialCardProps {
    title: string;
    amount: number;
    currency: string;
    trend: 'up' | 'down' | 'neutral';
    color: string;
    backgroundColor: string;
    loading?: boolean;
}

interface DataType {
    key: string;
    id: number;
    group: string;
    posId: number;
    paperTypeId: number;
    eventDate: Dayjs;
    sum: number;
    comment: string;
}

enum ManagerPaperGroup {
    RENT = "RENT",
    REVENUE = "REVENUE",
    WAGES = "WAGES",
    INVESTMENT_DEVIDENTS = "INVESTMENT_DEVIDENTS",
    UTILITY_BILLS = "UTILITY_BILLS",
    TAXES = "TAXES",
    ACCOUNTABLE_FUNDS = "ACCOUNTABLE_FUNDS",
    REPRESENTATIVE_EXPENSES = "REPRESENTATIVE_EXPENSES",
    SALE_EQUIPMENT = "SALE_EQUIPMENT",
    MANUFACTURE = "MANUFACTURE",
    OTHER = "OTHER",
    SUPPLIES = "SUPPLIES",
    P_C = "P_C",
    WAREHOUSE = "WAREHOUSE",
    CONSTRUCTION = "CONSTRUCTION",
    MAINTENANCE_REPAIR = "MAINTENANCE_REPAIR",
    TRANSPORTATION_COSTS = "TRANSPORTATION_COSTS"
}

type ManagerPaperBody = {
    group: ManagerPaperGroup;
    posId: number;
    paperTypeId: number;
    eventDate: Date;
    sum: number;
    userId: number;
    comment?: string;
}

type ManagerParams = {
    group: ManagerPaperGroup | '*';
    posId: number | '*';
    paperTypeId: number | '*';
    userId: number | '*';
    dateStartEvent?: Date;
    dateEndEvent?: Date;
    page?: number;
    size?: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text' | 'date';
    record: DataType;
    index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
    editing,
    dataIndex,
    title,
    inputType,
    children,
    ...restProps
}) => {
    const { t } = useTranslation();
    const city = useCity();
    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: paperTypeData } = useSWR([`get-paper-type`], () => getAllManagerPaperTypes(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number | string; }[] = (posData?.map((item) => ({ name: item.name, value: item.id })) || []).sort((a, b) => a.name.localeCompare(b.name));

    const paperTypes: { name: string; value: number; }[] = (paperTypeData?.map((item) => ({ name: item.props.name, value: item.props.id })) || []).sort((a, b) => a.name.localeCompare(b.name));

    const groups: { name: string; value: string; }[] = [
        { value: ManagerPaperGroup.RENT, name: t("finance.RENT") },
        { value: ManagerPaperGroup.REVENUE, name: t("finance.REVENUE") },
        { value: ManagerPaperGroup.WAGES, name: t("finance.WAGES") },
        { value: ManagerPaperGroup.INVESTMENT_DEVIDENTS, name: t("finance.INVESTMENT_DEVIDENTS") },
        { value: ManagerPaperGroup.UTILITY_BILLS, name: t("finance.UTILITY_BILLS") },
        { value: ManagerPaperGroup.TAXES, name: t("finance.TAXES") },
        { value: ManagerPaperGroup.ACCOUNTABLE_FUNDS, name: t("finance.ACCOUNTABLE_FUNDS") },
        { value: ManagerPaperGroup.REPRESENTATIVE_EXPENSES, name: t("finance.REPRESENTATIVE_EXPENSES") },
        { value: ManagerPaperGroup.SALE_EQUIPMENT, name: t("finance.SALE_EQUIPMENT") },
        { value: ManagerPaperGroup.MANUFACTURE, name: t("finance.MANUFACTURE") },
        { value: ManagerPaperGroup.OTHER, name: t("finance.OTHER") },
        { value: ManagerPaperGroup.SUPPLIES, name: t("finance.SUPPLIES") },
        { value: ManagerPaperGroup.P_C, name: t("finance.P_C") },
        { value: ManagerPaperGroup.WAREHOUSE, name: t("finance.WAREHOUSE") },
        { value: ManagerPaperGroup.CONSTRUCTION, name: t("finance.CONSTRUCTION") },
        { value: ManagerPaperGroup.MAINTENANCE_REPAIR, name: t("finance.MAINTENANCE_REPAIR") },
        { value: ManagerPaperGroup.TRANSPORTATION_COSTS, name: t("finance.TRANSPORTATION_COSTS") }
    ];

    // Get current form instance to access form values
    const form = Form.useFormInstance();

    const inputNode =
        dataIndex === "group" ?
            <SearchDropdownInput
                options={groups}
                value={form.getFieldValue(dataIndex)}
                onChange={(value) => form.setFieldValue(dataIndex, value)}
                classname="w-80"
            />
            : dataIndex === "posId" ?
                <SearchDropdownInput
                    options={poses}
                    value={form.getFieldValue(dataIndex)}
                    onChange={(value) => form.setFieldValue(dataIndex, value)}
                    classname="w-44"
                />
                : dataIndex === "paperTypeId" ?
                    <SearchDropdownInput
                        options={paperTypes}
                        value={form.getFieldValue(dataIndex)}
                        onChange={(value) => form.setFieldValue(dataIndex, value)}
                        classname="w-44"
                    />
                    : inputType === 'date' ?
                        <DatePicker
                            format={"DD-MM-YYYY"}
                            style={{ width: "150px" }}
                            value={form.getFieldValue(dataIndex)}
                            onChange={(date) => form.setFieldValue(dataIndex, date)}
                        /> : inputType === 'number' ?
                            <Input
                                type="number"
                                classname="w-40"
                                showIcon={true}
                                IconComponent={<div className="text-text02 text-xl">₽</div>}
                                value={form.getFieldValue(dataIndex)}
                                changeValue={(e) => form.setFieldValue(dataIndex, parseFloat(e.target.value))}
                            /> :
                            <Input
                                value={form.getFieldValue(dataIndex)}
                                changeValue={(e) => form.setFieldValue(dataIndex, e.target.value)}
                            />;

    return (
        <td
            {...restProps}
            style={{ paddingLeft: "9px", paddingTop: "10px", paddingBottom: "10px" }}
        >
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const FinancialCard: React.FC<FinancialCardProps> = ({
    title,
    amount,
    currency,
    trend,
    color,
    backgroundColor,
    loading
}) => {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <ArrowUpOutlined style={{ color: '#52c41a', fontSize: "18px" }} />;
            case 'down':
                return <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: "18px" }} />;
            case 'neutral':
                return <LineChartOutlined style={{ color: '#1890ff', fontSize: "18px" }} />;
            default:
                return null;
        }
    };

    return (
        <Card
            style={{
                borderRadius: '12px',
            }}
            bodyStyle={{
                padding: '24px',
            }}
        >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Text style={{ color: '#8c8c8c', fontSize: '14px', fontWeight: 400 }}>
                            {title}
                        </Text>
                        <Title
                            level={2}
                            style={{
                                margin: 0,
                                color,
                                fontSize: '28px',
                                fontWeight: 700
                            }}
                        >{loading ? (
                            <Skeleton.Button active={true} size={"default"} shape={"default"} block={false} />
                        ) :
                            <>{currency} {amount}</>
                            }
                        </Title>
                    </div>
                    <div
                        style={{
                            backgroundColor,
                            borderRadius: '6px',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            height: "48px",
                            width: "48px",
                            justifyContent: "center",
                            paddingBottom: "0px"
                        }}
                    >
                        {getTrendIcon()}
                    </div>
                </div>
            </Space>
        </Card>
    );
};

const Articles: React.FC = () => {

    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [data, setData] = useState<DataType[]>([]);
    const [editingKey, setEditingKey] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isStateOpen, setIsStateOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [group, setGroup] = useState<ManagerPaperGroup | '*'>("*");
    const [posId, setPosId] = useState<number | "*">("*");
    const [paperTypeId, setPaperTypeId] = useState<number | "*">("*");
    const [userId, setUserId] = useState<number | "*">("*");
    const [startPeriod, setStartPeriod] = useState<Dayjs>(dayjs().startOf('month'));
    const [endPeriod, setEndPeriod] = useState<Dayjs>(dayjs().endOf('month'));
    const [isTableLoading, setIsTableLoading] = useState(false);
    const { filterOn, setFilterOn } = useFilterOn();
    const currentPage = useCurrentPage();
    const pageSize = usePageNumber();
    const location = useLocation();
    const curr = useCurrentPage();
    const setCurr = useSetCurrentPage();
    const rowsPerPage = usePageNumber();
    const totalCount = usePageSize();
    const totalPages = Math.ceil(totalCount / rowsPerPage);

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

    const initialFilter = {
        group: group,
        posId: posId,
        paperTypeId: paperTypeId,
        userId: userId,
        dateStartEvent: startPeriod ? startPeriod.toDate() : undefined,
        dateEndEvent: endPeriod ? endPeriod.toDate() : undefined,
        page: currentPage,
        size: pageSize
    }

    const isEditing = (record: DataType) => record.key === editingKey;

    const edit = (record: Partial<DataType> & { key: React.Key }) => {
        form.setFieldsValue({ ...record, date: dayjs(record.eventDate) });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const city = useCity();

    const { data: allManagersData, isLoading: loadingManagerData, mutate: managerMutating } = useSWR([`get-manager-data`], () => getAllManagerPaper({
        group: dataFilter.group,
        posId: dataFilter.posId,
        paperTypeId: dataFilter.paperTypeId,
        userId: dataFilter.userId,
        dateStartEvent: dataFilter.dateStartEvent,
        dateEndEvent: dataFilter.dateEndEvent,
        page: currentPage,
        size: pageSize
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: allManagersGraphData, isLoading: loadingGraphData } = useSWR([`get-manager-graph-data`], () => getAllManagerPaperGraph({
        group: dataFilter.group,
        posId: dataFilter.posId,
        paperTypeId: dataFilter.paperTypeId,
        userId: dataFilter.userId,
        dateStartEvent: dataFilter.dateStartEvent,
        dateEndEvent: dataFilter.dateEndEvent,
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const financialData = [
        {
            title: 'Доходы',
            amount: allManagersGraphData?.receipt || 0,
            currency: '₽',
            trend: 'up' as const,
            color: '#52c41a',
            backgroundColor: '#f6ffed',
            loading: loadingGraphData || isTableLoading
        },
        {
            title: 'Расходы',
            amount: allManagersGraphData?.expenditure || 0,
            currency: '₽',
            trend: 'down' as const,
            color: '#ff4d4f',
            backgroundColor: '#fff2f0',
            loading: loadingGraphData || isTableLoading
        },
        {
            title: 'Баланс',
            amount: allManagersGraphData?.balance || 0,
            currency: '₽',
            trend: 'neutral' as const,
            color: '#1890ff',
            backgroundColor: '#f0f5ff',
            loading: loadingGraphData || isTableLoading
        },
    ];


    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: paperTypeData } = useSWR([`get-paper-type`], () => getAllManagerPaperTypes(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: workersData } = useSWR([`get-workers`], () => getWorkers({
        placementId: "*",
        hrPositionId: "*",
        organizationId: "*"
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const workers: { name: string; value: number | "*"; }[] = [
        { name: t("hr.all"), value: "*" },
        ...(workersData?.map((work) => ({
            name: work.props.name,
            value: work.props.id
        })) || [])
    ];

    const poses: { name: string; value: number | string; }[] = (posData?.map((item) => ({ name: item.name, value: item.id })) || []).sort((a, b) => a.name.localeCompare(b.name));

    const paperTypes: { name: string; value: number; type: string; }[] = (paperTypeData?.map((item) => ({ name: item.props.name, value: item.props.id, type: item.props.type })) || []).sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        if (allManagersData) {
            const temporaryData: DataType[] = allManagersData.managerPapers.map((man) => ({
                key: `${man.props.id}`,
                id: man.props.id,
                group: man.props.group,
                posId: man.props.posId,
                paperTypeId: man.props.paperTypeId,
                eventDate: dayjs(man.props.eventDate),
                sum: man.props.sum,
                comment: man.props.comment || ""
            }));
            setData(temporaryData);
        }
    }, [allManagersData]);

    const save = async (key: React.Key) => {
        try {
            const row = (await form.validateFields()) as DataType;

            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);

            if (index > -1) {
                const item = newData[index];
                const updatedItem = {
                    ...item,
                    ...row,
                    eventDate: row.eventDate ? row.eventDate : item.eventDate,
                };

                // Prepare API payload with correct types
                const apiPayload = {
                    managerPaperId: item.id,
                    group: updatedItem.group !== item.group ? updatedItem.group as ManagerPaperGroup : undefined,
                    posId: updatedItem.posId !== item.posId
                        ? updatedItem.posId
                        : undefined,
                    paperTypeId: updatedItem.paperTypeId !== item.paperTypeId
                        ? updatedItem.paperTypeId
                        : undefined,
                    eventDate: updatedItem.eventDate !== item.eventDate
                        ? (dayjs.isDayjs(updatedItem.eventDate) ? updatedItem.eventDate.toDate() : updatedItem.eventDate)
                        : undefined,
                    sum: updatedItem.sum !== item.sum ? updatedItem.sum : undefined,
                    comment: updatedItem.comment !== item.comment ? updatedItem.comment : undefined,
                };

                // Call the API
                const result = await updateManager(apiPayload);

                if (result) {
                    mutate([`get-manager-data`]);
                    mutate([`get-manager-graph-data`]);
                    newData.splice(index, 1, updatedItem);
                    setData(newData);
                    setEditingKey('');

                    // Clear selected file after successful update
                    setSelectedFile(null);
                    message.success('Record updated successfully');
                }

            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (error) {
            console.log('Update Failed:', error);
            message.error('Failed to update record');
        }
    };

    // Add new row function
    const handleAddRow = () => {
        setIsOpenModal(true);
        // const newKey = Math.max(Math.max(...data.map(item => parseInt(item.key))) + 1, 0);
        // const newRow: DataType = {
        //     key: newKey.toString(),
        //     name: `Edward ${newKey}`,
        //     age: 25,
        //     address: `London Park no. ${newKey}`,
        // };
        // setData([...data, newRow]);
    };

    // Delete selected rows function
    const handleDeleteRow = async () => {
        try {
            const result = await mutate(
                [`delete-manager-data`],
                () => deleteManagerPapers({ ids: selectedRowKeys.map((key) => Number(key)) }),
                false
            );

            if (result) {
                mutate([`get-manager-data`]);
                mutate([`get-manager-graph-data`]);
                setSelectedRowKeys([]);
                if (selectedRowKeys.includes(editingKey)) {
                    setEditingKey('');
                }
            }
        } catch (error) {
            console.error("Error deleting nomenclature:", error);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '5%',
            editable: false,
        },
        {
            title: 'Группа',
            dataIndex: 'group',
            width: '10%',
            editable: true,
            render: (value: string) => groups.find((pos) => pos.value === value)?.name
        },
        {
            title: 'Назначение',
            dataIndex: 'posId',
            width: '10%',
            editable: true,
            render: (value: number) => poses.find((pos) => pos.value === value)?.name
        },
        {
            title: 'Статья',
            dataIndex: 'paperTypeId',
            width: '10%',
            editable: true,
            render: (value: number) => (
                <div>
                    <Tag color={paperTypes.find((pap) => pap.value === value)?.type === "EXPENDITURE" ? "green" : paperTypes.find((pap) => pap.value === value)?.type === "RECEIPT" ? "red" : ""}>{paperTypes.find((pap) => pap.value === value)?.name}</Tag>
                </div>
            )
        },
        {
            title: 'Дата',
            dataIndex: 'eventDate',
            width: '10%',
            editable: true,
            render: (value: Dayjs) => value?.format("DD-MM-YYYY")
        },
        {
            title: 'Сумма',
            dataIndex: 'sum',
            width: '5%',
            editable: true,
            render: (value: number) => `${value.toLocaleString('ru-RU')} ₽`,
        },
        {
            title: 'Примечание',
            dataIndex: 'comment',
            width: '35%',
            editable: true,
        },
        {
            title: 'Операции',
            dataIndex: 'operation',
            width: '15%',
            render: (_: any, record: DataType) => {
                const editable = isEditing(record);
                return editable ? (
                    <span className="flex space-x-4">
                        <Button
                            title="Отмена"
                            handleClick={cancel}
                            type="outline"
                            classname="h-10"
                        />
                        <Button
                            title="Сохранять"
                            handleClick={() => save(record.key)}
                            isLoading={updatingManager}
                            classname="h-10"
                        />
                    </span>
                ) : (
                    <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                        Редактировать
                    </Typography.Link>
                );
            },
        },
    ];

    const mergedColumns: TableProps<DataType>['columns'] = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: DataType) => ({
                record,
                inputType: col.dataIndex === 'eventDate' ? 'date' : col.dataIndex === "sum" ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    const user = useUser();

    const defaultValues: ManagerPaperBody = {
        group: ManagerPaperGroup.WAGES,
        posId: 0,
        paperTypeId: 0,
        eventDate: new Date(),
        sum: 0,
        userId: user.id,
        comment: undefined
    };

    const [formData, setFormData] = useState(defaultValues);

    const { data: allWorkersData } = useSWR(formData.posId !== 0 ? [`get-all-workers`] : null, () => getAllWorkers(formData.posId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const allWorkers: { name: string; value: number; }[] = [
        ...(allWorkersData?.map((work) => ({
            name: work.props.name,
            value: work.props.id
        })) || [])
    ];

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createManager, isMutating } = useSWRMutation(['create-manager'], async () => createManagerPaper({
        group: formData.group,
        posId: formData.posId,
        paperTypeId: formData.paperTypeId,
        eventDate: formData.eventDate,
        sum: formData.sum,
        userId: formData.userId,
        comment: formData.comment
    }, selectedFile));

    const { trigger: updateManager, isMutating: updatingManager } = useSWRMutation(
        ['update-manager'],
        async (_, { arg }: {
            arg: {
                managerPaperId: number;
                group?: ManagerPaperGroup;
                posId?: number;
                paperTypeId?: number;
                eventDate?: Date;
                sum?: number;
                userId?: number;
                comment?: string;
            };
        }) => {
            return updateManagerPaper(arg, null);
        }
    );

    type FieldType = "group" | "sum" | "posId" | "paperTypeId" | "eventDate" | "userId" | "comment";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ["paperTypeId", "posId", "sum"];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
        setIsOpenModal(false);
    };

    const onSubmit = async () => {
        try {
            const result = await createManager();
            if (result) {
                mutate([`get-manager-data`]);
                mutate([`get-manager-graph-data`]);
                resetForm();
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    }

    // const stateTypeOptions = useMemo(() => [
    //     { label: "Active", value: "active", color: "#52c41a" },      // Green
    //     { label: "Pending", value: "pending", color: "#faad14" },     // Orange
    //     { label: "Completed", value: "completed", color: "#1890ff" }, // Blue
    //     { label: "Cancelled", value: "cancelled", color: "#f5222d" }, // Red
    //     { label: "Archived", value: "archived", color: "#8c8c8c" },   // Gray
    //     { label: "In Progress", value: "in_progress", color: "#13c2c2" }, // Cyan
    // ], []);

    const [searchText, setSearchText] = useState("");

    const filteredOptions = useMemo(() => {
        return paperTypes.filter((opt) =>
            opt.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, paperTypes]);

    const handleSelect = (value: number) => {
        setFormData((prev) => ({ ...prev, ["paperTypeId"]: value }));
        setValue("paperTypeId", value);
    };

    const handleConfirm = () => {
        setIsStateOpen(false);
    };

    const handleFileChange = (info: any) => {
        const { fileList: newFileList } = info;
        setFileList(newFileList);

        // Get the actual file from the fileList
        const file = newFileList[0]?.originFileObj || null;
        setSelectedFile(file);

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
        }
    };

    const groups: { name: string; value: string; }[] = [
        { value: ManagerPaperGroup.RENT, name: t("finance.RENT") },
        { value: ManagerPaperGroup.REVENUE, name: t("finance.REVENUE") },
        { value: ManagerPaperGroup.WAGES, name: t("finance.WAGES") },
        { value: ManagerPaperGroup.INVESTMENT_DEVIDENTS, name: t("finance.INVESTMENT_DEVIDENTS") },
        { value: ManagerPaperGroup.UTILITY_BILLS, name: t("finance.UTILITY_BILLS") },
        { value: ManagerPaperGroup.TAXES, name: t("finance.TAXES") },
        { value: ManagerPaperGroup.ACCOUNTABLE_FUNDS, name: t("finance.ACCOUNTABLE_FUNDS") },
        { value: ManagerPaperGroup.REPRESENTATIVE_EXPENSES, name: t("finance.REPRESENTATIVE_EXPENSES") },
        { value: ManagerPaperGroup.SALE_EQUIPMENT, name: t("finance.SALE_EQUIPMENT") },
        { value: ManagerPaperGroup.MANUFACTURE, name: t("finance.MANUFACTURE") },
        { value: ManagerPaperGroup.OTHER, name: t("finance.OTHER") },
        { value: ManagerPaperGroup.SUPPLIES, name: t("finance.SUPPLIES") },
        { value: ManagerPaperGroup.P_C, name: t("finance.P_C") },
        { value: ManagerPaperGroup.WAREHOUSE, name: t("finance.WAREHOUSE") },
        { value: ManagerPaperGroup.CONSTRUCTION, name: t("finance.CONSTRUCTION") },
        { value: ManagerPaperGroup.MAINTENANCE_REPAIR, name: t("finance.MAINTENANCE_REPAIR") },
        { value: ManagerPaperGroup.TRANSPORTATION_COSTS, name: t("finance.TRANSPORTATION_COSTS") }
    ];

    const [dataFilter, setDataFilter] = useState<ManagerParams>(initialFilter);

    useEffect(() => {
        setCurrentPage(1);
        setDataFilter((prevFilter) => ({
            ...prevFilter,
            page: 1
        }));
    }, [location, setCurrentPage]);

    const totalRecords = allManagersData?.totalCount || 0;
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

    const handleDataFilter = (newFilterData: Partial<ManagerParams>) => {
        setDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
        if (newFilterData.group) setGroup(newFilterData.group);
        if (newFilterData.posId) setPosId(newFilterData.posId);
        if (newFilterData.paperTypeId) setPaperTypeId(newFilterData.paperTypeId);
        if (newFilterData.userId) setUserId(newFilterData.userId);
        if (newFilterData.dateStartEvent) setStartPeriod(dayjs(newFilterData.dateStartEvent));
        if (newFilterData.dateEndEvent) setEndPeriod(dayjs(newFilterData.dateEndEvent));
        if (newFilterData.page) setCurrentPage(newFilterData.page);
        if (newFilterData.size) setPageSize(newFilterData.size);
    }

    useEffect(() => {
        handleDataFilter({
            group: group,
            posId: posId,
            paperTypeId: paperTypeId,
            userId: userId,
            dateStartEvent: startPeriod ? startPeriod.toDate() : undefined,
            dateEndEvent: endPeriod ? endPeriod.toDate() : undefined
        })
    }, [filterOn]);

    useEffect(() => {
        managerMutating().then(() => setIsTableLoading(false));
    }, [dataFilter, managerMutating]);

    useEffect(() => {
        if (!loadingManagerData && allManagersData?.totalCount)
            setTotalCount(allManagersData?.totalCount)
    }, [allManagersData, loadingManagerData, setTotalCount]);

    const handleClear = () => {
        setGroup("*");
        setPosId("*");
        setPaperTypeId("*");
        setUserId("*");
        setStartPeriod(dayjs().startOf('month'));
        setEndPeriod(dayjs().endOf('month'));
        setPageSize(15);
        setCurrentPage(1);
    }

    return (
        <div>
            <Filter count={data.length} hideSearch={true} hideDateTime={true} handleClear={handleClear}>
                <SearchDropdownInput
                    title={t("analysis.posId")}
                    classname="w-80"
                    options={[...poses, { name: t("warehouse.all"), value: "*" }]}
                    value={posId}
                    onChange={(value) => setPosId(value)}
                />
                <DropdownInput
                    title="Группа"
                    classname="w-80"
                    value={group}
                    options={[...groups, { name: t("warehouse.all"), value: "*" }]}
                    onChange={(value) => setGroup(value)}
                />
                <DropdownInput
                    title="Статья"
                    classname="w-80"
                    value={paperTypeId}
                    options={[...paperTypes, { name: t("warehouse.all"), value: "*" }]}
                    onChange={(value) => setPaperTypeId(value)}
                />
                <DropdownInput
                    title={t("equipment.user")}
                    classname="w-80"
                    value={userId}
                    options={[...workers, { name: t("warehouse.all"), value: "*" }]}
                    onChange={(value) => setUserId(value)}
                />
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
            </Filter>
            <Modal isOpen={isStateOpen} classname="w-full sm:w-[600px]">
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("finance.addN")}</h2>
                    <Close
                        onClick={() => { setIsStateOpen(false); }}
                        className="cursor-pointer text-text01"
                    />
                </div>
                <Input
                    placeholder="Search state type..."
                    value={searchText}
                    changeValue={(e) => setSearchText(e.target.value)}
                    classname="mb-3"
                />

                {/* Filtered List */}
                <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${formData.paperTypeId === opt.value ? "text-primary02" : ""
                                    }`}
                            >
                                {opt.name}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-400">No matches found.</div>
                    )}
                </div>
                <Button
                    disabled={!formData.paperTypeId}
                    handleClick={handleConfirm}
                    title={t("finance.confirm")}
                    classname="mt-4 w-full"
                />
            </Modal>
            <Modal isOpen={isOpenModal} classname="w-full sm:w-[600px]">
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("roles.create")}</h2>
                    <Close
                        onClick={() => { setIsOpenModal(false); }}
                        className="cursor-pointer text-text01"
                    />
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col space-y-4 text-text02">
                        <SearchDropdownInput
                            title={t("finance.group")}
                            classname="w-full"
                            placeholder="Выберите объект"
                            options={groups}
                            {...register('group', {
                                required: 'Group ID is required',
                            })}
                            value={formData.group}
                            onChange={(value) => { handleInputChange('group', value); }}
                            error={!!errors.group}
                            errorText={errors.group?.message}
                        />
                        <SearchDropdownInput
                            title={t("analysis.posId")}
                            classname="w-full"
                            placeholder="Выберите объект"
                            options={poses}
                            {...register('posId', {
                                required: 'Pos ID is required',
                                validate: (value) =>
                                    (value !== 0) || "Pos ID is required"
                            })}
                            value={formData.posId}
                            onChange={(value) => { handleInputChange('posId', value); }}
                            error={!!errors.posId}
                            errorText={errors.posId?.message}
                        />
                        <Space.Compact className="w-full">
                            <div className="w-full">
                                <div className="text-sm text-text02">{t("finance.article")}</div>
                                <div className="w-full border h-10 flex items-center justify-center">{paperTypes.find((pap) => pap.value === formData.paperTypeId)?.name || ""}</div>
                            </div>
                            <AntDButton
                                onClick={() => setIsStateOpen(true)}
                                type="primary"
                                className="h-10 mt-[20px]"
                            >
                                {t("finance.op")}
                            </AntDButton>
                        </Space.Compact>
                        <Space className="w-full">
                            <div>
                                <div className="text-text02 text-sm">{t("finance.articleType")}</div>
                                <Tag color={paperTypes.find((pap) => pap.value === formData.paperTypeId)?.type === "EXPENDITURE" ? "green" : paperTypes.find((pap) => pap.value === formData.paperTypeId)?.type === "RECEIPT" ? "red" : ""} className="h-10 w-40 flex items-center justify-center">{paperTypes.find((pap) => pap.value === formData.paperTypeId)?.type ? t(`finance.${paperTypes.find((pap) => pap.value === formData.paperTypeId)?.type}`) : ""}</Tag>
                            </div>
                            <DateInput
                                title={t("finance.dat")}
                                classname="w-full sm:w-40"
                                value={formData.eventDate ? dayjs(formData.eventDate) : null}
                                changeValue={(eventDate) => handleInputChange("eventDate", eventDate ? eventDate.format("YYYY-MM-DDTHH:mm") : "")}
                                error={!!errors.eventDate}
                                {...register('eventDate', { required: 'eventDate is required' })}
                                helperText={errors.eventDate?.message || ''}
                            />
                        </Space>
                        <Input
                            title={t("finance.sum")}
                            type="number"
                            classname="w-full"
                            showIcon={true}
                            IconComponent={<div className="text-text02 text-xl">₽</div>}
                            value={formData.sum}
                            changeValue={(e) => handleInputChange('sum', e.target.value)}
                            error={!!errors.sum}
                            {...register('sum', { required: 'sum is required' })}
                            helperText={errors.sum?.message || ''}
                        />
                        <MultilineInput
                            title={t("equipment.comment")}
                            classname="w-full"
                            value={formData.comment}
                            changeValue={(e) => handleInputChange('comment', e.target.value)}
                            {...register('comment')}
                        />
                        <div>
                            <div className="text-text02 text-sm">{t("hr.upload")}</div>
                            <Upload
                                listType="picture-card"
                                showUploadList={true}
                                beforeUpload={() => false} // prevent auto upload
                                onChange={handleFileChange}
                                fileList={fileList}
                                maxCount={1}
                                className="w-full upload-full-width"
                            >
                                {fileList.length >= 1 ? null : (
                                    <div className="text-text02 w-full">
                                        <PlusOutlined />
                                        <div className="mt-2">{t("hr.upload")}</div>
                                    </div>
                                )}
                            </Upload>
                        </div>
                        <style>{`
    .upload-full-width .ant-upload.ant-upload-select {
        width: 100% !important;
        height: auto;
    }
    
    .upload-full-width .ant-upload-list {
        width: 100%;
    }
    
    .upload-full-width .ant-upload-list-picture-card .ant-upload-list-item {
        width: 100%;
        height: auto;
    }
`}
                        </style>
                        <SearchDropdownInput
                            title={t("equipment.user")}
                            classname="w-full"
                            placeholder="Выберите объект"
                            options={allWorkers}
                            {...register('userId', {
                                required: 'User ID is required',
                                validate: (value) =>
                                    (value !== 0) || "User ID is required"
                            })}
                            value={formData.userId}
                            onChange={(value) => { handleInputChange('userId', value); }}
                            error={!!errors.userId}
                            errorText={errors.userId?.message}
                        />
                        {/* <div>
                            <div className="text-text02 text-sm">{t("equipment.user")}</div>
                            <div className="text-text02 flex items-center space-x-1">
                                <UserOutlined style={{ fontSize: "24px" }} />
                                <span className="text-text01">{user.name}</span>
                            </div>
                        </div> */}
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-6">
                            <Button title={t("organizations.cancel")} type="outline" handleClick={() => { setIsOpenModal(false); resetForm(); }} />
                            <Button title={t("organizations.save")} form={true} isLoading={isMutating} handleClick={() => { }} />
                        </div>
                    </div>
                </form>
            </Modal>
            <div style={{ marginTop: '24px' }}>
                <Row gutter={[16, 16]}>
                    {financialData.map((data, index) => (
                        <Col xs={24} sm={8} key={index}>
                            <FinancialCard {...data} />
                        </Col>
                    ))}
                </Row>
            </div>

            <div className="mt-5">
                {/* Add/Delete buttons */}
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <AntDButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddRow}
                        >
                            {t("finance.addRow")}
                        </AntDButton>
                        <Popconfirm
                            title="Are you sure you want to delete the selected rows?"
                            onConfirm={handleDeleteRow}
                            disabled={selectedRowKeys.length === 0}
                        >
                            <AntDButton
                                danger
                                icon={<DeleteOutlined />}
                                disabled={selectedRowKeys.length === 0}
                            >
                                {t("finance.del")} ({selectedRowKeys.length})
                            </AntDButton>
                        </Popconfirm>
                    </Space>
                </div>

                <Form form={form} component={false}>
                    {loadingManagerData || isTableLoading ?
                        <TableSkeleton columnCount={mergedColumns.length} />
                        :
                        <div>
                            <Table<DataType>
                                dataSource={data}
                                columns={mergedColumns}
                                rowClassName="editable-row"
                                pagination={false}
                                rowSelection={rowSelection}
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
                        </div>
                    }
                </Form>
            </div>
        </div>
    );
};

export default Articles;