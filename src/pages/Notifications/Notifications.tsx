import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Menu, Dropdown, ColorPicker, Button, MenuProps } from "antd";
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
    PictureOutlined,
    DownOutlined,
} from "@ant-design/icons";
import PosEmpty from "@/assets/EmptyPos.png";

const { Sider, Content } = Layout;
const { Text, Title, Paragraph } = Typography;

const { Search } = SearchInp;

const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

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
    const [selectedColor, setSelectedColor] = useState<string>(predefinedColors[0]);
    const [labelName, setLabelName] = useState("");
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
                            <Button
                                type="default"
                                onClick={() => setSelectedNotification(null)}
                            >
                                {t("organizations.cancel")}
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => setSelectedNotification(null)}
                            >
                                {t("marketing.apply")}
                            </Button>
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

    return (
        <div className="mt-2">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handleClick={() => { }}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <div className="text-text01 font-semibold text-2xl">{isCustomColorMode ? t("notifications.add") : t("notifications.new")}</div>
                    <Close onClick={() => setIsModalOpen(false)} className="cursor-pointer text-text01" />
                </div>
                {!isCustomColorMode && (
                    <div>
                        <div className="text-text01">{t("notifications.enter")}</div>
                        <Input
                            label={t("notifications.new")}
                            value={labelName}
                            changeValue={(e) => setLabelName(e.target.value)}
                            classname="w-80"
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
                                        borderColor: selectedColor === color ? "#000" : "transparent",
                                    }}
                                    onClick={() => setSelectedColor(color)}
                                >
                                    {selectedColor === color && <CheckOutlined className="text-white" />}
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
                            <TagFilled style={{ color: selectedColor }} />
                            <div className="text-text01">{t("notifications.labelCol")}</div>
                        </div>
                        <ColorPicker
                            value={selectedColor}
                            onChange={(color) => setSelectedColor(color.toHexString())}
                            showText
                        />
                    </div>
                )}

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
                        <Text type="secondary">TITLE</Text>
                        <Menu mode="vertical" selectable={false} className="bg-transparent border-none">
                            <Menu.Item className="!p-0">
                                <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
                                    <TagFilled style={{ fontSize: "24px" }} className="text-[#FF0808]" />
                                    <span className="font-semibold text-text02 group-hover:text-text01">Финансы</span>
                                </div>
                            </Menu.Item>
                            <Menu.Item className="!p-0">
                                <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
                                    <TagFilled style={{ fontSize: "24px" }} className="text-primary02" />
                                    <span className="font-semibold text-text02 group-hover:text-text01">Важное</span>
                                </div>
                            </Menu.Item>
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
                                    onClick={() => setIsModalOpen(true)}
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
                                        <Button
                                            type="link"
                                            icon={<ArrowLeftOutlined />}
                                            onClick={() => setSelectedNotification(null)}
                                            style={{ paddingLeft: 0 }}
                                        >
                                            {t("login.back")}
                                        </Button>
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
                        ) : notifications.length > 0 ? (
                            <List
                                itemLayout="vertical"
                                dataSource={notifications}
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
                                                <Avatar src={item.avatar || OnviSmall} size="large" />
                                                <div className="space-y-1">
                                                    <Text type="secondary" className="text-sm">
                                                        {item.sender || "Onvi_бизнес"}
                                                    </Text>
                                                    <Text strong className="block">
                                                        {item.title || "Модерация"}
                                                    </Text>
                                                    <div>{item.message || "Команда Onvi_бизнес приветствует вас!"}</div>
                                                    {item.imageCount > 0 && (
                                                        <Tag
                                                            icon={<PictureOutlined />}
                                                            className="bg-text04 text-text01 border-borderFill"
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: 4,
                                                                height: 24,
                                                                padding: "0 8px",
                                                                borderRadius: 999,
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            +{item.imageCount}
                                                        </Tag>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-text02 text-xs max-w-[100px] truncate sm:max-w-none sm:whitespace-nowrap">
                                                {item.date || "10 Апреля, 2024"}
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