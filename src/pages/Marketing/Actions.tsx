import React from "react";
import { List } from "antd";

const data = [
    {
        id: 1,
        description: ["Добавленна карта лояльности", "№ 000000000001"],
        date: "08.06.24",
        time: "10:34",
    },
    {
        id: 2,
        description: ["Клиент Олег Сидоров", "Добавлен в базу"],
        date: "08.06.24",
        time: "10:34",
    }
];

const Actions: React.FC = () => {
    return (
        <div className="w-full max-w-screen-lg mx-auto overflow-hidden">
            <List
                dataSource={data}
                renderItem={(item) => (
                    <List.Item className="p-0 text-text01 w-full">
                        <div className="w-full px-4 py-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-2">
                                <div className="flex flex-wrap gap-x-2">
                                    {item.description.map((text, index) => (
                                        <div key={index}>{text}</div>
                                    ))}
                                </div>
                                <div className="flex space-x-2 justify-start sm:justify-end">
                                    <div>{item.date}</div>
                                    <div>{item.time}</div>
                                </div>
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Actions;
