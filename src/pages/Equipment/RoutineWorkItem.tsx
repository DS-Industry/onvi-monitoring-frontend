import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useCity } from "@/hooks/useAuthStore";
import { getPoses, getTechTaskShapeItem } from "@/services/api/equipment";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { CalendarOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import TiptapEditor from "@/components/ui/Input/TipTapEditor";
import Button from "@/components/ui/Button/Button";
import { Card, List, message, Upload } from "antd";
import Icon from "feather-icons-react";
import { TFunction } from "i18next";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";

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
    location: any;
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

const RoutineWorkItem: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const city = useCity();
    const navigate = useNavigate();
    const [openSettings, setOpenSettings] = useState<Record<string, boolean>>({});

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const { data: techTaskData, isLoading: techTaskLoading, isValidating } = useSWR(
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

    const handleChange = (id: number, value: string | number | boolean | null) => {
        setTaskValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    }

    const [imageList, setImageList] = useState<string[]>([]);

    const handleUpload = ({ file, onSuccess }: any) => {
        const url = URL.createObjectURL(file);
        setImageList((prev) => [...prev, url]);

        setTimeout(() => {
            message.success(`${file.name} uploaded successfully.`);
            onSuccess("ok");
        }, 1000);
    };

    const removeImage = (index: number) => {
        setImageList((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadProps = {
        customRequest: handleUpload,
        showUploadList: false,
        multiple: true,
        accept: 'image/*',
    };

    return (
        <div className="mt-5">
            {techTaskLoading || isValidating ? (
                <TableSkeleton columnCount={5} />
            ) : (
                <div className="space-y-6">
                    <div>
                        <div className="text-sm text-text02">{t("routine.title")}</div>
                        <div className="w-80 border border-[#1476E9]/25 rounded-md px-2 py-2">
                            {techTaskData?.name || ""}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("finance.carWash")}</div>
                        <div className="w-80 border border-[#1476E9]/25 rounded-md px-2 py-2">
                            {poses.find((pos) => pos.value === techTaskData?.posId)?.name || ""}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("routine.type")}</div>
                        <div className="w-80 border border-[#1476E9]/25 rounded-md px-2 py-2">
                            {t(`tables.${techTaskData?.type}`) || ""}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("equipment.deadline")}</div>
                        <div className="w-32 border border-[#1476E9]/25 rounded-md px-2 py-2 flex items-center justify-between">
                            <span>{moment(techTaskData?.endSpecifiedDate).format("DD.MM.YYYY") || ""}</span>
                            <CalendarOutlined style={{ color: '#000', fontSize: '16px' }} />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("equipment.resp")}</div>
                        <div className="w-80 border border-[#1476E9]/25 rounded-md px-2 py-2">
                            {"-"}
                        </div>
                    </div>
                    {techTaskData?.markdownDescription && (<div className="space-y-2">
                        <div className="font-semibold text-2xl text-text01">{t("equipment.taskInfo")}</div>
                        <TiptapEditor
                            value={techTaskData?.markdownDescription}
                            readonly={true}
                        />
                        <List
                            dataSource={Object.entries(groupedTechTaskItems)}
                            renderItem={([groupName, items]) => (
                                <List.Item className="w-full">
                                    <Card className="w-full">
                                        {/* Group Header */}
                                        <div className="flex items-center space-x-2 mb-4">
                                            <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01 flex justify-center items-center"
                                                onClick={() => toggleGroup(groupName)}>
                                                {openSettings[groupName] ? <Icon icon="chevron-up" /> : <Icon icon="chevron-down" />}
                                            </div>
                                            <div className="text-lg md:text-2xl font-semibold text-text01">{t(`chemical.${groupName}`)}</div>
                                        </div>

                                        {/* Group Items */}
                                        {openSettings[groupName] && (
                                            <List
                                                dataSource={items}
                                                renderItem={(techItem) => (
                                                    <List.Item className="w-full">
                                                        <div className="w-full">
                                                            {/* Task Content Section */}
                                                            <div className="flex flex-wrap w-full gap-4 my-4 items-start md:items-center">
                                                                {/* Left Section: Title & Input */}
                                                                <div className="flex items-center justify-center space-x-10 min-w-[250px] max-w-full">
                                                                    <div className="flex space-x-2 items-center justify-center">
                                                                        <input type="checkbox" />
                                                                        <div className="text-text01">{techItem.title}</div>
                                                                    </div>
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

                                                                {/* Upload Button */}
                                                                <div>
                                                                    <Upload {...uploadProps}>
                                                                        <div className="w-[120px] h-[120px] border border-dashed flex items-center justify-center cursor-pointer rounded-md hover:border-primary flex-col transition">
                                                                            <PlusOutlined className="text-2xl text-gray-500" />
                                                                            <div>Upload</div>
                                                                        </div>
                                                                    </Upload>
                                                                </div>
                                                            </div>
                                                            {imageList.length > 0 && (
                                                                <div className="flex flex-wrap gap-4 pt-4">
                                                                    {imageList.map((img, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="relative w-[120px] h-[120px] border rounded-md overflow-hidden group"
                                                                        >
                                                                            <img
                                                                                src={img}
                                                                                alt={`uploaded-${index}`}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                            <button
                                                                                onClick={() => removeImage(index)}
                                                                                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-80 transition"
                                                                            >
                                                                                <CloseOutlined style={{ fontSize: '12px' }} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </List.Item>
                                                )}
                                            />
                                        )}
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </div>)}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Button
                            title={t("organizations.cancel")}
                            type="outline"
                            handleClick={() => { navigate(-1); }}
                        />
                        <Button
                            title={t("routine.done")}
                            handleClick={() => { }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default RoutineWorkItem;