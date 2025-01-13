import React from "react";

const Actions: React.FC = () => {
    return (
        <div className="space-y-2">
            <div className="w-[1128px] flex justify-between text-text01 border border-borderFill rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                    <div>Добавленна карта лояльности</div>
                    <div>№ 000000000001</div>
                </div>
                <div className="flex space-x-2">
                    <div>08.06.24</div>
                    <div>10:34</div>
                </div>
            </div>
            <div className="w-[1128px] flex justify-between text-text01 border border-borderFill rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                    <div>Клиент Олег Сидоров</div>
                    <div>Добавлен в базу</div>
                </div>
                <div className="flex space-x-2">
                    <div>08.06.24</div>
                    <div>10:34</div>
                </div>
            </div>
        </div>
    )
}

export default Actions;