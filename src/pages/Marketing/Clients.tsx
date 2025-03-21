import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ClientEmpty from "@/assets/NoMarketing.png";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Icon from "feather-icons-react";
import Button from "@/components/ui/Button/Button";
import MultiInput from "@/components/ui/Input/MultiInput";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsClients } from "@/utils/OverFlowTableData";
// import { Tooltip } from "@material-tailwind/react";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate } from "@/components/context/useContext";
import SearchInput from "@/components/ui/Input/SearchInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useSWR from "swr";
import { getPlacement } from "@/services/api/device";
import { createClient, getClients, getTags } from "@/services/api/marketing";
import useSWRMutation from "swr/mutation";
import { useCity } from "@/hooks/useAuthStore";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";

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

const Clients: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [openTag, setOpenTag] = useState(false);
    const [hoveredTag, setHoveredTag] = useState("del");
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewLoyalty, setViewLoyalty] = useState(false);

    // const tableData = [
    //     { type: "Физ.лицо", name: "Testing Profile" }
    // ];

    const city = useCity();

    const { data: cityData } = useSWR([`get-city`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: clientsData, isLoading: loadingClients } = useSWR([`get-clients`], () => getClients({
        placementId: city,
        type: "PHYSICAL"
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const clients = clientsData || [];

    const { data: tagsData } = useSWR([`get-tags`], () => getTags(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const cities: { name: string; value: number; }[] = cityData?.map((item) => ({ name: item.city, value: item.id })) || [];

    const options = tagsData ? tagsData.map((tag) => tag.props) : [];

    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectionChange = (selected: typeof options) => {
        console.log("Selected Options:", selected);
        const selectedIds = selected.map((sel) => sel.id);
        handleInputChange("tagIds", selectedIds);
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

    type FieldType = "number" | "name" | "type" | "email" | "birthday" | "phone" | "gender" | "inn" | "comment" | "placementId" | "devNumber" | "monthlyLimit" | "tagIds" | `tagIds.${number}`;

    const handleInputChange = (field: FieldType, value: any) => {
        const numericFields = ['number', 'devNumber', 'placementId', 'monthlyLimit'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
        setButtonOn(!buttonOn);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);

        const result = await createCl();
        if (result) {
            console.log('API Response:', result);
            // setCategory(result.props.categoryId)
            // mutate([`get-inventory`, result.props.categoryId, orgId]);
            resetForm();
        } else {
            throw new Error('Invalid response from API');
        }
    };

    const tagOptions = [
        { value: "del", name: t("marketing.delete") },
        { value: "add", name: t("marketing.addA") },
        { value: "remove", name: t("marketing.remove") }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenTag(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            {loadingClients ?
                <TableSkeleton columnCount={columnsClients.length} />
                :
                clients.length > 0 ?
                    <div className="mt-8 flex flex-col min-h-screen">
                        <OverflowTable
                            tableData={clients}
                            columns={columnsClients}
                            isDisplayEdit={true}
                            nameUrl="/marketing/clients/profile"
                        />
                        <div className="mt-auto border-t border-opacity01 py-8 flex space-x-10 items-center">
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
                        </div>
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
                        {...register('type', { required: 'type is required' })}
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
                        {...register('name', { required: 'Name is required' })}
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
                        {...register('phone')}
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
                            title={t("organizations.save")}
                            form={true}
                            isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </>
    )
}

export default Clients;