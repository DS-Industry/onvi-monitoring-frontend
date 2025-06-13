import Filter from "@/components/ui/Filter/Filter";
import React, { useState } from "react";
import type { TableProps } from 'antd';
import { Card, Row, Col, Typography, Space, Form, Input, InputNumber, Popconfirm, Table } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, LineChartOutlined } from '@ant-design/icons';

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

const originData = Array.from({ length: 100 }).map<DataType>((_, i) => ({
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
        <td {...restProps}>
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

    const [form] = Form.useForm();
    const [data, setData] = useState<DataType[]>(originData);
    const [editingKey, setEditingKey] = useState('');

    const isEditing = (record: DataType) => record.key === editingKey;

    const edit = (record: Partial<DataType> & { key: React.Key }) => {
        form.setFieldsValue({ name: '', age: '', address: '', ...record });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

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

    return (
        <div>
            <Filter count={0}>
                <div></div>
            </Filter>

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
                <Form form={form} component={false}>
                    <Table<DataType>
                        components={{
                            body: { cell: EditableCell },
                        }}
                        bordered
                        dataSource={data}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        pagination={{ onChange: cancel }}
                    />
                </Form>
            </div>
        </div>
    );
};

export default Articles;