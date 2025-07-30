import { useButtonCreate } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import DateInput from "@/components/ui/Input/DateInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import MultiInput from "@/components/ui/Input/MultiInput";
import TiptapEditor from "@/components/ui/Input/TipTapEditor";
import useFormHook from "@/hooks/useFormHook";
import { createTag, createTechTask, getPoses, getTags, getTechTaskItem, TechTaskBody, TechTaskManagerInfo, updateTechTask } from "@/services/api/equipment";
import { Tabs } from "antd";
import TabPane from "antd/es/tabs/TabPane";
import dayjs from "dayjs";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState, } from "react";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

interface Item {
    id: number;
    title: string;
    description?: string;
}

type TechTaskFormProps = {
    swrKey: string;
    techTasks: TechTaskManagerInfo[]
}

export type TechTaskFormRef = {
    handleUpdate: (id: number) => void;
};

const TechTaskForm = forwardRef<TechTaskFormRef, TechTaskFormProps>(({ swrKey, techTasks }, ref) => {
    const { t } = useTranslation();
    const [tagIds, setTagIds] = useState<number[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTechTaskId, setEditTechTaskId] = useState<number>(0);
    const [searchValue, setSearchValue] = useState("");
    const { buttonOn, setButtonOn } = useButtonCreate();

    const { data: poses } = useSWR([`get-pos`], () => getPoses({ placementId: '*' }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: tagsData, isLoading: loadingTags, isValidating: validatingTags } = useSWR([`get-tags`], () => getTags(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: techTaskItems } = useSWR([`get-tech-task-item`], () => getTechTaskItem(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const options = tagsData ? tagsData.map((tag) => (({
        id: tag.props.id,
        name: tag.props.name,
        color: "#A0AEC0"
    }))) : [];

    const defaultValues: TechTaskBody = {
        name: '',
        posId: 0,
        type: '',
        period: 0,
        startDate: dayjs().toDate(),
        endSpecifiedDate: undefined,
        markdownDescription: undefined,
        techTaskItem: [],
        tagIds: []
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createTech, isMutating } = useSWRMutation(['create-tech-task'], async () => createTechTask({
        name: formData.name,
        posId: formData.posId,
        type: formData.type,
        period: formData.period,
        markdownDescription: formData.markdownDescription,
        startDate: dayjs(formData.startDate).toDate(),
        endSpecifiedDate: formData.endSpecifiedDate ? dayjs(formData.endSpecifiedDate).toDate() : undefined,
        techTaskItem: formData.techTaskItem,
        tagIds: tagIds
    }));

    const { trigger: updateTech, isMutating: updatingTechTask } = useSWRMutation(['update-tech-task'], async () => updateTechTask({
        techTaskId: editTechTaskId,
        name: formData.name,
        endSpecifiedDate: formData.endSpecifiedDate ? dayjs(formData.endSpecifiedDate).toDate() : undefined,
        markdownDescription: formData.markdownDescription,
        period: formData.period,
        techTaskItem: formData.techTaskItem
    }));

    const { trigger: createT, isMutating: creatingTag } = useSWRMutation(
        ['create-tag'],
        async (_, { arg }: {
            arg: {
                name: string;
                code?: string;
            }
        }) => {
            return createTag(arg);
        }
    );

    type FieldType = "name" | "posId" | "type" | "period" | "markdownDescription" | "startDate" | "endSpecifiedDate" | "techTaskItem" | "tagIds" | `techTaskItem.${number}` | `tagIds.${number}`;

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['posId', 'period'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };


    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditTechTaskId(0);
        setButtonOn(false);
        setAvailableItems(techTask);
        setSelectedItems([]);
    };

    const onSubmit = async () => {
        try {
            if (editTechTaskId) {
                const result = await updateTech();
                if (result) {
                    mutate(swrKey);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createTech();
                if (result) {
                    mutate(swrKey);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const techTask: { title: string; id: number; description: string; }[] = useMemo(() => techTaskItems?.map((item) => ({ title: item.props.title, id: item.props.id, description: "This is the description text." })) || [], [techTaskItems]);

    const [selected, setSelected] = useState<number[]>([]);
    const [availableItems, setAvailableItems] = useState<Item[]>(techTask);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    useEffect(() => {
        if (techTask) {
            setAvailableItems(techTask);
        }
    }, [techTask]);

    const handleTransferToSelected = () => {
        let updatedSelectedItems = [...selectedItems];
        let updatedAvailableItems = [...availableItems];
        const movingItems = availableItems.filter((item) => selected.includes(item.id));
        updatedSelectedItems = [...updatedSelectedItems, ...movingItems];
        updatedAvailableItems = availableItems.filter((item) => !selected.includes(item.id));
        setAvailableItems(updatedAvailableItems);
        setSelectedItems(updatedSelectedItems);
        setSelected([]);
        const movingItemIds = updatedSelectedItems.map((item) => item.id);
        setFormData((prev) => ({ ...prev, ["techTaskItem"]: movingItemIds }));
        setValue("techTaskItem", movingItemIds);
    };


    const handleTransferToAvailable = () => {
        let updatedSelectedItems = [...selectedItems];
        let updatedAvailableItems = [...availableItems];
        const movingItems = selectedItems.filter((item) => selected.includes(item.id));
        updatedAvailableItems = [...updatedAvailableItems, ...movingItems];
        updatedSelectedItems = selectedItems.filter((item) => !selected.includes(item.id));
        setAvailableItems(updatedAvailableItems);
        setSelectedItems(updatedSelectedItems);
        setSelected([]);
        const movingItemIds = updatedSelectedItems.map((item) => item.id);
        setFormData((prev) => ({ ...prev, ["techTaskItem"]: movingItemIds }));
        setValue("techTaskItem", movingItemIds);
    };

    const handleSelectionTagChange = (selected: typeof options) => {
        const selectedIds = selected.map((sel) => sel.id);
        setFormData((prev) => ({ ...prev, tagIds: selectedIds }));
        setTagIds(selectedIds);
    };

    const toggleSelection = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const createTa = async () => {
        const result = await createT({
            name: searchValue
        });

        if (result) {
            mutate([`get-tags`]);
        }
    }

    const techTasksTypes = [
        { name: t("tables.REGULAR"), value: "REGULAR" },
        { name: t("tables.ONETIME"), value: "ONETIME" }
    ];

    const handleUpdate = (id: number) => {
        setEditTechTaskId(id);
        setIsEditMode(true);
        setButtonOn(true);
        const techTaskToEdit = techTasks.find((tech) => tech.id === id);
        if (techTaskToEdit) {
            const techTaskItemNumber: number[] = techTaskToEdit.items?.map((item) => (item.id)) || [];
            const techTaskss: { id: number; title: string; description: string; }[] = techTaskToEdit.items.map((item) => ({ id: item.id, title: item.title, description: "This is the description text." }));
            setSelectedItems(techTaskss);
            setAvailableItems(availableItems.filter((item) => !techTaskItemNumber.includes(item.id)));
            setFormData({
                name: techTaskToEdit.name,
                posId: techTaskToEdit.posId,
                type: techTasksTypes.find((item) => item.name === techTaskToEdit.type)?.value || "-",
                period: techTaskToEdit.period,
                startDate: techTaskToEdit.startDate,
                endSpecifiedDate: techTaskToEdit.endSpecifiedDate && techTaskToEdit.endSpecifiedDate,
                techTaskItem: techTaskItemNumber,
                markdownDescription: techTaskToEdit.markdownDescription,
                tagIds: techTaskToEdit.tags.map((tag) => tag.id)
            });
        }
    };


    useImperativeHandle(ref, () => ({
        handleUpdate,
    }));

    return (
        <div>
            <DrawerCreate onClose={resetForm}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("routes.routine")}</div>
                    <div className="mb-5 flex">
                        <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
                        <span className="text-errorFill">*</span>
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
                        label={poses?.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={poses?.map((item) => ({ name: item.name, value: item.id })) || []}
                        classname="w-64"
                        {...register('posId', {
                            required: !isEditMode && 'Pos ID is required',
                            validate: (value) =>
                                (value !== 0 || isEditMode) || "Pos ID is required"
                        })}
                        value={formData.posId}
                        onChange={(value) => {
                            handleInputChange('posId', value);
                        }}
                        error={!!errors.posId}
                        helperText={errors.posId?.message}
                        isDisabled={isEditMode}
                    />
                    <DropdownInput
                        title={`${t("routine.type")} *`}
                        label={t("warehouse.notSel")}
                        classname="w-64"
                        options={[
                            { name: t("tables.ONETIME"), value: "ONETIME" },
                            { name: t("tables.REGULAR"), value: "REGULAR" },
                        ]}
                        {...register('type', {
                            required: !isEditMode && 'Type is required',
                        })}
                        value={formData.type}
                        onChange={(value) => handleInputChange('type', value)}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        isDisabled={isEditMode}
                    />
                    <Input
                        title={`${t("routine.frequency")} *`}
                        type={"number"}
                        label={t("warehouse.notSel")}
                        classname="w-64"
                        {...register('period')}
                        value={formData.period}
                        changeValue={(e) => handleInputChange('period', e.target.value)}
                    />
                    <DateInput
                        title={`${t("equipment.start")} *`}
                        classname="w-40"
                        value={formData.startDate ? dayjs(formData.startDate) : null}
                        changeValue={(date) => handleInputChange('startDate', date ? date.format('YYYY-MM-DD') : "")}
                        error={!!errors.startDate}
                        {...register('startDate', { required: !isEditMode && 'Start Date is required' })}
                        helperText={errors.startDate?.message || ''}
                        disabled={isEditMode}
                    />
                    <div>
                        <div className="text-sm text-text02">{t("equipment.end")}</div>
                        <DateInput
                            classname="w-40"
                            value={formData.endSpecifiedDate ? dayjs(formData.endSpecifiedDate) : null}
                            changeValue={(date) => handleInputChange('endSpecifiedDate', date ? date.format('YYYY-MM-DD') : "")}
                            error={!!errors.endSpecifiedDate}
                            {...register('endSpecifiedDate')}
                        />
                    </div>
                    <MultiInput
                        options={options}
                        value={formData.tagIds}
                        onChange={handleSelectionTagChange}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        handleChange={createTa}
                        isLoading={creatingTag}
                        loadingOptions={loadingTags || validatingTags}
                        disabled={isEditMode}
                    />
                    <Tabs defaultActiveKey="editor">
                        <TabPane tab={t("equipment.text")} key="editor">
                            <TiptapEditor
                                value={formData.markdownDescription}
                                onChange={(value) => handleInputChange("markdownDescription", value)}
                            />
                        </TabPane>
                        <TabPane tab={t("equipment.templates")} key="templates">
                            <div className="flex flex-col">
                                <div className="border rounded w-80">
                                    <div className="flex border-b-[1px] bg-background05 text-xs">
                                        <div className="font-normal text-text01 p-2">Available Tasks</div>
                                        <div className="ml-auto mr-2 text-text01 p-2">{availableItems.length}</div>
                                    </div>
                                    <div className="border-b-[1px] h-64 overflow-y-auto w-80">
                                        {availableItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleSelection(item.id)}
                                                className={`border-b-[1px] text-text01 pl-3 p-1 cursor-pointer ${selected.includes(item.id) ? "bg-background06" : "hover:bg-background06"
                                                    }`}
                                            >
                                                <div className="font-light text-[11px]">{item.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex max-w-80 justify-center items-center my-2">
                                    <button
                                        className="border border-r-0 bg-white text-black cursor-pointer"
                                        onClick={handleTransferToSelected}
                                        disabled={selected.length === 0}
                                        title={"→"}
                                    >
                                        <ArrowDownOutlined />
                                    </button>
                                    <button
                                        className="border border-l-0 bg-white text-black cursor-pointer"
                                        onClick={handleTransferToAvailable}
                                        disabled={selected.length === 0}
                                        title={"→"}
                                    >
                                        <ArrowUpOutlined />
                                    </button>
                                </div>
                                <div className="border rounded w-80">
                                    <div className="flex border-b-[1px] bg-background05 text-xs">
                                        <div className="font-normal text-text01 p-2">Selected Tasks</div>
                                        <div className="ml-auto mr-2 text-text01 p-2">{selectedItems.length}</div>
                                    </div>
                                    <div className="border-b-[1px] h-64 w-80 overflow-y-auto">
                                        {selectedItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleSelection(item.id)}
                                                className={`border-b-[1px] text-text01 pl-3 p-1 cursor-pointer ${selected.includes(item.id) ? "bg-background06" : "hover:bg-background06"
                                                    }`}
                                            >
                                                <div className="text-[11px] font-light">{item.title}</div>
                                                <div className="text-[10px] font-light text-text01">{item.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                    <div className="flex justify-start space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                setButtonOn(!buttonOn);
                                resetForm();
                                setAvailableItems(techTask);
                                setSelectedItems([]);
                            }}
                        />
                        <Button
                            title={t("routes.create")}
                            form={true}
                            isLoading={isEditMode ? updatingTechTask : isMutating}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </div>
    );
});

export default TechTaskForm;