import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.png"
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Button from "@/components/ui/Button/Button";
import { createTag, createTechTask, getPoses, getTags, getTechTaskItem, getTechTasks, updateTechTask } from "@/services/api/equipment";
import useSWR, { mutate } from "swr";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsTechTasks } from "@/utils/OverFlowTableData";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import { useButtonCreate } from "@/components/context/useContext";
import Filter from "@/components/ui/Filter/Filter";
import Icon from 'feather-icons-react';
import { useCity, usePosType } from "@/hooks/useAuthStore";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { Select, Skeleton, Tooltip } from "antd";
import MultiInput from "@/components/ui/Input/MultiInput";
import { Tabs } from 'antd';
import TiptapEditor from "@/components/ui/Input/TipTapEditor";
import { Card, Tag, Button as AntDButton, Typography, Space, Row, Col } from 'antd';
import { FolderOutlined, CheckOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import moment from "moment";

const { Text, Title } = Typography;

type TechTasks = {
    id: number;
    name: string;
    posId: number;
    type: string;
    status: string;
    period?: number;
    markdownDescription?: string;
    nextCreateDate?: Date;
    endSpecifiedDate?: Date;
    startDate: Date;
    items: {
        id: number;
        title: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
    tags: {
        id: number;
        name: string;
        code?: string;
    }[];
}

type TechTaskBody = {
    name: string;
    posId: number;
    type: string;
    period?: number;
    markdownDescription?: string;
    startDate: string;
    endSpecifiedDate?: string;
    techTaskItem: number[];
    tagIds: number[];
}

interface Item {
    id: number;
    title: string;
    description?: string;
}

const RoutineWork: React.FC = () => {
    const { TabPane } = Tabs;
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    // const [taskCount, setTaskCount] = useState(0);
    const posType = usePosType();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [searchPosId, setSearchPosId] = useState(posType);
    const [searchStatus, setSearchStatus] = useState("ACTIVE");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTechTaskId, setEditTechTaskId] = useState<number>(0);
    const city = useCity();
    const [tagIds, setTagIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [techId, setTechId] = useState(0);
    const [techStatus, setTechStatus] = useState("");
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");

    const { data, isLoading: techTasksLoading, isValidating } = useSWR([`get-tech-tasks`, searchPosId, city, searchStatus], () => getTechTasks({
        posId: searchPosId,
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: tagsData, isLoading: loadingTags, isValidating: validatingTags } = useSWR([`get-tags`], () => getTags(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: techTaskItems } = useSWR([`get-tech-task-item`], () => getTechTaskItem(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number | string; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const posesAllObj = {
        name: allCategoriesText,
        value: "*"
    };

    poses.unshift(posesAllObj);

    // const getRandomColor = () => {
    //     const letters = '0123456789ABCDEF';
    //     let color = '#';
    //     for (let i = 0; i < 6; i++) {
    //         color += letters[Math.floor(Math.random() * 16)];
    //     }
    //     return color;
    // }

    const options = tagsData ? tagsData.map((tag) => (({
        id: tag.props.id,
        name: tag.props.name,
        color: "cyan"
    }))) : [];

    const defaultValues: TechTaskBody = {
        name: '',
        posId: 0,
        type: '',
        period: 0,
        startDate: '',
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
        startDate: new Date(formData.startDate),
        endSpecifiedDate: formData.endSpecifiedDate ? new Date(formData.endSpecifiedDate) : undefined,
        techTaskItem: formData.techTaskItem,
        tagIds: tagIds
    }));

    const { trigger: updateTech, isMutating: updatingTechTask } = useSWRMutation(['update-tech-task'], async () => updateTechTask({
        techTaskId: editTechTaskId,
        name: formData.name,
        endSpecifiedDate: formData.endSpecifiedDate ? new Date(formData.endSpecifiedDate) : undefined,
        markdownDescription: formData.markdownDescription,
        period: formData.period,
        techTaskItem: formData.techTaskItem
    }));

    const { trigger: updateStatus, isMutating: updatingStatus } = useSWRMutation(
        ['update-tech-task-status'],
        async (_, { arg }: {
            arg: {
                techTaskId: number;
                name?: string;
                status?: string;
                period?: number;
                markdownDescription?: string;
                endSpecifiedDate?: Date;
                techTaskItem?: number[];
            }
        }) => {
            return updateTechTask(arg);
        }
    );

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
            const techTaskss: { id: number; title: string; description: string; }[] = techTaskToEdit.items.map((item) => ({ id: item.id, title: item.title, description: "This is the description text." }));
            setSelectedItems(techTaskss);
            setAvailableItems(availableItems.filter((item) => !techTaskItemNumber.includes(item.id)));
            setFormData({
                name: techTaskToEdit.name,
                posId: techTaskToEdit.posId,
                type: techTaskToEdit.type,
                period: techTaskToEdit.period,
                startDate: techTaskToEdit.startDate.toString().substring(0, 10),
                endSpecifiedDate: techTaskToEdit.endSpecifiedDate && techTaskToEdit.endSpecifiedDate.toString().substring(0, 10),
                techTaskItem: techTaskItemNumber,
                markdownDescription: techTaskToEdit.markdownDescription,
                tagIds: techTaskToEdit.tags.map((tag) => tag.id)
            });
        }
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

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        try {
            if (editTechTaskId) {
                const result = await updateTech();
                console.log(result);
                if (result) {
                    console.log(result);
                    mutate([`get-tech-tasks`, searchPosId, city, searchStatus]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createTech();
                if (result) {
                    console.log('API Response:', result);
                    mutate([`get-tech-tasks`, searchPosId, city, searchStatus]);
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
        ?.filter((item: { status: string }) => item.status === searchStatus)
        ?.map((item: TechTasks) => ({
            ...item,
            type: t(`tables.${item.type}`),
            posName: poses.find((pos) => pos.value === item.posId)?.name,
            status: item.status === "ACTIVE" ? t(`tables.In Progress`) : item.status === "FINISHED" ? t(`tables.Done`) : t(`tables.${item.status}`)
        }))
        .sort((a, b) => a.id - b.id) || [];

    const techTask: { title: string; id: number; description: string; }[] = useMemo(() => techTaskItems?.map((item) => ({ title: item.props.title, id: item.props.id, description: "This is the description text." })) || [], [techTaskItems]);

    const [selected, setSelected] = useState<number[]>([]);
    const [availableItems, setAvailableItems] = useState<Item[]>(techTask);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    // const areItemsInAvailableList = selected.every((id) =>
    //     availableItems.some((item) => item.id === id)
    // );

    useEffect(() => {
        if (techTask) {
            setAvailableItems(techTask); // Update state once data is fetched
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
        console.log("Selected Options:", selected);
        const selectedIds = selected.map((sel) => sel.id);
        setTagIds(selectedIds);
    };

    const toggleSelection = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleClear = () => {
        setSearchPosId(posType);
    }

    const getStatusTag = (status: string) => {
        if (status === t("tables.ACTIVE") || status === t("tables.SENT") || status === t("tables.In Progress"))
            return <Tag color="green">{status}</Tag>;
        if (status === t("tables.OVERDUE") || status === t("tables.Done") || status === t("tables.FINISHED") || status === t("tables.PAUSE"))
            return <Tag color="red">{status}</Tag>;
        if (status === t("tables.SAVED") || status === t("tables.VERIFICATE"))
            return <Tag color="orange">{status}</Tag>;
        else return <Tag color="default">{status}</Tag>;
    };

    const updateStat = async (id: number, status: string) => {
        const result = await updateStatus({
            techTaskId: id,
            status: status === t("tables.In Progress") ? "FINISHED" : "ACTIVE"
        });

        if (result) {
            mutate([`get-tech-tasks`, searchPosId, city, searchStatus]);
        }
    }

    const createTa = async () => {
        const result = await createT({
            name: searchValue
        });

        if (result) {
            mutate([`get-tags`]);
        }
    }

    return (
        <>
            <Filter count={techTasks.length} hideDateTime={true} handleClear={handleClear} hideCity={true} hideSearch={true}>
                <div>
                    <div className="text-sm text-text02">{t("equipment.carWash")}</div>
                    <Select
                        className="w-full sm:w-80"
                        options={poses.map((item) => ({ label: item.name, value: item.value }))}
                        value={searchPosId}
                        onChange={(value) => setSearchPosId(value)}
                    />
                </div>
                <div>
                    <div className="text-sm text-text02">{t("finance.status")}</div>
                    <Select
                        className="w-full sm:w-80"
                        options={[
                            { label: t("tables.In Progress"), value: "ACTIVE" },
                            { label: t("tables.OVERDUE"), value: "OVERDUE" },
                            { label: t("tables.Done"), value: "FINISHED" },
                            { label: t("tables.PAUSE"), value: "PAUSE" }
                        ]}
                        value={searchStatus}
                        onChange={(value) => setSearchStatus(value)}
                    />
                </div>
            </Filter>
            <Modal isOpen={isModalOpen}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">{t("equipment.do")}</h2>
                    <Close
                        onClick={() => { setIsModalOpen(false); }}
                        className="cursor-pointer text-text01"
                    />
                </div>
                <div className="flex flex-wrap gap-3 mt-5">
                    <Button
                        title={"Сбросить"}
                        handleClick={() => setIsModalOpen(false)}
                        type="outline"
                    />
                    <Button
                        title={"Сохранить"}
                        isLoading={updatingStatus}
                        handleClick={() => updateStat(techId, techStatus)}
                    />
                </div>
            </Modal>
            <Tabs defaultActiveKey="cards">
                <TabPane tab={t("equipment.card")} key="cards">
                    {techTasksLoading || isValidating ? (
                        <TableSkeleton columnCount={columnsTechTasks.length} />
                    ) : techTasks.length > 0 ? (
                        <div className="flex flex-wrap gap-4 justify-start md:justify-start">
                            {techTasks.map((tech) => (
                                <div
                                    key={tech.id}
                                    className="w-full sm:w-[360px] h-[186px] relative"
                                >
                                    <Card
                                        variant="outlined"
                                        style={{
                                            height: '100%',
                                        }}
                                        styles={{
                                            body: {
                                                padding: '16px',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }
                                        }}
                                    >
                                        <Row justify="space-between" align="top">
                                            <Col>
                                                <Space direction="vertical" size="small">
                                                    <Space>
                                                        <FolderOutlined style={{ color: '#1890ff' }} />
                                                        <Title
                                                            level={4}
                                                            className="cursor-pointer text-text01 hover:text-primary02 hover:underline truncate"
                                                            style={{ margin: 0, maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                            onClick={() =>
                                                                navigate("/equipment/routine/work/list/item", {
                                                                    state: { ownerId: tech.id, name: tech.name, status: tech.status },
                                                                })
                                                            }
                                                        >
                                                            {tech.name}
                                                        </Title>
                                                    </Space>
                                                    <Text type="secondary">
                                                        {poses.find((pos) => pos.value === tech.posId)?.name || ''}
                                                    </Text>
                                                    <Text
                                                        type="secondary"
                                                        style={{ display: 'block' }}
                                                    >
                                                        {t("equipment.deadline")}: {tech.endSpecifiedDate ? moment(tech.endSpecifiedDate).format('DD.MM.YYYY') : "-"}
                                                    </Text>
                                                    {tech.tags.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            {tech.tags.slice(0, 3).map((te) => (
                                                                <Tag key={te.id} color="orange">
                                                                    {te.name}
                                                                </Tag>
                                                            ))}
                                                            {tech.tags.slice(3).length > 0 && (
                                                                <Tooltip
                                                                    title={tech.tags.slice(3).map(tag => tag.name).join(', ')}
                                                                >
                                                                    <Tag color="default">+{tech.tags.slice(3).length} more</Tag>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    ) : <div className="h-5"></div>}
                                                </Space>
                                            </Col>
                                            <div
                                                className="absolute top-4 right-4"
                                            >
                                                {getStatusTag(tech.status)}
                                            </div>
                                        </Row>
                                        <Row
                                            justify="center"
                                            align="middle"
                                            style={{
                                                marginTop: '4px',
                                                borderTop: '1px solid #f0f0f0',
                                                paddingTop: '8px',
                                                height: '48px', // Ensure a fixed height for alignment
                                            }}
                                        >
                                            {/* Check Button */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '0 16px',
                                                    height: '100%',
                                                    width: '150px'
                                                }}
                                            >
                                                <AntDButton
                                                    type="text"
                                                    loading={updatingStatus}
                                                    icon={updatingStatus ? undefined : tech.status !== t("tables.ACTIVE") ? <UndoOutlined style={{ color: 'orange', fontSize: '16px' }} /> : <CheckOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                                    onClick={() => {
                                                        setIsModalOpen(true);
                                                        setTechId(tech.id);
                                                        setTechStatus(tech.status);
                                                    }}
                                                />
                                            </div>

                                            {/* Divider */}
                                            <div
                                                style={{
                                                    width: '1px',
                                                    height: '24px',
                                                    backgroundColor: '#f0f0f0',
                                                    margin: '0 8px',
                                                    alignSelf: 'center',
                                                }}
                                            />

                                            {/* Delete Button */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '0 16px',
                                                    height: '100%',
                                                    width: '150px'
                                                }}
                                            >
                                                <AntDButton
                                                    type="text"
                                                    icon={<DeleteOutlined style={{ color: '#f5222d', fontSize: '16px' }} />}
                                                />
                                            </div>
                                        </Row>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoDataUI title={t('routine.display')} description={''}>
                            <img src={SalyImage} className="mx-auto" />
                        </NoDataUI>
                    )}
                </TabPane>
                <TabPane tab={t("equipment.table")} key="table">
                    {techTasksLoading ? (
                        <TableSkeleton columnCount={columnsTechTasks.length} />
                    ) :
                        techTasks.length > 0 ?
                            <>
                                <div className="mt-8">
                                    <DynamicTable
                                        data={techTasks}
                                        columns={columnsTechTasks}
                                        isDisplayEdit={true}
                                        onEdit={handleUpdate}
                                        navigableFields={[{ key: "name", getPath: () => "/equipment/routine/work/list/item" }]}
                                    />
                                </div>
                            </>
                            :
                            <NoDataUI
                                title={t("routine.display")}
                                description={""}
                            >
                                <img src={SalyImage} className="mx-auto" />
                            </NoDataUI>
                    }
                </TabPane>
            </Tabs>
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
                        label={poses.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={poses}
                        classname="w-64"
                        {...register('posId', {
                            required: !isEditMode && 'Pos ID is required',
                            validate: (value) =>
                                (value !== 0 || isEditMode) || "Pos ID is required"
                        })}
                        value={formData.posId}
                        onChange={(value) => {
                            handleInputChange('posId', value);
                            setSearchPosId(value);
                        }}
                        error={!!errors.posId}
                        helperText={errors.posId?.message}
                    />
                    <DropdownInput
                        title={`${t("routine.type")} *`}
                        type={""}
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
                    />
                    <Input
                        title={`${t("routine.frequency")} *`}
                        type={"number"}
                        label={t("warehouse.notSel")}
                        classname="w-64"
                        // options={[
                        //     { name: t("routine.daily"), value: "Daily" },
                        //     { name: t("routine.weekly"), value: "Weekly" },
                        //     { name: t("routine.monthly"), value: "Monthly" },
                        // ]}
                        {...register('period')}
                        value={formData.period}
                        changeValue={(e) => handleInputChange('period', e.target.value)}
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
                    <div>
                        <div className="text-sm text-text02">{t("equipment.end")}</div>
                        <Input
                            type={"date"}
                            classname="w-40"
                            value={formData.endSpecifiedDate}
                            changeValue={(e) => handleInputChange('endSpecifiedDate', e.target.value)}
                            error={!!errors.endSpecifiedDate}
                            {...register('endSpecifiedDate')}
                        />
                    </div>
                    {loadingTags || validatingTags ? (
                        <Skeleton.Input style={{ width: "256px", height: "130px" }} />
                    ) : <MultiInput
                        options={options}
                        value={tagIds}
                        onChange={handleSelectionTagChange}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        handleChange={createTa}
                        isLoading={creatingTag}
                    />}
                    <Tabs defaultActiveKey="editor">
                        <TabPane tab={t("equipment.text")} key="editor">
                            <TiptapEditor
                                value={formData.markdownDescription}
                                onChange={(value) => handleInputChange("markdownDescription", value)}
                            />
                        </TabPane>
                        <TabPane tab={t("equipment.templates")} key="templates">
                            <div className="flex flex-col">
                                {/* Available Items List */}
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
                                                {/* <div className="text-sm text-gray-600">{item.description}</div> */}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Buttons in the center */}
                                <div className="flex max-w-80 justify-center items-center my-2">
                                    <button
                                        className="border border-r-0 bg-white text-black cursor-pointer"
                                        onClick={handleTransferToSelected}
                                        disabled={selected.length === 0}
                                        title={"→"}
                                    >
                                        <Icon icon="chevrons-down" />
                                    </button>
                                    <button
                                        className="border border-l-0 bg-white text-black cursor-pointer"
                                        onClick={handleTransferToAvailable}
                                        disabled={selected.length === 0}
                                        title={"→"}
                                    >
                                        <Icon icon="chevrons-up" />
                                    </button>
                                </div>

                                {/* Selected Items List */}
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
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </>
    )
}

export default RoutineWork;