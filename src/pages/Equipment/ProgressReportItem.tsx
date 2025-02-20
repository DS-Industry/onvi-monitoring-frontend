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
import { TFunction } from "i18next";
import Icon from 'feather-icons-react';

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
    t: TFunction<"translation", undefined>;
}

// DynamicInput Component
const DynamicInput: React.FC<DynamicInputProps> = ({ type, value, onChange, location, t }) => {
    switch (type) {
        case "Text":
            return (
                <Input
                    type="text"
                    title={t("chemical.enter")}
                    value={value == null ? "" : value as string}
                    changeValue={(e) => onChange(e.target.value)}
                    classname="w-80"
                    disabled={location.state?.status === "FINISHED"}
                />
            );

        case "Number":
            return (
                <Input
                    type="number"
                    title={t("chemical.enter")}
                    value={value as number}
                    changeValue={(e) => onChange(e.target.value)}
                    classname="w-80"
                    disabled={location.state?.status === "FINISHED"}
                />
            );

        case "SelectList":
            return (
                <DropdownInput
                    title={t("chemical.select")}
                    value={value as string}
                    options={[
                        { name: "Ниже нормы", value: "belowNormal" },
                        { name: "Норма", value: "normal" },
                        { name: "Выше нормы", value: "aboveNormal" },
                    ]}
                    onChange={(value) => onChange(value)}
                    classname="w-80"
                    isDisabled={location.state?.status === "FINISHED"}
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
    const [openSettings, setOpenSettings] = useState<Record<string, boolean>>({});

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

        const techTaskValue: { itemValueId: number; value: string }[] = taskValues.map((task) => ({
            itemValueId: task.id,
            value: task.value as string,
        }));

        const result = await createTechTasks({
            valueData: techTaskValue,
        });

        if (result) {
            mutate([`get-tech-task`]);
        }
    };


    return (
        <>
            <div className="text-text01 font-semibold text-lg">{t("routine.checklist")}</div>
            {
                techTaskLoading ? (<TableSkeleton columnCount={5} />)
                    :
                    <div>
                        {Object.entries(groupedTechTaskItems).map(([groupName, items]) => (
                            <div key={groupName} className="mb-6">
                                <div className="flex items-center space-x-2">
                                    <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01" onClick={() => toggleGroup(groupName)}>
                                        {openSettings[groupName] ? <Icon icon="chevron-up" /> : <Icon icon="chevron-down" />}
                                    </div>
                                    <div className="text-2xl font-semibold text-text01">{t(`chemical.${groupName}`)}</div>
                                </div>
                                <div className="ml-8">
                                    {openSettings[groupName] && items.map((techItem) => (
                                        <div key={techItem.id} className="flex w-full gap-4 my-4 items-center">
                                            <div className="flex-1">
                                                <div className="text-text01">{techItem.title}</div>
                                                <div className="text-sm text-text02 w-96">Task description s simply dummy text of the printing and typesetting industry. Lorem Ipsum has been.</div>
                                                <DynamicInput
                                                    type={techItem.type}
                                                    value={techItem.value}
                                                    onChange={(value) => handleChange(techItem.id, value)}
                                                    location={location}
                                                    t={t}
                                                />
                                            </div>
                                            <div className="flex-1 mt-10">
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
                                </div>
                            </div>
                        ))}
                    </div>
            }
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
