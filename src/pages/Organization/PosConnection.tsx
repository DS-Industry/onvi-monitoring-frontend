import React, { useEffect, useState } from "react";
import Icon from 'feather-icons-react';
import { useUser } from "@/hooks/useUserStore";
import useSWR from "swr";
import { connectPosPermission, getPosPermission, getPosPermissionUser } from "@/services/api/organization";
import Button from "@/components/ui/Button/Button";
import { useTranslation } from "react-i18next";
import useSWRMutation from "swr/mutation";


interface Item {
    id: number;
    name: string;
}

const PosConnection: React.FC = () => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<number[]>([]);
    const [availableItems, setAvailableItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);
    const user = useUser();

    const { data: posPermissionData } = useSWR([`get-pos-permission`], () => getPosPermission(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: posPermissionUserData } = useSWR([`get-pos-permission-user`], () => getPosPermissionUser(user.id), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { trigger: connectPos, isMutating } = useSWRMutation(['connect-pos'], async () => connectPosPermission({
        posIds: selected
    }, user.id));

    useEffect(() => {
        if (posPermissionUserData)
            setSelectedItems(posPermissionUserData);
    }, [posPermissionUserData]);

    useEffect(() => {
        if (posPermissionData && posPermissionUserData) {
            const filteredAvailableItems = posPermissionData.filter(
                (item: Item) => !posPermissionUserData.some((selectedItem: Item) => selectedItem.id === item.id)
            );
            setAvailableItems(filteredAvailableItems);
            setSelectedItems(posPermissionUserData);
        }
    }, [posPermissionData, posPermissionUserData]);

    useEffect(() => {
        setSelected(selectedItems.map(item => item.id));
    }, [selectedItems]);    

    const handleTransferToSelected = () => {
        const movingItems = availableItems.filter((item) => selected.includes(item.id));
        setAvailableItems(availableItems.filter((item) => !selected.includes(item.id)));
        setSelectedItems([...selectedItems, ...movingItems]);
    };
    
    const handleTransferToAvailable = () => {
        const movingItems = selectedItems.filter((item) => selected.includes(item.id));
        setSelectedItems(selectedItems.filter((item) => !selected.includes(item.id)));
        setAvailableItems([...availableItems, ...movingItems]);
    };
    

    const toggleSelection = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleConnection = async() => {
        const result  = await connectPos();

        if(result) {
            console.log("The result of api: ", result);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-row space-x-4">
                {/* Available Items List */}
                <div className="border rounded w-80">
                    <div className="flex border-b-[1px] bg-background05 text-xs">
                        <div className="font-normal text-text01 p-2">Available POS</div>
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
                                <div className="font-light text-[11px]">{item.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buttons in the center */}
                <div className="flex flex-col max-w-80 justify-center items-center my-2">
                    <button
                        className="border border-b-0 bg-white text-black cursor-pointer"
                        onClick={handleTransferToSelected}
                        disabled={selected.length === 0}
                        title={"→"}
                    >
                        <Icon icon="chevrons-right" />
                    </button>
                    <button
                        className="border border-t-0 bg-white text-black cursor-pointer"
                        onClick={handleTransferToAvailable}
                        disabled={selected.length === 0}
                        title={"→"}
                    >
                        <Icon icon="chevrons-left" />
                    </button>
                </div>

                {/* Selected Items List */}
                <div className="border rounded w-80">
                    <div className="flex border-b-[1px] bg-background05 text-xs">
                        <div className="font-normal text-text01 p-2">Selected POS</div>
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
                                <div className="text-[11px] font-light">{item.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Button
                title={t("routes.pos")}
                isLoading={isMutating}
                handleClick={handleConnection}
            />
        </div>
    )
}

export default PosConnection;