import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.svg?react"
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
// import MultilineInput from "@/components/ui/Input/MultilineInput";
// import Plus from 'feather-icons-react';
import Button from "@/components/ui/Button/Button";
import { createTechTask, getPoses, getTechTaskItem, getTechTasks, updateTechTask } from "@/services/api/equipment";
import useSWR, { mutate } from "swr";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsTechTasks } from "@/utils/OverFlowTableData";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import { useButtonCreate, useFilterOpen } from "@/components/context/useContext";
import Filter from "@/components/ui/Filter/Filter";

interface TechTasks {
    id: number;
    name: string;
    posId: number;
    type: string;
    status: string;
    period: string;
    nextCreateDate?: Date;
    startDate: Date;
    items: {
        id: number;
        title: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
}

interface TechTaskBody {
    name: string;
    posId: number;
    type: string;
    period: string;
    startDate: string;
    techTaskItem: number[];
}

const RoutineWork: React.FC = () => {
    const { t } = useTranslation();
    // const [taskCount, setTaskCount] = useState(0);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { filterOpen } = useFilterOpen();
    const [searchPosId, setSearchPosId] = useState(1);
    const [searchRoutine, setSearchRoutine] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTechTaskId, setEditTechTaskId] = useState<number>(0);
    const [selectedValues, setSelectedValues] = useState<number[]>([]);
    const { data, isLoading: techTasksLoading } = useSWR([`get-tech-tasks`], () => getTechTasks(1), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: techTaskItems } = useSWR([`get-tech-task-item`], () => getTechTaskItem(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const defaultValues: TechTaskBody = {
        name: '',
        posId: 0,
        type: '',
        period: '',
        startDate: '',
        techTaskItem: []
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createTech, isMutating } = useSWRMutation(['create-tech-task'], async () => createTechTask({
        name: formData.name,
        posId: formData.posId,
        type: formData.type,
        period: formData.period,
        startDate: new Date(formData.startDate),
        techTaskItem: formData.techTaskItem
    }));

    const { trigger: updateTech } = useSWRMutation(['update-tech-task'], async () => updateTechTask({
        techTaskId: editTechTaskId,
        name: formData.name,
        type: formData.type,
        period: formData.period,
        techTaskItem: formData.techTaskItem
    }));

    type FieldType = "name" | "posId" | "type" | "period" | "startDate";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['posId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const handleDropdownChange = (value: string) => {
        const valuesArray = value
            .split(", ")
            .filter(Boolean) // Remove empty strings
            .map(Number); // Convert strings to numbers
        console.log("Values Array:", valuesArray);
        setSelectedValues(valuesArray);
        setFormData((prev) => ({ ...prev, ["techTaskItem"]: valuesArray }));
        setValue("techTaskItem", valuesArray);
    };

    const handleUpdate = (id: number) => {
        setEditTechTaskId(id);
        setIsEditMode(true);
        setButtonOn(true);
        console.log(id);
        console.log(isEditMode);
        const techTaskToEdit = techTasks.find((tech) => tech.id === id);
        console.log(techTaskToEdit);
        if (techTaskToEdit) {
            const techTaskItemNumber: number[] = techTaskToEdit.items?.map((item) => (item.id)) || [];
            setSelectedValues(techTaskItemNumber);
            setFormData({
                name: techTaskToEdit.name,
                posId: techTaskToEdit.posId,
                type: techTaskToEdit.type,
                period: techTaskToEdit.period,
                startDate: techTaskToEdit.startDate.toString().substring(0, 10),
                techTaskItem: techTaskItemNumber
            });
        }
    };

    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditTechTaskId(0);
        setButtonOn(false);
        setSelectedValues([]);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        try {
            if (editTechTaskId) {
                const result = await updateTech();
                console.log(result);
                if (result) {
                    console.log(result);
                    mutate([`get-tech-tasks`]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createTech();
                if (result) {
                    console.log('API Response:', result);
                    mutate([`get-tech-tasks`]);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const techTasks: TechTasks[] = data
        ?.filter((item: { posId: number }) => item.posId === searchPosId)
        ?.filter((item: { period: string }) => item.period.toLowerCase().includes(searchRoutine.toLowerCase()))
        ?.map((item: TechTasks) => item)
        .sort((a, b) => a.id - b.id) || [];

    const techTask: { name: string; value: number; }[] = techTaskItems?.map((item) => ({ name: item.props.title, value: item.props.id })) || [];

    return (
        <>
            <DrawerCreate>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("routes.routine")}</div>
                    <div className="mb-5 flex">
                        <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
                        <span className="text-red-600">*</span>
                        <span className="font-semibold text-sm text-text01">{t("routine.are")}</span>
                    </div>
                    <Input
                        title={`${t("routine.title")} *`}
                        label={t("routine.enter")}
                        type={""}
                        classname="w-80"
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        {...register('name', { required: !isEditMode && 'Name is required' })}
                        helperText={errors.name?.message || ''}
                    />
                    <DropdownInput
                        title={t("equipment.carWash")}
                        options={poses}
                        classname="w-64"
                        {...register('posId', {
                            required: !isEditMode && 'Pos ID is required',
                            // validate: (value) =>
                            //     value == 0 && !isEditMode && "Pos ID is required"
                        })}
                        value={formData.posId}
                        onChange={(value) => handleInputChange('posId', value)}
                        error={!!errors.posId}
                        helperText={errors.posId?.message}
                    />
                    <DropdownInput
                        title={`${t("routine.type")} *`}
                        type={""}
                        classname="w-64"
                        options={[
                            { name: t("routine.routine"), value: "Routine" },
                            { name: t("routine.regulation"), value: "Regulation" },
                        ]}
                        {...register('type', {
                            required: !isEditMode && 'Type is required',
                        })}
                        value={formData.type}
                        onChange={(value) => handleInputChange('type', value)}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                    />
                    <DropdownInput
                        title={`${t("routine.frequency")} *`}
                        type={""}
                        classname="w-64"
                        options={[
                            { name: t("routine.daily"), value: "Daily" },
                            { name: t("routine.weekly"), value: "Weekly" },
                            { name: t("routine.monthly"), value: "Monthly" },
                        ]}
                        {...register('period', {
                            required: !isEditMode && 'Period is required',
                        })}
                        value={formData.period}
                        onChange={(value) => handleInputChange('period', value)}
                        error={!!errors.period}
                        helperText={errors.period?.message}
                    />
                    <Input
                        type={"date"}
                        title={`${t("equipment.start")} *`}
                        classname="w-40"
                        value={formData.startDate}
                        changeValue={(e) => handleInputChange('startDate', e.target.value)}
                        error={!!errors.startDate}
                        {...register('startDate', { required: !isEditMode && 'Start Date is required' })}
                        helperText={errors.startDate?.message || ''}
                        disabled={isEditMode}
                    />
                    <div className="flex">
                        <DropdownInput
                            value={formData.techTaskItem}
                            options={techTask}
                            isMultiSelect={true}
                            title="Select Tech Tasks"
                            classname="w-64"
                            {...register('techTaskItem', {
                                required: !isEditMode && 'Tech Task Item is required',
                                // validate: (value) =>
                                // value[0] == 0 && !isEditMode && "Tech Task Item is required"
                            })}
                            onChange={handleDropdownChange}
                            error={!!errors.techTaskItem}
                            helperText={errors.techTaskItem?.message || ''}
                        />
                        {selectedValues.length > 0 && <div className="ml-4">
                            <h2 className="text-lg font-medium">Selected Values:</h2>
                            <ul className="list-disc ml-5">
                                {selectedValues.map((value, index) => (
                                    <li key={index}>{techTask.find((tech) => tech.value === value)?.name}</li>
                                ))}
                            </ul>
                        </div>}
                    </div>
                    {/* <div className="font-semibold text-2xl text-text01">{t("routine.checklist")}</div>
                    {taskCount > 0 && (
                        Array.from({ length: taskCount }).map((_, index) => (
                            <div key={index} className="space-y-4">
                                <Input
                                    title={`${t("routine.task")}`}
                                    label={t("routine.enterTask")}
                                    type={""}
                                    changeValue={() => { }}
                                    classname="w-80"
                                />
                                <MultilineInput
                                    title={t("equipment.comment")}
                                    classname="w-96"
                                    changeValue={() => { }}
                                />
                                <div className="font-semibold text-[#ff3b30] cursor-pointer" onClick={() => setTaskCount((taskCount) => taskCount - 1)}>{t("routine.delete")}</div>
                            </div>
                        ))
                    )}
                    <div className="flex text-primary02 cursor-pointer" onClick={() => setTaskCount((taskCount) => taskCount + 1)}>
                        <Plus icon="plus" className="h-6 w-6" />
                        <div className="font-semibold">{t("routine.add")}</div>
                    </div> */}
                    <div className="flex justify-start space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                setButtonOn(!buttonOn);
                                resetForm();
                                setSelectedValues([]);
                            }}
                        />
                        <Button
                            title={t("routes.create")}
                            form={true}
                            isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
            <>
                <Filter count={techTasks.length}>
                    <div className="flex">
                        <DropdownInput
                            title={t("equipment.carWash")}
                            value={searchPosId}
                            classname={`${filterOpen ? "mb-24" : "mb-2"}`}
                            options={poses}
                            onChange={(value) => setSearchPosId(value)}
                        />
                        <DropdownInput
                            title={`${t("routine.frequency")}`}
                            value={searchRoutine}
                            classname={`${filterOpen ? "mb-24" : "mb-2"} ml-4`}
                            options={[
                                { name: t("routine.daily"), value: "Daily" },
                                { name: t("routine.weekly"), value: "Weekly" },
                                { name: t("routine.monthly"), value: "Monthly" },
                            ]}
                            onChange={(value) => setSearchRoutine(value)}
                        />
                    </div>
                </Filter>
                {techTasksLoading ? (
                    <TableSkeleton columnCount={columnsTechTasks.length} />
                ) :
                    techTasks.length > 0 ?
                        <>
                            <div className="mt-8">
                                <OverflowTable
                                    tableData={techTasks}
                                    columns={columnsTechTasks}
                                    isDisplayEdit={true}
                                    isUpdate={true}
                                    onUpdate={handleUpdate}
                                />
                            </div>
                        </>
                        :
                        <NoDataUI
                            title={t("routine.display")}
                            description={""}
                        >
                            <SalyImage className="mx-auto" />
                        </NoDataUI>
                }
            </>
        </>
    )
}

export default RoutineWork;