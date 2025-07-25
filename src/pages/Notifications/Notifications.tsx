import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Menu, Dropdown, ColorPicker, MenuProps, Button as AntdButton } from "antd";
import OnviSmall from "@/assets/onvi_small.png";
import { Input as SearchInp } from "antd";
import { ArrowLeftOutlined, CheckOutlined, PlusOutlined, StarFilled, TagFilled } from "@ant-design/icons";
import NoToken from "@/assets/NoToken.png";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import Input from "@/components/ui/Input/Input";
import {
    Layout,
    List,
    Avatar,
    Tag,
    Empty,
    Card,
    Typography,
} from "antd";

import {
    MailOutlined,
    StarOutlined,
    DeleteOutlined,
    MoreOutlined,
    DownOutlined,
} from "@ant-design/icons";
import PosEmpty from "@/assets/EmptyPos.png";
import useSWR, { mutate } from "swr";
import { createTag, deleteTag, getNotifications, getTags, updateNotifications, updateTag } from "@/services/api/notifications";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import dayjs from "dayjs";
import 'dayjs/locale/ru';
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button/Button";
import { useSnackbar } from "@/components/context/useContext";

dayjs.locale('ru');

const { Sider, Content } = Layout;
const { Text, Title, Paragraph } = Typography;

const { Search } = SearchInp;

enum UserNotificationType {
    DEFAULT = "DEFAULT",
    FAVORITE = "FAVORITE",
    DELETED = "DELETED",
}

enum ReadStatus {
    READ = "READ",
    NOT_READ = "NOT_READ",
}


type UpdateNotifRequest = {
    userNotificationId: number;
    readStatus?: ReadStatus;
    type?: UserNotificationType;
    tagIds?: number[];
}

type UserNotificationResponse = {
    id: number;
    notificationId: number;
    heading: string;
    body: string;
    authorId?: number;
    sendAt: Date;
    openingAt?: Date;
    type?: UserNotificationType;
    tags: {
        id: number;
        name: string;
        color: string;
    }[];
}

type GetUserNotifParams = {
    type?: UserNotificationType;
    tagId?: number;
    readStatus?: ReadStatus;
    page?: number;
    size?: number;
}

const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [tagId, setTagId] = useState<number>(0);
    const [notifId, setNotifId] = useState<number>(0);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<UserNotificationResponse | null>(null);
    const [filterParams, setFilterParams] = useState<GetUserNotifParams>({});
    const [, setSelectedFilter] = useState<string>('all');
    const { showSnackbar } = useSnackbar();

    const { data: notificationsData, isLoading: notificationsLoading } = useSWR([`get-notifications`, filterParams], () => getNotifications(filterParams), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: tagsData, isLoading: loadingTags } = useSWR([`get-tags`], () => getTags(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const tags = tagsData ? tagsData : [];

    const toggleTagSelection = (tagId: number) => {
        setSelectedTagIds(prev => {
            const isCurrentlySelected = prev.includes(tagId);
            if (isCurrentlySelected) {
                return prev.filter(id => id !== tagId);
            } else {
                return [...prev, tagId];
            }
        });
    };

    const initializeSelectedTags = () => {
        if (selectedNotification?.tags) {
            const existingTagIds = selectedNotification.tags.map(tag => tag.id);
            setSelectedTagIds(existingTagIds);
        }
    };

    useEffect(() => {
        if (selectedNotification) {
            initializeSelectedTags();
        }
    }, [selectedNotification]);

    const notifications = [
        {
            sender: "Onvi_бизнес",
            title: "Модерация",
            message: "Команда Onvi_бизнес приветствует вас!",
            avatar: OnviSmall,
            imageCount: 1,
            date: "10 Апреля, 2024",
        },
        {
            sender: "Support Team",
            title: "Новая политика",
            message: "Мы обновили условия использования.",
            avatar: OnviSmall,
            imageCount: 5,
            date: "08 Апреля, 2024",
        },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const predefinedColors = ["#EF4444", "#F97316", "#22C55E", "#3B82F6", "#8B5CF6", "#6B7280"];
    const [isCustomColorMode, setIsCustomColorMode] = useState(false);

    const handleMenuClick = ({ key }: { key: string }) => {
        let newParams: GetUserNotifParams = {};
        let filterLabel = '';

        switch (key) {
            case '1': // All notifications
                newParams = {};
                filterLabel = 'all';
                break;
            case '2': // Read notifications
                newParams = { readStatus: ReadStatus.READ };
                filterLabel = 'read';
                break;
            case '3': // Unread notifications
                newParams = { readStatus: ReadStatus.NOT_READ };
                filterLabel = 'unread';
                break;
            case '4': // Favorite notifications (new option)
                newParams = { type: UserNotificationType.FAVORITE };
                filterLabel = 'favorite';
                break;
            case '5': // Default notifications (new option)
                newParams = { type: UserNotificationType.DEFAULT };
                filterLabel = 'default';
                break;
            case '6': // Deleted notifications (new option)
                newParams = { type: UserNotificationType.DELETED };
                filterLabel = 'deleted';
                break;
            default:
                newParams = {};
                filterLabel = 'all';
        }

        setFilterParams(newParams);
        setSelectedFilter(filterLabel);
    };

    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="1">
                <div>
                    <span>{t("analysis.all")}</span>
                </div>
            </Menu.Item>
            <Menu.Item key="2">
                <div>
                    <span>{t("notifications.read")}</span>
                </div>
            </Menu.Item>
            <Menu.Item key="3">
                <div>
                    <span>{t("notifications.non")}</span>
                </div>
            </Menu.Item>
            <Menu.Item key="4">
                <div>
                    <span>{t("notifications.fav")}</span>
                </div>
            </Menu.Item>
            <Menu.Item key="5">
                <div>
                    <span>{t("notifications.default")}</span>
                </div>
            </Menu.Item>
            <Menu.Item key="6">
                <div>
                    <span>{t("notifications.basket")}</span>
                </div>
            </Menu.Item>
        </Menu>
    );

    const defaultValues = {
        name: '',
        color: predefinedColors[0],
    };

    const [formValues, setFormValues] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formValues);

    const { trigger: createT, isMutating } = useSWRMutation(['create-tag'], async () => createTag({
        name: formValues.name,
        color: formValues.color,
    }));

    const { trigger: updateT, isMutating: updatingTag } = useSWRMutation(['update-tag'], async () => updateTag({
        tagId: tagId,
        name: formValues.name,
        color: formValues.color,
    }));

    const { trigger: updateNot } = useSWRMutation(
        notifId !== 0 ? ['update-not'] : null,
        async (_key, { arg }: { arg: UpdateNotifRequest }) => updateNotifications(arg)
    );

    type FieldType = "name" | "color";

    const handleInputChange = (field: FieldType, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
        setValue(field, value);
    };

    const handleDelete = async () => {
        try {
            const result = await mutate(
                [`delete-tag`, tagId],
                () => deleteTag(tagId),
                false
            );

            if (result) {
                mutate([`get-tags`]);
                mutate([`get-notifications`, filterParams]);
                resetForm();
            }
        } catch (error) {
            console.error("Error deleting tag:", error);
            showSnackbar("Error deleting tag", "error");
        }
    };

    const resetForm = () => {
        setFormValues(defaultValues);
        setIsEditMode(false);
        reset();
        setTagId(0);
        setIsModalOpen(false);
    };

    const handleUpdate = async (id: number) => {
        setTagId(id);
        setIsEditMode(true);

        const tagToEdit = tags?.find((tag) => tag.props.id === id);

        if (tagToEdit) {
            setFormValues({
                name: tagToEdit.props.name,
                color: tagToEdit.props.color,
            });
        }

        setIsModalOpen(true);
    };

    const handleUpdateNotification = (id: number) => {
        setNotifId(id);
        setFilterParams({ readStatus: ReadStatus.READ });
        setSelectedNotification(notificationsData?.find((notif) => notif.id === id) || null);
    }

    const onSubmit = async () => {
        try {
            if (tagId) {
                const result = await updateT();
                if (result) {
                    mutate([`get-tags`]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createT();
                if (result) {
                    mutate([`get-tags`]);
                    resetForm();
                } else {
                    throw new Error('Invalid org data. Please try again.');
                }
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
            showSnackbar("Error during form submission", "error");
        }
    };

    const addToFavorite = async () => {
        try {
            const result = await updateNot({
                userNotificationId: notifId,
                type: UserNotificationType.FAVORITE
            });
            if (result) {
                mutate([`get-notifications`, filterParams]);
                setSelectedNotification((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        type: UserNotificationType.FAVORITE,
                    };
                });
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            showSnackbar("Error adding to favorites", "error");
        }
    };

    const addTags = async () => {
        try {
            const result = await updateNot({
                userNotificationId: notifId,
                tagIds: selectedTagIds
            });

            if (result) {
                // Refresh the notifications data
                mutate([`get-notifications`, filterParams]);

                // Update the selected notification with the new tags
                setSelectedNotification((prev) => {
                    if (!prev) return prev;

                    // Get the full tag objects for the selected tag IDs
                    const newTags = tags.filter(tag => selectedTagIds.includes(tag.props.id))
                        .map(tag => ({
                            id: tag.props.id,
                            name: tag.props.name,
                            color: tag.props.color
                        }));

                    return {
                        ...prev,
                        tags: newTags
                    };
                });

                // Reset selection after successful update
                setSelectedTagIds([]);
            }
        } catch (error) {
            console.error('Error adding tags:', error);
            showSnackbar("Error adding tags", "error");
        }
    };

    const markAsRead = async () => {
        try {
            const result = await updateNot({
                userNotificationId: notifId,
                readStatus: ReadStatus.READ
            });
            if (result) {
                mutate([`get-notifications`, filterParams]);
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const moveToTrash = async () => {
        try {
            const result = await updateNot({
                userNotificationId: notifId,
                type: UserNotificationType.DELETED
            });
            if (result) {
                mutate([`get-notifications`, filterParams]);
                setSelectedNotification((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        type: UserNotificationType.DELETED,
                    };
                });

            }
        } catch (error) {
            console.error('Error moving to trash:', error);
            showSnackbar("Error moving to trash", "error");
        }
    };

    const menuItems: MenuProps["items"] = [
        {
            key: "markAsRead",
            label: t("notifications.mark"),
            onClick: markAsRead,
        },
        {
            key: "add",
            label: t("notifications.addA"),
            children: [
                {
                    key: "tag-selector",
                    label: (
                        <div
                            className="p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="space-y-1 mb-3">
                                {tags.map(tag => {
                                    const isSelected = selectedTagIds.includes(tag.props.id);

                                    return (
                                        <div
                                            key={`tag_${tag.props.id}`}
                                            className={`flex items-center justify-between cursor-pointer px-2 py-1 rounded hover:bg-gray-50 ${isSelected ? 'bg-blue-100' : ''
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTagSelection(tag.props.id);
                                            }}
                                        >
                                            <span style={{ color: tag.props.color }}>
                                                {tag.props.name}
                                            </span>
                                            {isSelected && <CheckOutlined />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t pt-2">
                                <div className="flex space-x-2">
                                    <AntdButton
                                        size="small"
                                        type="default"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Reset to original tags when canceling
                                            initializeSelectedTags();
                                            setSelectedNotification(null);
                                        }}
                                    >
                                        {t("organizations.cancel")}
                                    </AntdButton>
                                    <AntdButton
                                        size="small"
                                        type="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addTags();
                                        }}
                                        disabled={selectedTagIds.length === 0}
                                    >
                                        {t("marketing.apply")}
                                    </AntdButton>
                                </div>
                            </div>
                        </div>
                    ),
                },
            ],
        },
        {
            key: "delete",
            label: t("notifications.move"),
            onClick: moveToTrash,
        },
    ];

    return (
        <div className="mt-2">
            <Modal isOpen={isModalOpen} classname="p-6 w-full sm:w-[635px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-row items-center justify-between mb-4">
                        <div className="text-text01 font-semibold text-2xl mt-4">{isCustomColorMode ? t("notifications.add") : t("notifications.new")}</div>
                        <Close onClick={() => resetForm()} className="cursor-pointer text-text01 mb-4" />
                    </div>
                    {!isCustomColorMode && (
                        <div className="mb-5">
                            <div className="text-text01 mb-2">{t("notifications.enter")}</div>
                            <Input
                                label={t("notifications.new")}
                                classname="w-full"
                                {...register('name', { required: !isEditMode && 'Name is required' })}
                                value={formValues.name}
                                changeValue={(e) => handleInputChange('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        </div>
                    )}

                    {/* Ant Design Color Picker */}
                    {!isCustomColorMode ? (
                        <div className="flex flex-col space-y-5">
                            <span>Цвет ярлыка:</span>
                            <div className="flex items-center space-x-2">
                                {predefinedColors.map((color) => (
                                    <div
                                        key={color}
                                        className="w-14 h-8 rounded cursor-pointer flex items-center justify-center border"
                                        style={{
                                            backgroundColor: color,
                                            borderColor: formValues.color === color ? "#000" : "transparent",
                                        }}
                                        onClick={() => {
                                            setFormValues((prev) => ({ ...prev, color }));
                                            setValue('color', color);
                                        }}
                                    >
                                        {formValues.color === color && <CheckOutlined className="text-white" />}
                                    </div>
                                ))}

                                {/* Navigate to Custom Color Picker */}
                                <div
                                    className="w-14 h-8 rounded border border-gray-300 flex items-center justify-center cursor-pointer"
                                    onClick={() => setIsCustomColorMode(true)}
                                >
                                    <PlusOutlined />
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Custom Color Palette Screen
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <ArrowLeftOutlined className="cursor-pointer" onClick={() => setIsCustomColorMode(false)} />
                                <span className="text-text01">Выберите цвет</span>
                            </div>
                            <div className="flex space-x-2 mb-4">
                                <TagFilled style={{ color: formValues.color }} />
                                <div className="text-text01">{t("notifications.labelCol")}</div>
                            </div>
                            <ColorPicker
                                value={formValues.color}
                                onChange={(color) => {
                                    setFormValues((prev) => ({ ...prev, color: `#${color.toHex()}` }));
                                    setValue('color', `#${color.toHex()}`);
                                }}
                                showText
                            />
                        </div>
                    )}
                    <div className="mt-4">
                        <div className="flex space-x-2 justify-end mt-10">
                            <Button
                                type="outline"
                                handleClick={() => {
                                    resetForm();
                                    setIsModalOpen(false);
                                }}
                                title={t("organizations.cancel")}
                            />
                            {isEditMode && (<Button
                                title={t("marketing.delete")}
                                handleClick={handleDelete}
                                classname="bg-red-600 hover:bg-red-300"
                            />)}
                            <Button
                                form={true}
                                title="Создать"
                                isLoading={isEditMode ? updatingTag : isMutating}
                            />
                        </div>
                    </div>
                </form>
            </Modal>
            <hr />
            <Layout className="min-h-screen">
                {/* Sidebar */}
                <Sider
                    width={220}
                    className="border-r border-borderFill bg-white"
                    breakpoint="sm"
                    collapsedWidth="0"
                >
                    <div className="p-4 border-b border-borderFill">
                        <Text type="secondary">TITLE</Text>
                        <Menu mode="vertical" selectable={false} className="bg-transparent border-none">
                            <Menu.Item className="!p-0" onClick={() => setFilterParams({})}>
                                <div className="flex justify-between pr-2">
                                    <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
                                        <MailOutlined style={{ fontSize: "24px" }} className="text-text02 group-hover:text-text01" />
                                        <span className="font-semibold text-text02 group-hover:text-text01">{t("analysis.all")}</span>
                                    </div>
                                    <div className="hover:bg-opacity01 px-2 rounded-lg h-8 flex items-center mt-1">{notificationsData?.length}</div>
                                </div>
                            </Menu.Item>
                            <Menu.Item className="!p-0" onClick={() => setFilterParams({ type: UserNotificationType.FAVORITE })}>
                                <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
                                    <StarOutlined style={{ fontSize: "24px" }} className="text-text02 group-hover:text-text01" />
                                    <span className="font-semibold text-text02 group-hover:text-text01">{t("notifications.fav")}</span>
                                </div>
                            </Menu.Item>
                            <Menu.Item className="!p-0" onClick={() => setFilterParams({ type: UserNotificationType.DELETED })}>
                                <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
                                    <DeleteOutlined style={{ fontSize: "24px" }} className="text-text02 group-hover:text-text01" />
                                    <span className="font-semibold text-text02 group-hover:text-text01">{t("notifications.basket")}</span>
                                </div>
                            </Menu.Item>
                        </Menu>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-center">
                            <Text type="secondary">TITLE</Text>
                            <AntdButton
                                size="small"
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center space-x-2"
                            >
                                <PlusOutlined />
                            </AntdButton>
                        </div>
                        <Menu mode="vertical" selectable={false} className="bg-transparent border-none">
                            {loadingTags ? (
                                <Menu.Item className="!p-0">
                                    <div className="flex items-center px-2">
                                        <span>Загрузка...</span>
                                    </div>
                                </Menu.Item>
                            ) :
                                tags?.map((tag) => (
                                    <Menu.Item key={tag.props.name} className="!p-0" onClick={() => setFilterParams({ tagId: tag.props.id })}>
                                        <div className="flex justify-between">
                                            <div className="flex items-center space-x-2 px-2 hover:bg-[#f5f5f5]">
                                                <div style={{ color: tag.props.color, fill: tag.props.color, marginTop: "5px" }}>
                                                    <TagFilled style={{ fontSize: "24px" }} />
                                                </div>
                                                <span className="font-semibold text-text02 group-hover:text-text01">{tag.props.name}</span>
                                            </div>
                                            <Dropdown overlay={(
                                                <Menu>
                                                    <Menu.Item key={"Edit"} onClick={() => handleUpdate(tag.props.id)}>
                                                        <div>Edit</div>
                                                    </Menu.Item>
                                                </Menu>
                                            )}>
                                                <MoreOutlined
                                                    className="cursor-pointer text-text03 hover:text-opacity01"
                                                    style={{
                                                        fontSize: "24px"
                                                    }}
                                                />
                                            </Dropdown>
                                        </div>
                                    </Menu.Item>
                                ))}
                        </Menu>
                    </div>
                </Sider>

                <Layout className="bg-white px-4 sm:px-6 py-4">
                    <Content className="w-full max-w-full sm:max-w-[740px]">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Checkbox />
                                <Dropdown overlay={menu}>
                                    <div className="hover:text-primary02 hover:bg-background06 cursor-pointer w-10 h-10 flex items-center justify-center rounded">
                                        <DownOutlined className="text-lg" />
                                    </div>
                                </Dropdown>
                                <MoreOutlined
                                    className="text-xl cursor-pointer text-text01 hover:text-primary02"
                                />
                            </div>

                            <Search
                                placeholder="Поиск"
                                allowClear
                                className="w-full sm:w-80"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onSearch={(value) => setSearchTerm(value)}
                            />
                        </div>

                        {selectedNotification ? (
                            <div className="space-y-4">
                                <Card
                                    variant={"borderless"}
                                    className="shadow"
                                    styles={{ body: { padding: 24 } }}
                                >
                                    <div className="flex justify-between">
                                        <AntdButton
                                            type="link"
                                            icon={<ArrowLeftOutlined />}
                                            onClick={() => setSelectedNotification(null)}
                                            style={{ paddingLeft: 0 }}
                                        >
                                            {t("login.back")}
                                        </AntdButton>
                                        <div className="flex space-x-2 text-text01">
                                            <StarOutlined
                                                className={`text-lg cursor-pointer ${selectedNotification.type === UserNotificationType.FAVORITE ? 'text-yellow-500' : ''}`}
                                                onClick={addToFavorite}
                                            />
                                            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                                                <MoreOutlined className="text-lg cursor-pointer" />
                                            </Dropdown>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <div className="flex space-x-2">
                                            <Avatar src={OnviSmall} size="large" />
                                            <Text className="text-sm text-text01">
                                                {selectedNotification.heading || "Onvi_бизнес"}
                                            </Text>
                                        </div>
                                        <Text type="secondary">{dayjs(selectedNotification.sendAt).format('D MMMM, YYYY')}</Text>
                                    </div>
                                    <div className="mt-10 px-20">
                                        <Title level={4} className="mt-2">
                                            {selectedNotification.heading}
                                        </Title>

                                        <Paragraph className="whitespace-pre-line mt-2">
                                            {selectedNotification.body || `Добро пожаловать!\n\nПриветствуем вас!\nНаша система поможет вам оптимизировать и контролировать все аспекты вашего бизнеса, начиная с учёта заказов и заканчивая взаимодействием с партнёрами и клиентами.\n\nФункциональные возможности CRM позволяют настраивать различные параметры в зависимости от ваших потребностей, такие как воронка продаж, учёт эффективности сотрудников и интеграция с различными приложениями.\n\nВыбирайте подходящий тариф и начните использовать наш сервис уже сегодня.\nМы уверены, что он значительно повысит вашу продуктивность и прибыль.`}
                                        </Paragraph>
                                        <div className="mt-6 text-center">
                                            <img src={PosEmpty} alt="Welcome" className="w-48 inline-block" />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ) :
                            notificationsLoading ? (
                                <TableSkeleton columnCount={5} />
                            ) :
                                notifications.length > 0 ? (
                                    <List
                                        itemLayout="vertical"
                                        dataSource={notificationsData}
                                        renderItem={(item) => (
                                            <Card
                                                onClick={() => { handleUpdateNotification(item.id); }}
                                                hoverable
                                                style={{ background: item.openingAt ? "#EEEFF1" : "#ffffff", marginBottom: "1rem" }}
                                                className="relative"
                                                styles={{
                                                    body: {
                                                        padding: 20
                                                    }
                                                }}
                                            >
                                                <div className="flex items-start justify-between space-x-4">
                                                    <div className="flex items-start space-x-3">
                                                        <Checkbox />
                                                        <Avatar src={OnviSmall} size="large" />
                                                        <div className="space-y-1">
                                                            <Text type="secondary" className="text-sm">
                                                                {item.heading || "Onvi_бизнес"}
                                                            </Text>
                                                            <Text strong className="block">
                                                                {item.heading || "Модерация"}
                                                            </Text>
                                                            <div className="max-w-[300px] max-h-[30px] overflow-hidden">{item.body || "Команда Onvi_бизнес приветствует вас!"}</div>
                                                            {item.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {item.tags.map((tag) => (
                                                                        <Tag
                                                                            key={tag.id}
                                                                            color={tag.color}
                                                                            className="text-xs"
                                                                            style={{
                                                                                backgroundColor: tag.color,
                                                                                color: "#fff",
                                                                                borderRadius: "999px",
                                                                            }}
                                                                        >
                                                                            {tag.name}
                                                                        </Tag>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-text02 text-xs max-w-[100px] truncate sm:max-w-none sm:whitespace-nowrap">
                                                        {item.sendAt ? dayjs(item.sendAt).format('D MMMM, YYYY') : '10 Апреля, 2024'}
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 right-4 flex space-x-2 text-black">
                                                    <StarFilled className={`text-lg cursor-pointer ${item.type === UserNotificationType.FAVORITE ? 'text-yellow-500' : ''}`}
                                                    />
                                                    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                                                        <MoreOutlined className="text-lg cursor-pointer" />
                                                    </Dropdown>
                                                </div>
                                            </Card>
                                        )}
                                    />
                                ) : (
                                    <div className="flex flex-col justify-center items-center mt-16">
                                        <Empty
                                            description={t("notifications.you")}
                                            image={<img src={NoToken} alt="no-data" className="mx-auto" loading="lazy" />}
                                        />
                                    </div>
                                )}
                    </Content>
                </Layout>
            </Layout>
        </div>
    )
}

export default Notifications;