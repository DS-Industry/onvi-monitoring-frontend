import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Menu, Dropdown, ColorPicker, MenuProps, Button as AntdButton } from "antd";
import OnviSmall from "@/assets/onvi_small.png";
import { Input as SearchInp } from "antd";
import { ArrowLeftOutlined, CheckOutlined, PlusOutlined, TagFilled } from "@ant-design/icons";
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
import { createTag, deleteTag, getNotifications, getTags, updateTag } from "@/services/api/notifications";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import dayjs from "dayjs";
import 'dayjs/locale/ru';
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button/Button";

dayjs.locale('ru');

const { Sider, Content } = Layout;
const { Text, Title, Paragraph } = Typography;

const { Search } = SearchInp;

const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [tagId, setTagId] = useState<number>(0);
    const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

    const { data: notificationsData, isLoading: notificationsLoading } = useSWR([`get-notifications`], () => getNotifications({}), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: tags, isLoading: loadingTags } = useSWR([`get-tags`], () => getTags(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

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

    const menu = (
        <Menu>
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
        </Menu>
    );

    const menuItems: MenuProps["items"] = [
        {
            key: "markAsRead",
            label: t("notifications.mark"),
        },
        {
            key: "add",
            label: t("notifications.addA"),
            children: [
                {
                    key: "add_email",
                    label: "Финансы",
                },
                {
                    key: "add_sms",
                    label: "Важное",
                },
                {
                    key: "actions",
                    label: (
                        <div className="flex space-x-2">
                            <AntdButton
                                type="default"
                                onClick={() => setSelectedNotification(null)}
                            >
                                {t("organizations.cancel")}
                            </AntdButton>
                            <AntdButton
                                type="primary"
                                onClick={() => setSelectedNotification(null)}
                            >
                                {t("marketing.apply")}
                            </AntdButton>
                        </div>
                    )
                }
            ],
        },
        {
            key: "delete",
            label: t("notifications.move"),
        }
    ];

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
                resetForm();
            }
        } catch (error) {
            console.error("Error deleting tag:", error);
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
        }
    };

    return (
        <div className="mt-2">
            <Modal isOpen={isModalOpen}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-row items-center justify-between mb-4">
                        <div className="text-text01 font-semibold text-2xl">{isCustomColorMode ? t("notifications.add") : t("notifications.new")}</div>
                        <Close onClick={() => resetForm()} className="cursor-pointer text-text01" />
                    </div>
                    {!isCustomColorMode && (
                        <div>
                            <div className="text-text01">{t("notifications.enter")}</div>
                            <Input
                                label={t("notifications.new")}
                                classname="w-80"
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
                        <div className="flex flex-col space-y-2">
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
                            <div className="flex items-center space-x-2 mb-2">
                                <ArrowLeftOutlined className="cursor-pointer" onClick={() => setIsCustomColorMode(false)} />
                                <span className="text-text01">Выберите цвет</span>
                            </div>
                            <div className="flex space-x-2">
                                <TagFilled style={{ color: formValues.color }} />
                                <div className="text-text01">{t("notifications.labelCol")}</div>
                            </div>
                            <ColorPicker
                                value={formValues.color}
                                onChange={(color) => {
                                    setFormValues((prev) => ({ ...prev, color: color.toHex() }));
                                    setValue('color', color.toHex());
                                }}
                                showText
                            />
                        </div>
                    )}
                    <div className="mt-4">
                        <div className="flex space-x-2">
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
                            <Menu.Item className="!p-0">
                                <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
                                    <MailOutlined style={{ fontSize: "24px" }} className="text-text02 group-hover:text-text01" />
                                    <span className="font-semibold text-text02 group-hover:text-text01">{t("analysis.all")}</span>
                                </div>
                            </Menu.Item>
                            <Menu.Item className="!p-0">
                                <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
                                    <StarOutlined style={{ fontSize: "24px" }} className="text-text02 group-hover:text-text01" />
                                    <span className="font-semibold text-text02 group-hover:text-text01">{t("notifications.fav")}</span>
                                </div>
                            </Menu.Item>
                            <Menu.Item className="!p-0">
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
                                    <Menu.Item key={tag.props.name} className="!p-0" onClick={() => handleUpdate(tag.props.id)}>
                                        <div className="flex items-center space-x-2 px-2 hover:bg-[#f5f5f5]">
                                            <div style={{ color: tag.props.color, fill: tag.props.color, marginTop: "5px" }}>
                                                <TagFilled style={{ fontSize: "24px" }} />
                                            </div>
                                            <span className="font-semibold text-text02 group-hover:text-text01">{tag.props.name}</span>
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
                                            <StarOutlined className="text-lg" />
                                            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                                                <MoreOutlined className="text-lg cursor-pointer" />
                                            </Dropdown>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <div className="flex space-x-2">
                                            <Avatar src={selectedNotification.avatar || OnviSmall} size="large" />
                                            <Text className="text-sm text-text01">
                                                {selectedNotification.sender || "Onvi_бизнес"}
                                            </Text>
                                        </div>
                                        <Text type="secondary">{selectedNotification.date}</Text>
                                    </div>
                                    <div className="mt-10 px-20">
                                        <Title level={4} className="mt-2">
                                            {selectedNotification.title}
                                        </Title>

                                        <Paragraph className="whitespace-pre-line mt-2">
                                            {`Добро пожаловать!\n\nПриветствуем вас!\nНаша система поможет вам оптимизировать и контролировать все аспекты вашего бизнеса, начиная с учёта заказов и заканчивая взаимодействием с партнёрами и клиентами.\n\nФункциональные возможности CRM позволяют настраивать различные параметры в зависимости от ваших потребностей, такие как воронка продаж, учёт эффективности сотрудников и интеграция с различными приложениями.\n\nВыбирайте подходящий тариф и начните использовать наш сервис уже сегодня.\nМы уверены, что он значительно повысит вашу продуктивность и прибыль.`}
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
                                                onClick={() => setSelectedNotification(item)}
                                                hoverable
                                                style={{ background: "#EEEFF1", marginBottom: "1rem" }}
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
                                                    <StarOutlined className="text-lg" />
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