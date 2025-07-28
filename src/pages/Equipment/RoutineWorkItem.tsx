import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useCity } from "@/hooks/useAuthStore";
import { createTechTaskShape, getPoses, getTechTaskShapeItem } from "@/services/api/equipment";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Location, useLocation, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { CalendarOutlined, CloseOutlined, FileImageOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import TiptapEditor from "@/components/ui/Input/TipTapEditor";
import Button from "@/components/ui/Button/Button";
import { Card, Checkbox, List, Tag, Tooltip, Upload } from "antd";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useSWRMutation from "swr/mutation";
import { TFunction } from "i18next";
import dayjs from "dayjs";
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { useToast } from "@/components/context/useContext";

interface TechTaskItem {
    id: number;
    title: string;
    type: string;
    group: string;
    code: string;
    value?: string | number | boolean | null;
    image?: string | null;
}

interface DynamicInputProps {
    type: string;
    value?: string | number | boolean | null;
    onChange: (value: string | number | boolean | null) => void;
    location: Location;
    t: TFunction;
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
                    value={value}
                    changeValue={(e) => onChange(e.target.value || "")}
                    classname="w-80"
                    disabled={location.state?.status === t("tables.FINISHED")}
                />
            );

        case "Number":
            return (
                <Input
                    type="number"
                    value={value}
                    changeValue={(e) => {
                        onChange(e.target.value);
                    }}
                    classname="w-80"
                    disabled={location.state?.status === t("tables.FINISHED")}
                />
            );

        case "SelectList":
            return (
                <DropdownInput
                    value={value}
                    options={selectOptions}
                    onChange={(selectedValue) => onChange(selectedValue)}
                    classname="w-80"
                    isDisabled={location.state?.status === t("tables.FINISHED")}
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
    const { showToast } = useToast();

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

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

    const { trigger: createTechTasks, isMutating } = useSWRMutation(
        ['create-tech-task'],
        async (_, { arg }: {
            arg: {
                valueData: { itemValueId: number; value: string }[];
                files: { itemValueId: number; file: File }[];
            };
        }) => {
            return createTechTaskShape(location.state?.ownerId, arg, arg.files);
        }
    );

    const [taskValues, setTaskValues] = useState<Record<number, string | number | boolean | null>>({});

    useEffect(() => {
        const processFiles = async () => {
            if (techTaskItems.length > 0) {
                const initialValues = techTaskItems.reduce((acc, item) => {
                    acc[item.id] = item.value ?? "";
                    return acc;
                }, {} as Record<number, string | number | boolean | null>);
                setTaskValues(initialValues);

                const fileEntries = await Promise.all(
                    techTaskItems.map(async (item) => {
                        if (item.image) {
                            const file = "https://storage.yandexcloud.net/onvi-business/image/pos/" + techTaskData?.posId + "/techTask/" + techTaskData?.id + `/${item.id}/${item.image}`;
                            return [item.id, file];
                        } else {
                            return [item.id, null];
                        }
                    })
                );

                const initialFiles = Object.fromEntries(fileEntries);
                setUploadedFiles(initialFiles);
            }
        };

        processFiles();
    }, [techTaskItems, techTaskData]);

    const handleChange = (id: number, value: string | number | boolean | null) => {
        setTaskValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    }

    const [uploadedFiles, setUploadedFiles] = useState<Record<number, File | string | null>>({});

    const handleUpload = (itemId: number) => async (options: RcCustomRequestOptions) => {
        const { file, onSuccess, onError } = options;

        try {
            if (file instanceof File) {
                setUploadedFiles(prev => ({
                    ...prev,
                    [itemId]: file,
                }));
                onSuccess?.("ok");
            } else {
                throw new Error("Invalid file type");
            }
        } catch (err) {
            showToast(t("errors.other.invalidFileType"), "error");
            onError?.(err as Error);
        }
    };

    const removeImage = (itemValueId: number) => {
        setUploadedFiles((prev) => ({
            ...prev,
            [itemValueId]: null,
        }));
    };

    // const uploadProps = {
    //     customRequest: handleUpload,
    //     showUploadList: false,
    //     multiple: true,
    //     accept: 'image/*',
    // };

    const handleSubmit = async () => {
        const techTaskValue = Object.entries(taskValues).map(([itemValueId, value]) => ({
            itemValueId: Number(itemValueId),
            value: value as string,
        }));

        const result = await createTechTasks({
            valueData: techTaskValue,
            files: Object.entries(uploadedFiles)
                .filter(([, file]) => file instanceof File)
                .map(([itemValueId, file]) => ({
                    itemValueId: Number(itemValueId),
                    file: file as File,
                })),
        });

        if (result) {
            mutate([`get-tech-task`]);
            navigate(-1);
        }
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
                            <span>{dayjs(techTaskData?.endSpecifiedDate).format("DD.MM.YYYY") || ""}</span>
                            <CalendarOutlined style={{ color: '#000', fontSize: '16px' }} />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("equipment.resp")}</div>
                        <div className="w-80 border border-[#1476E9]/25 rounded-md px-2 py-2">
                            {"-"}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-text02">{t("marketing.tags")}</div>
                        {techTaskData && techTaskData.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2 items-center">
                                {techTaskData.tags.slice(0, 3).map((te) => (
                                    <Tag key={te.id} color="orange">
                                        {te.name}
                                    </Tag>
                                ))}
                                {techTaskData.tags.slice(3).length > 0 && (
                                    <Tooltip
                                        title={techTaskData.tags.slice(3).map(tag => tag.name).join(', ')}
                                    >
                                        <Tag color="default">+{techTaskData.tags.slice(3).length} more</Tag>
                                    </Tooltip>
                                )}
                            </div>
                        ) : <div className="h-5">-</div>}
                    </div>
                    <div className="space-y-2">
                        <div className="font-semibold text-2xl text-text01">{t("equipment.taskInfo")}</div>
                        {techTaskData?.items.length === 0 && (<TiptapEditor
                            value={techTaskData?.markdownDescription}
                        />)}
                        {((techTaskData && techTaskData?.items.length > 0)) && (
                            <List
                                dataSource={Object.entries(groupedTechTaskItems)}
                                renderItem={([groupName, items]) => (
                                    <List.Item className="w-full border-none p-0">
                                        <Card className="w-full border-none shadow-none">
                                            <div className="flex items-center space-x-2 mb-4 cursor-pointer" onClick={() => toggleGroup(groupName)}>
                                                <div className="text-lg font-semibold text-text01">
                                                    {t(`chemical.${groupName}`)}
                                                </div>
                                                <div
                                                    className="cursor-pointer w-6 h-6 text-primary02_Hover flex justify-center items-center"
                                                >
                                                    {openSettings[groupName] ? <UpOutlined /> : <DownOutlined />}
                                                </div>
                                            </div>

                                            {/* Group Items */}
                                            {openSettings[groupName] && (
                                                <List
                                                    dataSource={items}
                                                    renderItem={(techItem) => (
                                                        <List.Item className="w-full border-none">
                                                            <div className="w-full">
                                                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between w-full">
                                                                    <div className="flex flex-col md:flex-row md:space-x-40 gap-2 min-w-[250px] max-w-full">
                                                                        <div className="flex items-center gap-2 w-64">
                                                                            <Checkbox />
                                                                            <div className="text-text01 break-words">{techItem.title}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm text-text02">{t("equipment.comment")}</div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Upload
                                                                                    customRequest={handleUpload(techItem.id)}
                                                                                    showUploadList={false}
                                                                                    multiple={false}
                                                                                    accept="image/*"
                                                                                    disabled={location.state.status === t("tables.FINISHED")}
                                                                                >
                                                                                    <button type="button" className="flex items-center justify-center" title="Upload">
                                                                                        <FileImageOutlined
                                                                                            className="text-primary02"
                                                                                            style={{ fontSize: "20px", marginTop: "4px" }}
                                                                                        />
                                                                                    </button>
                                                                                </Upload>
                                                                                {location.state.status === t("tables.FINISHED") ? (
                                                                                    <div>
                                                                                        {techItem.type === "SelectList"
                                                                                            ? selectOptions.find((sel) => sel.value === taskValues[techItem.id])?.name
                                                                                            : taskValues[techItem.id]}
                                                                                    </div>
                                                                                ) : (
                                                                                    <DynamicInput
                                                                                        type={techItem.type}
                                                                                        value={taskValues[techItem.id]}
                                                                                        onChange={(value) => handleChange(techItem.id, value)}
                                                                                        location={location}
                                                                                        t={t}
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {uploadedFiles[techItem.id] && (
                                                                    <div className="flex flex-wrap gap-4 pt-4">
                                                                        <div className="relative w-[100px] h-[100px] border rounded-md overflow-hidden group">
                                                                            <img
                                                                                src={
                                                                                    uploadedFiles[techItem.id] instanceof File
                                                                                        ? URL.createObjectURL(uploadedFiles[techItem.id] as File)
                                                                                        : uploadedFiles[techItem.id] as string
                                                                                }
                                                                                alt="uploaded"
                                                                                className="w-full h-full object-cover"
                                                                                loading="lazy"
                                                                            />
                                                                            <button
                                                                                onClick={() => removeImage(techItem.id)}
                                                                                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-80 transition"
                                                                            >
                                                                                <CloseOutlined style={{ fontSize: '12px' }} />
                                                                            </button>
                                                                        </div>
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
                            />)}
                    </div>
                    {location.state.status !== t("tables.FINISHED") && (<div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Button
                            title={t("organizations.cancel")}
                            type="outline"
                            handleClick={() => { navigate(-1); }}
                        />
                        <Button
                            title={t("routine.done")}
                            isLoading={isMutating}
                            handleClick={handleSubmit}
                        />
                    </div>)}
                </div>
            )}
        </div>
    )
}

export default RoutineWorkItem;