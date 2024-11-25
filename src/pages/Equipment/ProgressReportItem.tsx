import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import useSWR, { mutate } from "swr";
import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import { createTechTaskShape, getTechTaskShapeItem } from "@/services/api/equipment";
import useSWRMutation from "swr/mutation";

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
}

// DynamicInput Component
const DynamicInput: React.FC<DynamicInputProps> = ({ type, value, onChange }) => {
    switch (type) {
        case "Text":
            return (
                <Input
                    type="text"
                    value={value == null ? "" : value as string}
                    changeValue={(e) => onChange(e.target.value)}
                    classname="px-2 py-1 ml-10 w-80"
                />
            );

        case "Number":
            return (
                <Input
                    type="number"
                    value={value as number}
                    changeValue={(e) => onChange(Number(e.target.value))}
                    classname="px-2 py-1 ml-10 w-80"
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
                    classname="w-80"
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

// Main Component
const ProgressReportItem: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const { data: techTaskData } = useSWR(
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

    // Initialize state when API response is loaded
    useEffect(() => {
        if (techTaskItems.length > 0) {
            setTaskValues(techTaskItems);
        }
    }, [techTaskItems]);

    // Update specific item's value
    const handleChange = (id: number, value: string | number | boolean) => {
        setTaskValues((prevValues) =>
            prevValues.map((item) =>
                item.id === id ? { ...item, value } : item
            )
        );
    };

    // Handle form submission
    const handleSubmit = async () => {
        console.log("Final Task Values:", taskValues);

        // Prepare the API payload directly from taskValues
        const techTaskValue: { itemValueId: number; value: string }[] = taskValues.map((task) => ({
            itemValueId: task.id,
            value: task.value as string, // Ensure the value is cast to the expected type
        }));

        // Log the payload for debugging
        console.log("Payload for API:", techTaskValue);

        // Make the API call with the payload
        const result = await createTechTasks({
            valueData: techTaskValue,
        });

        if (result) {
            // Revalidate the data after successful submission
            mutate([`get-tech-task`]);
        }
    };


    return (
        <>
            <div className="text-text01 font-semibold text-lg">{t("routine.checklist")}</div>
            {taskValues.map((techItem) => (
                <div key={techItem.id} className="flex items-baseline space-y-6 mb-20">
                    <input type="checkbox" />
                    <div className="ml-2 text-text01">{techItem.title}</div>
                    <DynamicInput
                        type={techItem.type}
                        value={techItem.value}
                        onChange={(value) => handleChange(techItem.id, value)}
                    />
                    <div className="ml-10">
                        <div>{t("pos.photos")}</div>
                        <div>{t("pos.maxNumber")}</div>
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
