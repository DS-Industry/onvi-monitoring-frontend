import Filter from "@/components/ui/Filter/Filter";
import React, { ClassAttributes, ThHTMLAttributes, useMemo, useState } from "react";
import type { TableProps } from 'antd';
import { Card, Row, Col, Typography, Space, Form, InputNumber, Popconfirm, Table, Button as AntDButton } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, LineChartOutlined, PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import SearchDropdownInput from "@/components/ui/Input/SearchDropdownInput";
import useSWR from "swr";
import { getPoses } from "@/services/api/equipment";
import { useCity } from "@/hooks/useAuthStore";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import useFormHook from "@/hooks/useFormHook";
import dayjs from "dayjs";
import DateInput from "@/components/ui/Input/DateInput";

const { Title, Text } = Typography;

interface FinancialCardProps {
    title: string;
    amount: string;
    currency: string;
    trend: 'up' | 'down' | 'neutral';
    color: string;
    backgroundColor: string;
}

interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
}

const originData = Array.from({ length: 10 }).map<DataType>((_, i) => ({
    key: i.toString(),
    name: `Edward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
}));

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text';
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
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

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
    backgroundColor
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
                        >
                            {currency} {amount}
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
    const financialData = [
        {
            title: 'Доходы',
            amount: '485,230',
            currency: '₽',
            trend: 'up' as const,
            color: '#52c41a',
            backgroundColor: '#f6ffed',
        },
        {
            title: 'Расходы',
            amount: '125,450',
            currency: '₽',
            trend: 'down' as const,
            color: '#ff4d4f',
            backgroundColor: '#fff2f0',
        },
        {
            title: 'Баланс',
            amount: '359,780',
            currency: '₽',
            trend: 'neutral' as const,
            color: '#1890ff',
            backgroundColor: '#f0f5ff',
        },
    ];

    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [data, setData] = useState<DataType[]>(originData);
    const [editingKey, setEditingKey] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isStateOpen, setIsStateOpen] = useState(false);

    const isEditing = (record: DataType) => record.key === editingKey;

    const edit = (record: Partial<DataType> & { key: React.Key }) => {
        form.setFieldsValue({ name: '', age: '', address: '', ...record });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const city = useCity();

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number | string; }[] = (posData?.map((item) => ({ name: item.name, value: item.id })) || []).sort((a, b) => a.name.localeCompare(b.name));

    const save = async (key: React.Key) => {
        try {
            const row = (await form.validateFields()) as DataType;

            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                setData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
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
    const handleDeleteRows = () => {
        const newData = data.filter(item => !selectedRowKeys.includes(item.key));
        setData(newData);
        setSelectedRowKeys([]);
        // Cancel editing if the edited row is being deleted
        if (selectedRowKeys.includes(editingKey)) {
            setEditingKey('');
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
            title: 'name',
            dataIndex: 'name',
            width: '25%',
            editable: true,
        },
        {
            title: 'age',
            dataIndex: 'age',
            width: '15%',
            editable: true,
        },
        {
            title: 'address',
            dataIndex: 'address',
            width: '40%',
            editable: true,
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (_: any, record: DataType) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => save(record.key)} style={{ marginInlineEnd: 8 }}>
                            Save
                        </Typography.Link>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                            <a>Cancel</a>
                        </Popconfirm>
                    </span>
                ) : (
                    <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                        Edit
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
                inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    const defaultValues = {
        groupId: 0,
        posId: 0,
        date: '',
        state: '',
        amount: 0
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    type FieldType = "groupId" | "posId" | "date" | "amount" | "state";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ["groupId", "posId", "amount"];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        // setIsEditMode(false);
        reset();
        // setEditIncidentId(0);
        setIsOpenModal(false);
    };

    const onSubmit = async () => {

    }

    const stateTypeOptions = useMemo(() => [
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Archived", value: "archived" },
        { label: "In Progress", value: "in_progress" },
    ], []);

    const [searchText, setSearchText] = useState("");

    const filteredOptions = useMemo(() => {
        return stateTypeOptions.filter((opt) =>
            opt.label.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, stateTypeOptions]);

    const handleSelect = (value: string) => {
        setFormData((prev) => ({ ...prev, ["state"]: value }));
        setValue("state", value);
    };

    const handleConfirm = () => {
        setIsStateOpen(false);
    };

    return (
        <div>
            <Filter count={0}>
                <div></div>
            </Filter>
            <Modal isOpen={isStateOpen} classname="w-[500px]">
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">Add New State Type</h2>
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
                                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${formData.state === opt.value ? "text-primary02" : ""
                                    }`}
                            >
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-400">No matches found.</div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="outline" handleClick={() => setIsStateOpen(false)} title="Cancel" />
                    <Button disabled={!formData.state} handleClick={handleConfirm} title="Confirm" />
                </div>
            </Modal>
            <Modal isOpen={isOpenModal} classname="w-[400px]">
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
                            title={"Group"}
                            classname="w-full sm:w-80"
                            placeholder="Выберите объект"
                            options={[]}
                            {...register('groupId', {
                                required: 'Group ID is required',
                                validate: (value) =>
                                    (value !== 0) || "Group ID is required"
                            })}
                            value={formData.groupId}
                            onChange={(value) => { handleInputChange('groupId', value); }}
                            error={!!errors.groupId}
                            errorText={errors.groupId?.message}
                        />
                        <SearchDropdownInput
                            title={t("analysis.posId")}
                            classname="w-full sm:w-80"
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
                        <div className="flex space-x-2 items-center">
                            <Input
                                value={formData.state}
                                disabled={true}
                            />
                            <AntDButton
                                onClick={() => setIsStateOpen(true)}
                                type="primary"
                                className="h-10"
                            >
                                Open State Button
                            </AntDButton>
                        </div>
                        <Input
                            title="Expanse/Income"
                            type="number"
                            classname="w-full sm:w-44"
                            value={100}
                            disabled={true}
                        />
                        <DateInput
                            title="Date"
                            classname="w-full sm:w-40"
                            value={formData.date ? dayjs(formData.date) : null}
                            changeValue={(date) => handleInputChange("date", date ? date.format("YYYY-MM-DDTHH:mm") : "")}
                            error={!!errors.date}
                            {...register('date', { required: 'Date is required' })}
                            helperText={errors.date?.message || ''}
                        />
                        <Input
                            title="Amount"
                            type="number"
                            classname="w-full sm:w-80"
                            showIcon={true}
                            IconComponent={<div className="text-text02 text-xl">₽</div>}
                            value={formData.amount}
                            changeValue={(e) => handleInputChange('amount', e.target.value)}
                            error={!!errors.amount}
                            {...register('amount', { required: 'amount is required' })}
                            helperText={errors.amount?.message || ''}
                        />
                        <Input
                            title="User"
                            classname="w-full sm:w-80"
                            value={"User 1"}
                            disabled={true}
                        />
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <Button title={t("organizations.cancel")} type="outline" handleClick={() => { setIsOpenModal(false); resetForm(); }} />
                            <Button title={t("organizations.save")} form={true} handleClick={() => { }} />
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
                            Add Row
                        </AntDButton>
                        <Popconfirm
                            title="Are you sure you want to delete the selected rows?"
                            onConfirm={handleDeleteRows}
                            disabled={selectedRowKeys.length === 0}
                        >
                            <AntDButton
                                danger
                                icon={<DeleteOutlined />}
                                disabled={selectedRowKeys.length === 0}
                            >
                                Delete Selected ({selectedRowKeys.length})
                            </AntDButton>
                        </Popconfirm>
                        <AntDButton
                            icon={<CheckOutlined />}
                            onClick={() => { }}
                            className="bg-successFill text-white"
                        >
                            Save
                        </AntDButton>
                    </Space>
                </div>

                <Form form={form} component={false}>
                    <Table<DataType>
                        dataSource={data}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        pagination={{ onChange: cancel }}
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
                </Form>
            </div>
        </div>
    );
};

export default Articles;