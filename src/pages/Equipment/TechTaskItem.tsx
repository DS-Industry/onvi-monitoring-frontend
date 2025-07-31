import TableSkeleton from "@ui/Table/TableSkeleton";
import { createTechTaskShape, getTechTaskShapeItem } from "@/services/api/equipment";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { useToast } from "@/components/context/useContext";
import TechTaskCard from "./TechTaskCard";
import Button from "@/components/ui/Button/Button";

const TechTaskItem: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const techTaskId = Number(searchParams.get("techTaskId"));
    const status = searchParams.get("status");

    const { data: techTaskData, isLoading: techTaskLoading, isValidating } = useSWR(
        [`get-tech-task`],
        () => getTechTaskShapeItem(techTaskId),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const techTaskItems = useMemo(() => techTaskData?.items || [], [techTaskData]);

    const { trigger: createTechTasks, isMutating } = useSWRMutation(
        ['create-tech-task'],
        async (_, { arg }: {
            arg: {
                valueData: { itemValueId: number; value: string }[];
                files: { itemValueId: number; file: File }[];
            };
        }) => {
            return createTechTaskShape(techTaskId, arg, arg.files);
        }
    );

    const [taskValues, setTaskValues] = useState<Record<number, string | number | boolean | null>>({});

    useEffect(() => {
        if (techTaskItems.length > 0) {
            const initialValues = techTaskItems.reduce((acc, item) => {
                acc[item.id] = item.value ?? "";
                return acc;
            }, {} as Record<number, string | null>);
            setTaskValues(initialValues);

            const fileEntries = techTaskItems.map((item) => {
                const file = item.image
                    ? `${import.meta.env.VITE_S3_CLOUD}pos/${techTaskData?.posId}/techTask/${techTaskData?.id}/${item.id}/${item.image}`
                    : null;
                return [item.id, file];
            });

            const initialFiles = Object.fromEntries(fileEntries);
            setUploadedFiles(initialFiles);
        }
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

    const handleSubmit = async () => {
        const techTaskValue = Object.entries(taskValues).map(([itemValueId, value]) => ({
            itemValueId: Number(itemValueId),
            value: String(value),
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
                <div>
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
                    {status !== t("tables.FINISHED") && (<div className="flex flex-col sm:flex-row gap-4 mt-6">
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
        </div >
    )
}

export default TechTaskItem;