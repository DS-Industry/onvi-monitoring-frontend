import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import Button from "@/components/ui/Button/Button";
import { createTechTaskShape, getTechTaskShapeItem, StatusTechTask, updateTechTask } from "@/services/api/equipment";
import useSWRMutation from "swr/mutation";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import dayjs from "dayjs";
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import DateInput from "@/components/ui/Input/DateInput";
import { useToast } from "@/components/context/useContext";
import TechTaskCard from "./TechTaskCard";

const ProgressReportItem: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const progressReportId = Number(searchParams.get("progressReportId"));
    const status = searchParams.get("status");
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

    const { data: techTaskData, isLoading: techTaskLoading } = useSWR(
        [`get-tech-task`],
        () => getTechTaskShapeItem(progressReportId),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const techTaskItems = useMemo(() => techTaskData?.items || [], [techTaskData]);

    const [taskValues, setTaskValues] = useState<Record<number, string | number | boolean | null>>({});

    const { trigger: createTechTasks, isMutating } = useSWRMutation(
        ['create-tech-task'],
        async (_, { arg }: {
            arg: {
                valueData: { itemValueId: number; value: string }[];
                files: { itemValueId: number; file: File }[];
            };
        }) => {
            return createTechTaskShape(progressReportId, arg, arg.files);
        }
    );

    useEffect(() => {
        if (techTaskItems.length > 0) {
            const initialValues = techTaskItems.reduce((acc, item) => {
                acc[item.id] = item.value ?? "";
                return acc;
            }, {} as Record<number, string | number | boolean | null>);
            setTaskValues(initialValues);
        }
    }, [techTaskItems]);


    const handleChange = (id: number, value: string | number | boolean | null) => {
        setTaskValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

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

    const [endSpecifiedDate, setEndSpecifiedDate] = useState(dayjs().toDate());

    const { trigger: updateTech, isMutating: updatingTechTask } = useSWRMutation(['update-tech-task'], async () => updateTechTask({
        techTaskId: progressReportId,
        endSpecifiedDate: endSpecifiedDate,
        status: StatusTechTask.RETURNED
    }));

    const { showToast } = useToast();

    const onUpdate = async () => {
        try {
            const result = await updateTech();
            if (result) {
                navigate(-1);
            }
        } catch (error) {
            console.error("Failed to update the tech task:", error);
            showToast(t("errors.other.failedToUpdateRecord"), "error");
        }
    };

    return (
        <>
            {
                techTaskLoading ? (
                    <TableSkeleton columnCount={5} />
                ) : (
                    <TechTaskCard
                        techTaskData={techTaskData}
                        items={techTaskItems}
                        values={taskValues}
                        uploadedFiles={uploadedFiles}
                        onChange={handleChange}
                        onFileUpload={handleUpload}
                        onImageRemove={removeImage}
                        status={status ? status : undefined}
                    />
                )}
            {status !== t("tables.FINISHED") && (<div className="flex justify-start space-x-4">
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
            {status === t("tables.FINISHED") && (
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-text02">{t("equipment.end")}</div>
                        <DateInput
                            classname="w-40"
                            value={dayjs(endSpecifiedDate)}
                            changeValue={(date) => setEndSpecifiedDate(date ? date.toDate() : dayjs().toDate())}
                        />
                    </div>
                    <Button
                        title={t("finance.returns")}
                        isLoading={updatingTechTask}
                        handleClick={onUpdate}
                    />
                </div>
            )}
        </>
    );
};

export default ProgressReportItem;
