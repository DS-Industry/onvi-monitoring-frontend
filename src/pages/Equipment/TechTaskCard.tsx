import React, { useState } from "react";
import { CloseOutlined, UpOutlined, DownOutlined, PictureOutlined } from "@ant-design/icons";
import { Button, Card, Divider, List, Upload } from "antd";
import { useTranslation } from "react-i18next";
import { TechTaskShapeResponse, TechTasksItem } from "@/services/api/equipment";
import TechTaskDetails from "./TechTaskDetails";
import { Input, InputNumber, Select, Checkbox } from "antd";

const selectOptions = [
    { name: "Ниже нормы", value: "belowNormal" },
    { name: "Норма", value: "normal" },
    { name: "Выше нормы", value: "aboveNormal" },
];

type Props = {
    techTaskData?: TechTaskShapeResponse;
    items: TechTasksItem[];
    values: Record<number, string | number | boolean | null>;
    uploadedFiles: Record<number, File | string | null>;
    onChange: (id: number, value: string | number | boolean | null) => void;
    onFileUpload: (itemId: number) => (options: any) => void;
    onImageRemove: (id: number) => void;
    status?: string;
};

type DynamicInputProps = {
  type: string;
  value: string | number | boolean | null;
  onChange: (val: string | number | boolean | null) => void;
  disabled: boolean;
};

const DynamicInput: React.FC<DynamicInputProps> = ({ type, value, onChange, disabled }) => {
  switch (type) {
    case "Text":
      return (
        <Input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full border-[#C0D0E0] h-10 flex items-center"
        />
      );

    case "Number":
      return (
        <InputNumber
          value={value as number | null}
          onChange={(val) => onChange(val ?? null)}
          disabled={disabled}
          className="w-full border-[#C0D0E0] h-10 flex items-center"
        />
      );

    case "SelectList":
      return (
        <Select
          value={value as string}
          options={selectOptions}
          onChange={(val) => onChange(val)}
          disabled={disabled}
          className="w-full border-[#C0D0E0] h-10 flex items-center"
        />
      );

    case "Checkbox":
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
      );

    default:
      return <span>-</span>;
  }
};

const TechTaskCard: React.FC<Props> = ({
    techTaskData,
    items,
    values,
    uploadedFiles,
    onChange,
    onFileUpload,
    onImageRemove,
    status = "",
}) => {
    const { t } = useTranslation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const grouped = items.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
    }, {} as Record<string, TechTasksItem[]>);

    const toggleGroup = (group: string) => {
        setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    return (
        <div>
            <Divider className="bg-[#c0d0e0]" />
            <TechTaskDetails techTaskData={techTaskData} />
            <List
                dataSource={Object.entries(grouped)}
                renderItem={([groupName, groupItems]) => (
                    <List.Item className="w-full md:w-[600px]">
                        <Card className="w-full md:w-[600px] border-[#C0D0E0]">
                            <div className="flex items-center justify-between space-x-2 mb-4 cursor-pointer" onClick={() => toggleGroup(groupName)}>
                                <div className="text-lg font-semibold text-text01">{t(`chemical.${groupName}`)}</div>
                                <div className="cursor-pointer w-6 h-6 text-primary02_Hover flex justify-center items-center">
                                    {openGroups[groupName] ? <UpOutlined /> : <DownOutlined />}
                                </div>
                            </div>
                            {openGroups[groupName] && (
                                <List
                                    dataSource={groupItems}
                                    renderItem={(item) => (
                                        <List.Item className="w-full border-none">
                                            <div className="w-full flex flex-col">
                                                <div className="flex flex-col w-full space-y-2">
                                                    <div className="flex items-center gap-2 w-64">
                                                        <div className="text-text01 font-semibold">{item.title}</div>
                                                    </div>
                                                    <DynamicInput
                                                        type={item.type}
                                                        value={values[item.id]}
                                                        onChange={(val) => onChange(item.id, val)}
                                                        disabled={status === t("tables.FINISHED")}
                                                    />
                                                    <Upload
                                                        customRequest={onFileUpload(item.id)}
                                                        showUploadList={false}
                                                        multiple={false}
                                                        accept="image/*"
                                                        disabled={status === t("tables.FINISHED")}
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={<PictureOutlined className="text-xl" />}
                                                            className="min-w-full md:w-[550px] h-14 border-2 border-dashed border-[#C0D0E0] rounded-xl flex items-center justify-start gap-2 text-sm font-medium"
                                                        >
                                                            {t("routine.attachImage")}
                                                        </Button>
                                                    </Upload>
                                                </div>
                                                {uploadedFiles[item.id] && (
                                                    <div className="flex flex-wrap gap-4 pt-4">
                                                        <div className="relative w-[100px] h-[100px] border rounded-md overflow-hidden group">
                                                            <img
                                                                src={
                                                                    uploadedFiles[item.id] instanceof File
                                                                        ? URL.createObjectURL(uploadedFiles[item.id] as File)
                                                                        : (uploadedFiles[item.id] as string)
                                                                }
                                                                alt="uploaded"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <button
                                                                onClick={() => onImageRemove(item.id)}
                                                                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                                                            >
                                                                <CloseOutlined style={{ fontSize: "12px" }} />
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
            />
        </div>
    );
};

export default TechTaskCard;
