import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import useSWR, { mutate } from "swr";
import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import { createTechTaskShape, getTechTaskShapeItem } from "@/services/api/equipment";
import useSWRMutation from "swr/mutation";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";

// Define interfaces
interface TechTaskItem {
    id: number;
    title: string;
    type: string;
    group: string;
    code: string;
    value?: string | number | boolean;
}

interface DynamicInputProps {
    type: string;
    value?: string | number | boolean;
    onChange: (value: string | number | boolean) => void;
    location: any;
}

// DynamicInput Component
const DynamicInput: React.FC<DynamicInputProps> = ({ type, value, onChange, location }) => {
    switch (type) {
        case "Text":
            return (
                <Input
                    type="text"
                    value={value == null ? "" : value as string}
                    changeValue={(e) => onChange(e.target.value)}
                    classname="px-2 py-1 w-80"
                    disabled={location.state?.status === "FINISHED"}
                />
            );

        case "Number":
            return (
                <Input
                    type="number"
                    value={value as number}
                    changeValue={(e) => onChange(e.target.value)}
                    classname="px-2 py-1 w-80"
                    disabled={location.state?.status === "FINISHED"}
                />
            );

        case "SelectList":
            return (
                <DropdownInput
                    value={value as string}
                    options={[
                        { name: "Ниже нормы", value: "belowNormal" },
                        { name: "Норма", value: "normal" },
                        { name: "Выше нормы", value: "aboveNormal" },
                    ]}
                    onChange={(value) => onChange(value)}
                    classname="px-2 py-1 w-80"
                    isDisabled={location.status?.status === "FINISHED"}
                />
            );

        case "Checkbox":
            return (
                <input
                    type="checkbox"
                    checked={value as boolean}
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

    const { data: techTaskData, isLoading: techTaskLoading } = useSWR(
        [`get-tech-task`],
        () => getTechTaskShapeItem(location.state?.ownerId),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const techTaskItems: TechTaskItem[] = useMemo(() => techTaskData?.items || [], [techTaskData]);

    const [taskValues, setTaskValues] = useState<TechTaskItem[]>([]);

    const { trigger: createTechTasks, isMutating } = useSWRMutation(
        ['create-tech-task'],
        async (_, { arg }: { arg: { valueData: { itemValueId: number; value: string }[] } }) => {
            return createTechTaskShape(location.state?.ownerId, arg);
        }
    );

    useEffect(() => {
        if (techTaskItems.length > 0) {
            setTaskValues(techTaskItems);
        }
    }, [techTaskItems]);

    const handleChange = (id: number, value: string | number | boolean) => {
        setTaskValues((prevValues) =>
            prevValues.map((item) =>
                item.id === id ? { ...item, value } : item
            )
        );
    };

    const handleSubmit = async () => {
        console.log("Final Task Values:", taskValues);

        const techTaskValue: { itemValueId: number; value: string }[] = taskValues.map((task) => ({
            itemValueId: task.id,
            value: task.value as string,
        }));

        console.log("Payload for API:", techTaskValue);

        const result = await createTechTasks({
            valueData: techTaskValue,
        });

        if (result) {
            mutate([`get-tech-task`]);
        }
    };


    return (
        <>
            <div className="flex">
                <div className="text-text01 font-medium text-lg">{location.state?.ownerId}</div>
                <div className="text-text01 font-medium text-lg ml-2">{location.state?.name}</div>
            </div>
            <div className="text-text01 font-semibold text-lg">{t("routine.checklist")}</div>
            {
                techTaskLoading ? (<TableSkeleton columnCount={5} />)
                    :
                    taskValues.map((techItem) => (
                        <div key={techItem.id} className="flex w-full gap-4 my-10 items-center">
                            <div className="flex-1 text-text01">{techItem.title}</div>
                            <div className="flex-1">
                                <DynamicInput
                                    type={techItem.type}
                                    value={techItem.value}
                                    onChange={(value) => handleChange(techItem.id, value)}
                                    location={location}
                                />
                            </div>
                            <div className="flex-1 mb-10">
                                <div className="text-sm">{t("pos.photos")}</div>
                                <div className="text-sm">{t("pos.maxNumber")}</div>
                                <Button
                                    form={false}
                                    iconPlus={true}
                                    type="outline"
                                    title={t("pos.download")}
                                />
                            </div>
                        </div>
                    ))}
            <div className="flex justify-start space-x-4">
                <Button
                    title={t("organizations.cancel")}
                    type="outline"
                    handleClick={() => setTaskValues(techTaskItems)} // Reset to original values
                />
                <Button
                    title={t("routine.done")}
                    form={true}
                    isLoading={isMutating}
                    handleClick={handleSubmit}
                />
            </div>
        </>
    );
};

export default ProgressReportItem;
