import React from "react";
import { Tag } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PosResponse, TechTaskShapeResponse } from "@/services/api/equipment";

interface TechTaskDetailsProps {
    techTaskData?: TechTaskShapeResponse;
    poses?: PosResponse[];
    t: (key: string) => string;
}

const TechTaskDetails: React.FC<TechTaskDetailsProps> = ({ techTaskData, poses, t }) => {
    const posName = poses?.find((pos) => pos.id === techTaskData?.posId)?.name;

    const FieldBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="bg-white px-3 py-2 border border-[#C0D0E0] rounded-md w-full md:w-[600px]">
            {children}
        </div>
    );

    return (
        <div className="mb-6">
            <div className="space-y-6">
                <div>
                    <div className="text-sm font-medium mb-1">{t("Task Name")}</div>
                    <FieldBox>{techTaskData?.name || "-"}</FieldBox>
                </div>

                <div>
                    <div className="text-sm font-medium mb-1">{t("finance.carWash")}</div>
                    <FieldBox>{posName || "-"}</FieldBox>
                </div>

                <div>
                    <div className="text-sm font-medium mb-1">{t("routine.type")}</div>
                    <FieldBox>{techTaskData?.type || "-"}</FieldBox>
                </div>

                {techTaskData?.endSpecifiedDate && (
                    <div>
                        <div className="text-sm font-medium mb-1">{t("Due Date")}</div>
                        <FieldBox>
                            <div className="flex justify-between items-center">
                                <span>{dayjs(techTaskData.endSpecifiedDate).format("DD.MM.YYYY HH:mm")}</span>
                                <CalendarOutlined />
                            </div>
                        </FieldBox>
                    </div>
                )}

                <div>
                    <div className="text-sm font-medium mb-1">{t("Responsible Person")}</div>
                    <FieldBox>{techTaskData?.executorId || "-"}</FieldBox>
                </div>

                {techTaskData && techTaskData?.tags?.length > 0 && (
                    <div>
                        <div className="text-sm font-medium mb-1">{t("Tags")}</div>
                        <div className="flex flex-wrap gap-2 bg-white px-3 py-2 border border-[#C0D0E0] rounded-md w-full md:w-[600px]">
                            {techTaskData.tags.map((tag) => (
                                <Tag color="blue" key={tag.id}>
                                    {tag.name}
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechTaskDetails;
