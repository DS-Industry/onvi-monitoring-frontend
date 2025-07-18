import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Location, useLocation, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import { createTechTaskShape, getTechTaskShapeItem } from "@/services/api/equipment";
import useSWRMutation from "swr/mutation";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { TFunction } from "i18next";
import { Card, List, Descriptions, Upload, message } from "antd";
import type { DescriptionsProps } from 'antd';
import { PlusOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

interface TechTaskItem {
    id: number;
    title: string;
    type: string;
    group: string;
    code: string;
    value?: string | number | boolean | null;
}

interface DynamicInputProps {
    type: string;
    value?: string | number | boolean | null;
    onChange: (value: string | number | boolean | null) => void;
    location: Location;
    t: TFunction<"translation", undefined>;
}

const selectOptions = [
    { name: "Ниже нормы", value: "belowNormal" },
    { name: "Норма", value: "normal" },
    { name: "Выше нормы", value: "aboveNormal" },
];

const DynamicInput: React.FC<DynamicInputProps> = ({ type, value, onChange, location, t }) => {
    switch (type) {
        case "Text":
            return (
                <Input
                    type="text"
                    title={t("chemical.enter")}
                    value={value}
                    changeValue={(e) => onChange(e.target.value || "")}
                    classname="w-80"
                    disabled={location.state?.status === "FINISHED"}
                />
            );

        case "Number":
            return (
                <Input
                    type="number"
                    title={t("chemical.enter")}
                    value={value}
                    changeValue={(e) => {
                        const newValue = e.target.value ? e.target.value : 0;
                        onChange(newValue);
                    }}
                    classname="w-80"
                    disabled={location.state?.status === "FINISHED"}
                />
            );

        case "SelectList":
            return (
                <DropdownInput
                    title={t("chemical.select")}
                    value={value}
                    options={selectOptions}
                    onChange={(selectedValue) => onChange(selectedValue)}
                    classname="w-80"
                    isDisabled={location.state?.status === "FINISHED"}
                />
            );

        case "Checkbox":
            return (
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-5 h-5"
                />
            );

        default:
            return <div>Unsupported type</div>;
    }
};

const ProgressReportItem: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [openSettings, setOpenSettings] = useState<Record<string, boolean>>({});

    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'Name',
            children: location.state.name,
        },
        {
            key: '2',
            label: 'Type',
            children: location.state.type,
        },
        {
            key: '3',
            label: 'End Work Date',
            children: dayjs(location.state.endDate).format("DD.MM.YYYY"),
        }
    ];

    const handleUpload = ({ file, onSuccess }: RcCustomRequestOptions) => {
        const fileName = typeof file === "string"
            ? file
            : "name" in file
                ? file.name
                : "Unnamed File";

        setTimeout(() => {
            message.success(`${fileName} uploaded successfully.`);
            onSuccess?.("ok"); 
        }, 1000);
    };


    const uploadProps = {
        customRequest: handleUpload,
        showUploadList: false,
    };

    const { data: techTaskData, isLoading: techTaskLoading } = useSWR(
        [`get-tech-task`],
        () => getTechTaskShapeItem(location.state?.ownerId),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const techTaskItems: TechTaskItem[] = useMemo(() => techTaskData?.items || [], [techTaskData]);

    useEffect(() => {
        const initialSettings = techTaskItems.reduce((acc, item) => {
            acc[item.group] = false; // Default all groups to closed
            return acc;
        }, {} as Record<string, boolean>);
        setOpenSettings(initialSettings);
    }, [techTaskItems]);

    const toggleGroup = (groupName: string) => {
        setOpenSettings((prev) => ({
            ...prev,
            [groupName]: !prev[groupName],
        }));
    };

    const groupedTechTaskItems = useMemo(() => {
        return techTaskItems.reduce((acc, item) => {
            if (!acc[item.group]) {
                acc[item.group] = [];
            }
            acc[item.group].push(item);
            acc[item.group].sort((a, b) => a.id - b.id);
            return acc;
        }, {} as Record<string, TechTaskItem[]>);
    }, [techTaskItems]);

    const [taskValues, setTaskValues] = useState<Record<number, string | number | boolean | null>>({});

    const { trigger: createTechTasks, isMutating } = useSWRMutation(
        ['create-tech-task'],
        async (_, { arg }: { arg: { valueData: { itemValueId: number; value: string }[] } }) => {
            return createTechTaskShape(location.state?.ownerId, arg, []);
        }
    );

    useEffect(() => {
        if (techTaskItems.length > 0) {
            const initialValues = techTaskItems.reduce((acc, item) => {
                acc[item.id] = item.value ?? ""; // Default to an empty string
                return acc;
            }, {} as Record<number, string | number | boolean | null>);
            setTaskValues(initialValues);
        }
    }, [techTaskItems]);


    const handleChange = (id: number, value: string | number | boolean | null) => {
        setTaskValues((prev) => ({
            ...prev,
            [id]: value, // Update only the specific field
        }));
    };

    const handleSubmit = async () => {
        const techTaskValue = Object.entries(taskValues).map(([itemValueId, value]) => ({
            itemValueId: Number(itemValueId),
            value: value as string,
        }));

        const result = await createTechTasks({
            valueData: techTaskValue,
        });

        if (result) {
            mutate([`get-tech-task`]);
            navigate(-1);
        }
    };

    return (
        <>
            <Descriptions items={items} />
            {
                techTaskLoading ? (
                    <TableSkeleton columnCount={5} />
                ) : (
                    <List
                        dataSource={Object.entries(groupedTechTaskItems)}
                        renderItem={([groupName, items]) => (
                            <List.Item className="w-full">
                                <Card className="w-full">
                                    {/* Group Header */}
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01 flex justify-center items-center"
                                            onClick={() => toggleGroup(groupName)}>
                                            {openSettings[groupName] ? <UpOutlined /> : <DownOutlined />}
                                        </div>
                                        <div className="text-lg md:text-2xl font-semibold text-text01">{t(`chemical.${groupName}`)}</div>
                                    </div>

                                    {/* Group Items */}
                                    {openSettings[groupName] && (
                                        <List
                                            dataSource={items}
                                            renderItem={(techItem) => (
                                                <List.Item className="w-full">
                                                    <div className="flex flex-wrap w-full gap-4 my-4 items-start md:items-center">
                                                        {/* Left Section: Title & Input */}
                                                        <div className="flex-1 min-w-[250px] max-w-full">
                                                            <div className="text-text01">{techItem.title}</div>
                                                            <div className="text-sm text-text02 max-w-sm">
                                                                Task description is simply dummy text of the printing and typesetting industry.
                                                            </div>
                                                            {location.state.status === "FINISHED" ?
                                                                <div>{techItem.type === "SelectList" ? selectOptions.find((sel) => sel.value === taskValues[techItem.id])?.name : taskValues[techItem.id]}</div>
                                                                : <DynamicInput
                                                                    type={techItem.type}
                                                                    value={taskValues[techItem.id]}
                                                                    onChange={(value) => handleChange(techItem.id, value)}
                                                                    location={location}
                                                                    t={t}
                                                                />}
                                                        </div>

                                                        {/* Right Section: Button & Photos */}
                                                        <div className="flex-1 min-w-[250px] max-w-full mt-4 md:mt-10">
                                                            <Upload {...uploadProps} accept="image/*">
                                                                <div className="w-[120px] h-[120px] border border-dashed flex items-center justify-center cursor-pointer rounded-md hover:border-primary flex-col transition">
                                                                    <PlusOutlined className="text-2xl text-gray-500" />
                                                                    <div>Upload</div>
                                                                </div>
                                                            </Upload>
                                                        </div>
                                                    </div>
                                                </List.Item>
                                            )}
                                        />
                                    )}
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            {location.state.status !== "FINISHED" && (<div className="flex justify-start space-x-4">
                <Button
                    title={t("organizations.cancel")}
                    type="outline"
                    handleClick={() => setTaskValues({})}
                />
                <Button
                    title={t("routine.done")}
                    form={true}
                    isLoading={isMutating}
                    handleClick={handleSubmit}
                />
            </div>)}
        </>
    );
};

export default ProgressReportItem;
