import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ClientEmpty from "@/assets/NoMarketing.png";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Icon from "feather-icons-react";
import Button from "@/components/ui/Button/Button";
import MultiInput from "@/components/ui/Input/MultiInput";
// import OverflowTable from "@/components/ui/Table/OverflowTable";
// import { columnsClients } from "@/utils/OverFlowTableData";
// import { Tooltip } from "@material-tailwind/react";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate, useFilterOn } from "@/components/context/useContext";
// import SearchInput from "@/components/ui/Input/SearchInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useSWR, { mutate } from "swr";
import { getPlacement } from "@/services/api/device";
import { createClient, getClientById, getClients, getTags, updateClient } from "@/services/api/marketing";
import useSWRMutation from "swr/mutation";
import { useCity, useCurrentPage, usePageNumber, useSetCity, useSetPageNumber } from "@/hooks/useAuthStore";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
// import ClientTable from "@/components/ui/Table/ClientsTable";
import { Tag } from "antd";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import Filter from "@/components/ui/Filter/Filter";

enum StatusUser {
    VERIFICATE = "VERIFICATE",
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    DELETED = "DELETED",
}

enum UserType {
    PHYSICAL = "PHYSICAL",
    LEGAL = "LEGAL"
}

type Client = {
    name: string;
    birthday?: Date;
    phone: string;
    email?: string;
    gender?: string;
    type: UserType;
    inn?: string;
    comment?: string;
    placementId?: number;
    devNumber?: number;
    number?: number;
    monthlyLimit?: number;
    tagIds: number[];
}

type ClientsParams = {
    placementId: number | string;
    type: UserType | string;
    tagIds?: number[];
    phone?: string;
    page?: number;
    size?: number;
}

const Clients: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    // const [openTag, setOpenTag] = useState(false);
    // const [hoveredTag, setHoveredTag] = useState("del");
    // const dropdownRef = useRef<HTMLDivElement | null>(null);
    // const [searchQuery, setSearchQuery] = useState("");
    const [viewLoyalty, setViewLoyalty] = useState(false);
    const [userType, setUserType] = useState("*");
    const [cardNo, setCardNo] = useState("");
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [tagIds, setTagIds] = useState<number[] | undefined>(undefined);
    const [status, setStatus] = useState("");
    const [loyLevel, setLoyLevel] = useState("");
    const [regDate, setRegDate] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editClientId, setEditClientId] = useState<number>(0);
    const city = useCity();
    const setCity = useSetCity();
    const [isTableLoading, setIsTableLoading] = useState(false);
    const { filterOn } = useFilterOn();
    const pageNumber = usePageNumber();
    const setPageNumber = useSetPageNumber();
    const currentPage = useCurrentPage();


    // const tableData = [
    //     { type: "Физ.лицо", name: "Testing Profile" }
    // ];

    const { data: cityData } = useSWR([`get-city`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: clientsData, isLoading: loadingClients, mutate: clientsMutating } = useSWR([`get-clients`], () => getClients({
        placementId: dataFilter.placementId,
        type: dataFilter.type,
        tagIds: dataFilter.tagIds,
        phone: dataFilter.phone,
        page: dataFilter.page,
        size: dataFilter.size
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: clientData } = useSWR(editClientId !== 0 ? [`get-client-by-id`] : null, () => getClientById(editClientId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const clients = clientsData || [];

    const initialFilter = {
        placementId: city,
        type: userType,
        tagIds: tagIds,
        phone: phone,
        page: currentPage,
        size: pageNumber
    }

    const [dataFilter, setDataFilter] = useState<ClientsParams>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<ClientsParams>) => {
        setDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
        if (newFilterData.placementId) setCity(newFilterData.placementId);
        if (newFilterData.type) setUserType(newFilterData.type);
        if (newFilterData.tagIds) setTagIds(newFilterData.tagIds);
        if (newFilterData.phone) setPhone(newFilterData.phone);
        if (newFilterData.size) setPageNumber(newFilterData.size);
    }

    useEffect(() => {
        handleDataFilter({
            placementId: city,
            type: userType,
            tagIds: tagIds,
            phone: phone,
            page: currentPage,
            size: pageNumber
        })
    }, [filterOn])

    useEffect(() => {
        clientsMutating().then(() => setIsTableLoading(false));
    }, [dataFilter, clientsMutating]);

    const handleClear = () => {
        setCity(city);
        setUserType("*");
        setTagIds(undefined);
        setPhone(undefined);
    }

    const { data: tagsData } = useSWR([`get-tags`], () => getTags(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const cities: { name: string; value: number; }[] = cityData?.map((item) => ({ name: item.city, value: item.id })) || [];

    const options = tagsData ? tagsData.map((tag) => tag.props) : [];

    // const filteredOptions = options.filter((opt) =>
    //     opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    const handleSelectionChange = (selected: typeof options) => {
        console.log("Selected Options:", selected);
        const selectedIds = selected.map((sel) => sel.id);
        handleInputChange("tagIds", selectedIds);
    };


    const handleSelectionTagChange = (selected: typeof options) => {
        console.log("Selected Options:", selected);
        const selectedIds = selected.map((sel) => sel.id);
        setTagIds(selectedIds);
    };

    const defaultValues: Client = {
        type: "" as UserType,
        name: "",
        birthday: undefined,
        phone: "",
        email: undefined,
        comment: "",
        gender: undefined,
        inn: undefined,
        tagIds: [],
        placementId: undefined,
        devNumber: undefined,
        number: undefined,
        monthlyLimit: undefined
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createCl, isMutating } = useSWRMutation(['create-client'], async () => createClient({
        type: formData.type,
        name: formData.name,
        birthday: formData.birthday,
        phone: formData.phone,
        email: formData.email,
        comment: formData.comment,
        gender: formData.gender,
        inn: formData.inn,
        tagIds: formData.tagIds,
        placementId: formData.placementId,
        devNumber: formData.devNumber,
        number: formData.number,
        monthlyLimit: formData.monthlyLimit
    }));

    const { trigger: updateCl, isMutating: updatingClient } = useSWRMutation(['update-client'], async () => updateClient({
        clientId: editClientId,
        name: formData.name,
        type: formData.type,
        inn: formData.inn,
        comment: formData.comment,
        placementId: formData.placementId,
        monthlyLimit: formData.monthlyLimit,
        tagIds: formData.tagIds
    }));

    type FieldType = "number" | "name" | "type" | "email" | "birthday" | "phone" | "gender" | "inn" | "comment" | "placementId" | "devNumber" | "monthlyLimit" | "tagIds" | `tagIds.${number}`;

    const handleInputChange = (field: FieldType, value: any) => {
        const numericFields = ['number', 'devNumber', 'placementId', 'monthlyLimit'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const handleUpdate = (id: number) => {
        setEditClientId(id);
        setIsEditMode(true);
        setButtonOn(true);

        console.log(id);
        console.log(isEditMode);
        const clientToEdit = clients.find((client) => client.id === id);
        console.log(clientToEdit);
        if (clientToEdit) {
            setFormData({
                type: clientToEdit.type,
                name: clientToEdit.name,
                phone: clientToEdit.phone,
                comment: clientToEdit.comment,
                tagIds: clientToEdit.tags.map((tag) => tag.id),
                placementId: clientToEdit.placementId
            });
        }
    };

    useEffect(() => {
        if (clientData) {
            console.log("Birthday: ", clientData.birthday);
            setFormData((prevData) => ({
                ...prevData,
                birthday: clientData.birthday ? clientData.birthday.split("T")[0] : undefined,
                email: clientData.email,
                inn: clientData.inn,
                gender: clientData.gender,
                devNumber: clientData.card?.devNumber,
                number: clientData.card?.number,
                monthlyLimit: clientData.card?.monthlyLimit,
            }));
        }
    }, [clientData]);

    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditClientId(0);
        setButtonOn(!buttonOn);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);

        try {
            if (editClientId) {
                const result = await updateCl();
                console.log(result);
                if (result) {
                    console.log(result);
                    // setCategory(result.props.categoryId)
                    mutate([`get-clients`]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createCl();
                if (result) {
                    console.log('API Response:', result);
                    // setCategory(result.props.categoryId)
                    mutate([`get-clients`]);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    // const tagOptions = [
    //     { value: "del", name: t("marketing.delete") },
    //     { value: "add", name: t("marketing.addA") },
    //     { value: "remove", name: t("marketing.remove") }
    // ];

    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    //             setOpenTag(false);
    //         }
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);

    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []);

    const columnsClients = [
        {
            label: "Тип клиента",
            key: "type",
            render: (type: UserType) => <span className="font-medium text-gray-700">{type}</span>,
        },
        {
            label: "Имя клиента",
            key: "name",
        },
        {
            label: "Телефон",
            key: "phone",
        },
        {
            label: "Статус",
            key: "status",
            render: (status: StatusUser) => {
                const color = status === StatusUser.ACTIVE ? "green" : status === StatusUser.BLOCKED ? "volcano" : "red";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            label: "Теги",
            key: "tags",
            render: (tags: { id: number; name: string; color: string }[]) =>
                tags.length > 0 ? (
                    <>
                        {tags.map((tag) => (
                            <Tag key={tag.id} color={tag.color}>
                                {tag.name}
                            </Tag>
                        ))}
                    </>
                ) : (
                    "—"
                ),
        },
        {
            label: "Комментарий",
            key: "comment",
        }
    ];

    return (
        <>
            <Filter count={clients.length} hideDateTime={true} address={city} setAddress={setCity} handleClear={handleClear} hideSearch={true}>
                <DropdownInput
                    title={`${t("marketing.type")}`}
                    label={t("marketing.phys")}
                    classname="w-80"
                    value={userType}
                    options={[
                        { name: t("marketing.physical"), value: "PHYSICAL" },
                        { name: t("marketing.legal"), value: "LEGAL" }
                    ]}
                    onChange={(value) => setUserType(value)}
                />
                <Input
                    type=""
                    title={t("profile.telephone")}
                    label={t("warehouse.enterPhone")}
                    classname="w-96"
                    value={phone}
                    changeValue={(e) => setPhone(e.target.value)}
                />
                <MultiInput
                    options={options}
                    value={tagIds}
                    onChange={handleSelectionTagChange}
                />
                <Input
                    type="number"
                    title={`${t("marketing.card")}`}
                    label={t("marketing.enterName")}
                    classname="w-80"
                    value={cardNo}
                    changeValue={(e) => setCardNo(e.target.value)}
                />
                <Input
                    title={`${t("finance.status")}`}
                    classname="w-80"
                    value={status}
                    changeValue={(e) => setStatus(e.target.value)}
                />
                <Input
                    title={`${t("marketing.loy")}`}
                    classname="w-80"
                    value={loyLevel}
                    changeValue={(e) => setLoyLevel(e.target.value)}
                />
                <Input
                    type="date"
                    title={`${t("marketing.reg")}`}
                    classname="w-44"
                    value={regDate}
                    changeValue={(e) => setRegDate(e.target.value)}
                />
            </Filter>
            {loadingClients || isTableLoading ?
                <TableSkeleton columnCount={columnsClients.length} />
                :
                clients.length > 0 ?
                    <div className="mt-8 flex flex-col min-h-screen">
                        <DynamicTable
                            columns={columnsClients}
                            data={clients}
                            onEdit={handleUpdate}
                            navigableFields={[{ key: "name", getPath: () => "/marketing/clients/profile" }]}
                        />
                        {/* <div className="mt-auto border-t border-opacity01 py-8 flex space-x-10 items-center">
                            <div className="text-text01 font-semibold">{t("marketing.high")}:2</div>
                            <div
                                className="relative flex flex-col"
                                onMouseLeave={() => setHoveredTag("del")}
                                ref={dropdownRef}
                            >
                                {openTag && (
                                    <div className="absolute bottom-full left-0 mb-2 shadow-md rounded-lg p-2 bg-white w-72 z-10">
                                        {tagOptions.map((tag) => (
                                            <div
                                                key={tag.value}
                                                className="px-2 py-2 text-text01 hover:text-primary02 cursor-pointer hover:bg-background06 rounded-md"
                                                onMouseEnter={() => setHoveredTag(tag.value)}
                                            >
                                                {tag.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {hoveredTag !== "del" && (
                                    <div className="absolute bottom-full left-[18rem] mb-2 shadow-md rounded-lg p-2 bg-white w-72 z-20">
                                        <SearchInput
                                            value={searchQuery}
                                            onChange={(value) => {
                                                setSearchQuery(value);
                                            }}
                                            searchType="outlined"
                                        />
                                        {filteredOptions.length > 0 ? filteredOptions.map((option) => (
                                            <div
                                                key={option.id}
                                                className="px-2 py-2 flex items-center rounded-md cursor-pointer hover:bg-background06"
                                            >
                                                <span className="text-text01 p-1 rounded" style={{ backgroundColor: option.color }}>{option.name}</span>
                                            </div>
                                        )) : (
                                            <div className="px-3 py-2 text-text02 text-sm">Нет доступных опций</div>
                                        )}
                                    </div>
                                )}
                                <Button
                                    title={t("marketing.actions")}
                                    type="outline"
                                    iconDown={!openTag}
                                    iconUp={openTag}
                                    handleClick={() => setOpenTag(!openTag)}
                                />
                            </div>
                        </div> */}
                    </div>
                    :
                    <div className="flex flex-col justify-center items-center">
                        <NoDataUI
                            title={t("marketing.noClient")}
                            description={""}
                        >
                            <img src={ClientEmpty} className="mx-auto" />
                        </NoDataUI>
                    </div>
            }
            <DrawerCreate onClose={resetForm}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("marketing.new")}</div>
                    <span className="font-semibold text-sm text-text01">{t("warehouse.fields")}</span>
                    <div className="font-semibold text-2xl mb-5 text-text01">{t("warehouse.basic")}</div>
                    <DropdownInput
                        title={`${t("marketing.type")}*`}
                        label={t("marketing.phys")}
                        classname="w-80"
                        value={formData.type}
                        options={[
                            { name: t("marketing.physical"), value: "PHYSICAL" },
                            { name: t("marketing.legal"), value: "LEGAL" }
                        ]}
                        {...register('type', { required: !isEditMode && 'Type is required' })}
                        onChange={(value) => handleInputChange('type', value)}
                        error={!!errors.type}
                        helperText={errors.type?.message || ''}
                    />
                    <Input
                        type=""
                        title={`${t("marketing.name")}*`}
                        label={t("marketing.enterName")}
                        classname="w-96"
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        {...register('name', { required: !isEditMode && 'Name is required' })}
                        helperText={errors.name?.message || ''}
                    />
                    <DropdownInput
                        title={t("marketing.floor")}
                        label={t("warehouse.notSel")}
                        classname="w-80"
                        options={[
                            { name: t("marketing.man"), value: "Man" },
                            { name: t("marketing.woman"), value: "Woman" }
                        ]}
                        value={formData.gender}
                        {...register('gender')}
                        onChange={(value) => handleInputChange('gender', value)}
                    />
                    <Input
                        type="date"
                        title={t("register.date")}
                        classname="w-40"
                        value={formData.birthday}
                        changeValue={(e) => handleInputChange('birthday', e.target.value)}
                        {...register('birthday')}
                    />
                    <Input
                        type=""
                        title={t("profile.telephone")}
                        label={t("warehouse.enterPhone")}
                        classname="w-96"
                        value={formData.phone}
                        changeValue={(e) => handleInputChange('phone', e.target.value)}
                        error={!!errors.phone}
                        {...register('phone', {
                            required: !isEditMode && 'Phone is required',
                            pattern: {
                                value: /^\+79\d{9}$/,
                                message: 'Phone number must start with +79 and be 11 digits long'
                            }
                        })}
                        helperText={errors.phone?.message || ''}
                    />
                    <Input
                        type=""
                        title={"E-mail"}
                        label={t("marketing.enterEmail")}
                        classname="w-96"
                        value={formData.email}
                        changeValue={(e) => handleInputChange('email', e.target.value)}
                        {...register('email')}
                    />
                    <DropdownInput
                        title={t("pos.city")}
                        label={t("warehouse.notSel")}
                        classname="w-80"
                        options={cities}
                        value={formData.placementId}
                        {...register('placementId')}
                        onChange={(value) => handleInputChange('placementId', value)}
                    />
                    <MultilineInput
                        title={t("equipment.comment")}
                        label={t("marketing.about")}
                        inputType="secondary"
                        classname="w-96"
                        value={formData.comment}
                        changeValue={(e) => handleInputChange('comment', e.target.value)}
                        {...register('comment')}
                    />
                    {formData.type === "LEGAL" && (<Input
                        type=""
                        title={t("marketing.inn")}
                        classname="w-96"
                        value={formData.inn}
                        changeValue={(e) => handleInputChange('inn', e.target.value)}
                        {...register('inn')}
                    />)}
                    <div className="flex items-center text-primary02">
                        <Icon icon="plus" className="w-5 h-5" />
                        <div className="font-semibold text-base">{t("marketing.add")}</div>
                    </div>
                    <MultiInput
                        options={options}
                        value={formData.tagIds}
                        onChange={handleSelectionChange}
                    />
                    {/* <div>
                        <div className="flex items-center text-text01 space-x-2">
                            <div className="font-semibold text-2xl">{t("marketing.mess")}</div>
                            <Tooltip content={t("marketing.applies")} placement="right-end">
                                <span>
                                    <Icon icon="alert-circle" />
                                </span>
                            </Tooltip>
                        </div>
                        <div className="space-y-3 mt-3">
                            <div className="flex space-x-10">
                                <div className="flex space-x-2">
                                    <input type="checkbox" className="border-2 border-primary02" />
                                    <div className="text-text02">{t("marketing.sub")} WhatsApp</div>
                                </div>
                                <div className="flex space-x-2">
                                    <input type="checkbox" className="border-2 border-primary02" />
                                    <div className="text-text02">{t("marketing.sub")} Telegram</div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <input type="checkbox" className="border-2 border-primary02" />
                                <div className="text-text02">{t("marketing.sub")} Email</div>
                            </div>
                        </div>
                    </div> */}
                    <div className="font-semibold text-2xl text-text01">{t("marketing.loyalty")}</div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            className="w-[18px] h-[18px]"
                            checked={viewLoyalty}
                            onChange={() => setViewLoyalty(!viewLoyalty)}
                        />
                        <div>{t("marketing.gen")}</div>
                    </div>
                    {viewLoyalty && (<div className="space-y-6">
                        <Input
                            type="number"
                            title={`${t("marketing.card")}`}
                            label={t("marketing.enterName")}
                            classname="w-96"
                            value={formData.number}
                            changeValue={(e) => handleInputChange('number', e.target.value)}
                            {...register('number')}
                        />
                        <Input
                            type="number"
                            title={`${t("marketing.un")}`}
                            label={t("marketing.enterName")}
                            classname="w-96"
                            value={formData.devNumber}
                            changeValue={(e) => handleInputChange('devNumber', e.target.value)}
                            {...register('devNumber')}
                        />
                        {formData.type === "LEGAL" && (<Input
                            type="number"
                            title={t("marketing.limit")}
                            label={t("warehouse.notSel")}
                            classname="w-80"
                            value={formData.monthlyLimit}
                            changeValue={(e) => handleInputChange('monthlyLimit', e.target.value)}
                            {...register('monthlyLimit')}
                        />)}
                    </div>)}
                    <div className="flex space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                resetForm();
                            }}
                        />
                        <Button
                            title={t("marketing.delete")}
                            // handleClick={handleDelete}
                            classname="bg-red-600 hover:bg-red-300"
                        />
                        <Button
                            title={t("organizations.save")}
                            form={true}
                            isLoading={isEditMode ? updatingClient : isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </>
    )
}

export default Clients;