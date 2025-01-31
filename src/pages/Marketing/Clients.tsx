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
import { columnsClient } from "@/utils/OverFlowTableData";
import { Tooltip } from "@material-tailwind/react";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate } from "@/components/context/useContext";
import SearchInput from "@/components/ui/Input/SearchInput";

const Clients: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [openTag, setOpenTag] = useState(false);
    const [hoveredTag, setHoveredTag] = useState("del");
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const options = [
        { id: 1, label: "Red Option", color: "#EF4444" },
        { id: 2, label: "Blue Option", color: "#3B82F6" },
        { id: 3, label: "Green Option", color: "#10B981" },
        { id: 4, label: "Yellow Option", color: "#F59E0B" },
    ];

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectionChange = (selected: typeof options) => {
        console.log("Selected Options:", selected);
        handleInputChange("selectedOptions", selected);
    };

    const tableData = [
        { type: "Физ.лицо", name: "Testing Profile" }
    ];

    const defaultValues = {
        type: "",
        name: "",
        floor: "",
        date: "",
        telephone: "",
        email: "",
        discount: "",
        comment: "",
        selectedOptions: [],
        cardNo: "",
        unCard: "",
        startDate: "",
        endDate: "",
        cardType: ""
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    type FieldType = "name" | "type" | "floor" | "date" | "telephone" | "email" | "discount" | "comment" | "selectedOptions" | "cardNo" | "unCard" | "startDate" | "endDate" | "cardType";

    const handleInputChange = (field: FieldType, value: any) => {
        const numericFields = ['type', 'floor', 'cardType'];
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
            {tableData.length > 0 ?
                <div className="mt-8 flex flex-col min-h-screen">
                    <OverflowTable
                        tableData={tableData}
                        columns={columnsClient}
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
                                            <span className="text-text01 p-1 rounded" style={{ backgroundColor: option.color }}>{option.label}</span>
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
            <DrawerCreate>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("marketing.new")}</div>
                    <span className="font-semibold text-sm text-text01">{t("warehouse.fields")}</span>
                    <div className="font-semibold text-2xl mb-5 text-text01">{t("warehouse.basic")}</div>
                    <Input
                        type="number"
                        title={`${t("marketing.type")}*`}
                        label={t("marketing.phys")}
                        classname="w-80"
                        value={formData.type}
                        changeValue={(e) => handleInputChange('type', e.target.value)}
                        error={!!errors.type}
                        {...register('type', { required: 'type is required' })}
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
                    <Input
                        type="number"
                        title={t("marketing.floor")}
                        label={t("warehouse.notSel")}
                        classname="w-80"
                        value={formData.floor}
                        changeValue={(e) => handleInputChange('floor', e.target.value)}
                        {...register('floor')}
                    />
                    <Input
                        type="date"
                        title={t("register.date")}
                        classname="w-40"
                        value={formData.date}
                        changeValue={(e) => handleInputChange('date', e.target.value)}
                        {...register('date')}
                    />
                    <Input
                        type=""
                        title={t("profile.telephone")}
                        label={t("warehouse.enterPhone")}
                        classname="w-96"
                        value={formData.telephone}
                        changeValue={(e) => handleInputChange('telephone', e.target.value)}
                        {...register('telephone')}
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
                    <Input
                        type=""
                        title={t("marketing.disc")}
                        classname="w-64"
                        value={formData.discount}
                        changeValue={(e) => handleInputChange('discount', e.target.value)}
                        {...register('discount')}
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
                    <div className="flex items-center text-primary02">
                        <Icon icon="plus" className="w-5 h-5" />
                        <div className="font-semibold text-base">{t("marketing.add")}</div>
                    </div>
                    <MultiInput
                        options={options}
                        value={formData.selectedOptions}
                        onChange={handleSelectionChange}
                    />
                    <div>
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
                    </div>
                    <div className="font-semibold text-2xl text-text01">{t("marketing.loyalty")}</div>
                    <Input
                        type=""
                        title={`${t("marketing.card")}*`}
                        label={t("marketing.enterName")}
                        classname="w-96"
                        value={formData.cardNo}
                        changeValue={(e) => handleInputChange('cardNo', e.target.value)}
                        error={!!errors.cardNo}
                        {...register('cardNo', { required: 'cardNo is required' })}
                        helperText={errors.cardNo?.message || ''}
                    />
                    <Input
                        type=""
                        title={`${t("marketing.un")}*`}
                        label={t("marketing.enterName")}
                        classname="w-96"
                        value={formData.unCard}
                        changeValue={(e) => handleInputChange('unCard', e.target.value)}
                        error={!!errors.unCard}
                        {...register('unCard', { required: 'unCard is required' })}
                        helperText={errors.unCard?.message || ''}
                    />
                    <Input
                        type="date"
                        title={t("equipment.start")}
                        classname="w-40"
                        value={formData.startDate}
                        changeValue={(e) => handleInputChange('startDate', e.target.value)}
                        {...register('startDate')}
                    />
                    <Input
                        type="date"
                        title={t("marketing.comp")}
                        classname="w-40"
                        value={formData.endDate}
                        changeValue={(e) => handleInputChange('endDate', e.target.value)}
                        {...register('endDate')}
                    />
                    <Input
                        type="number"
                        title={t("marketing.cardType")}
                        label={t("warehouse.notSel")}
                        classname="w-80"
                        value={formData.cardType}
                        changeValue={(e) => handleInputChange('cardType', e.target.value)}
                        error={!!errors.cardType}
                        {...register('cardType', { required: 'cardType is required' })}
                        helperText={errors.cardType?.message || ''}
                    />
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
                            // isLoading={isEditMode ? updatingInventory : isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </>
    )
}

export default Clients;