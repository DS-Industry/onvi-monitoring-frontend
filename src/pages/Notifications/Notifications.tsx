import React, { useState } from "react";
import Icon from 'feather-icons-react';
import { useTranslation } from "react-i18next";
import { Checkbox, Menu, Dropdown, ColorPicker } from "antd";
import OnviSmall from "@/assets/onvi_small.png";
import { Input as SearchInp } from "antd";
import { ArrowLeftOutlined, CheckOutlined, PictureOutlined, PlusOutlined, TagFilled } from "@ant-design/icons";
import NoDataUI from "@/components/ui/NoDataUI";
import NoToken from "@/assets/NoToken.png";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import Input from "@/components/ui/Input/Input";

const { Search } = SearchInp;

const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const notifications = [{}];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const predefinedColors = ["#EF4444", "#F97316", "#22C55E", "#3B82F6", "#8B5CF6", "#6B7280"]; // Red, Orange, Green, Blue, Purple, Gray
    // const extendedColors = [
    //     "#F43F5E", "#FB923C", "#A3E635", "#38BDF8", "#A78BFA", "#94A3B8",
    //     "#FACC15", "#14B8A6", "#F472B6", "#60A5FA", "#8D8D8D", "#1E293B"
    // ];
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

    return (
        <div className="mt-2">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handleClick={() => console.log({ labelName, selectedColor })}>
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
            <div className="flex">
                <div className="w-56 h-screen border-r border-opacity01">
                    <div>
                        <div className="h-44 p-2 border-b border-opacity01 space-y-4">
                            <div className="text-text02 mt-2">TITLE</div>
                            <div className="space-y-2">
                                <div className="flex text-text02 font-semibold hover:text-text01 hover:bg-background05 cursor-pointer space-x-2">
                                    <Icon icon="mail" className="h-6 w-6" />
                                    <div>{t("analysis.all")}</div>
                                </div>
                                <div className="flex text-text02 font-semibold hover:text-text01 hover:bg-background05 cursor-pointer space-x-2">
                                    <Icon icon="star" className="h-6 w-6" />
                                    <div>{t("notifications.fav")}</div>
                                </div>
                                <div className="flex text-text02 font-semibold hover:text-text01 hover:bg-background05 cursor-pointer space-x-2">
                                    <Icon icon="trash-2" className="h-6 w-6" />
                                    <div>{t("notifications.basket")}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-text02 mt-2">TITLE</div>
                        </div>
                    </div>
                </div>
                <div className="ml-10 mt-4">
                    <div className="flex items-center justify-between w-[740px]">
                        <div className="flex space-x-2">
                            <div className="flex space-x-2 items-center">
                                <Checkbox />
                                <Dropdown overlay={menu} trigger={['hover']}>
                                    <div className="text-text01 hover:text-primary02 hover:bg-background06 cursor-pointer w-10 h-10 flex items-center justify-center rounded">
                                        <Icon icon="chevron-down" className="w-6 h-6" />
                                    </div>
                                </Dropdown>
                            </div>
                            <div className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
                                <Icon icon="more-vertical" className="w-10 h-10 text-text01" />
                            </div>
                        </div>
                        <Search
                            placeholder="Поиск"
                            className="w-full sm:w-80 ml-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onSearch={(value) => setSearchTerm(value)}
                        />
                    </div>
                    {notifications.length > 0 ? (<div className="mt-3 space-y-4">
                        <div className="w-[740px] h-36 border border-borderFill rounded px-4 py-5 flex items-start justify-between relative bg-[#EEEFF1]">
                            <div className="flex items-start space-x-2">
                                <Checkbox />
                                <img src={OnviSmall} className="h-8 w-8" />
                                <div className="text-text01 space-y-2">
                                    <div className="text-sm">Onvi_бизнес</div>
                                    <div className="font-semibold">Модерация</div>
                                    <div>Команда Onvi_бизнес приветствует вас!</div>
                                    <div className="w-12 h-6 px-2 py-1 border border-borderFill rounded-[100px] text-text01 flex space-x-1 items-center bg-text04">
                                        <PictureOutlined />
                                        <div>+1</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-text02 text-xs">10 Апреля, 2024</div>
                            <div className="absolute bottom-4 right-4 text-black flex space-x-2">
                                <Icon icon="star" className="w-6 h-6" />
                                <Icon icon="more-vertical" className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="w-[740px] h-36 border border-borderFill rounded px-4 py-5 flex items-start justify-between relative">
                            <div className="flex items-start space-x-2">
                                <Checkbox />
                                <img src={OnviSmall} className="h-8 w-8" />
                                <div className="text-text01 space-y-2">
                                    <div className="text-sm">Onvi_бизнес</div>
                                    <div className="font-semibold">Модерация</div>
                                    <div>Команда Onvi_бизнес приветствует вас!</div>
                                    <div className="w-12 h-6 px-2 py-1 border border-borderFill rounded-[100px] text-text01 flex space-x-1 items-center bg-text04">
                                        <PictureOutlined />
                                        <div>+1</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-text02 text-xs">10 Апреля, 2024</div>
                            <div className="absolute bottom-4 right-4 text-black flex space-x-2">
                                <Icon icon="star" className="w-6 h-6" />
                                <Icon icon="more-vertical" className="w-6 h-6" />
                            </div>
                        </div>
                    </div>) : (
                        <div className="flex flex-col justify-center items-center">
                            <NoDataUI
                                title={t("notifications.you")}
                                description={""}
                            >
                                <img src={NoToken} className="mx-auto" />
                            </NoDataUI>
                        </div>)}
                </div>
            </div>
        </div>
    )
}

export default Notifications;