import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import useSWR, { mutate } from "swr";
import { createPosition, getPositions, updatePosition } from "@/services/api/hr";
import useSWRMutation from "swr/mutation";
import { useCity } from "@/hooks/useAuthStore";
import { getOrganization } from "@/services/api/organization";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { Table } from "antd";
import { EditOutlined } from "@ant-design/icons";
import AntInput from 'antd/es/input';
import { ColumnsType } from "antd/es/table";

type Positions = {
  id: number;
  name: string;
  organizationId: number;
  description?: string;
}

const Positions: React.FC = () => {
  const { t } = useTranslation();
  const { buttonOn, setButtonOn } = useButtonCreate();
  const [position, setPosition] = useState<string | undefined>();
  const [originalPosition, setOriginalPosition] = useState<string>(); 
  const city = useCity();

  const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

  const { data: positionData, isLoading: positionLoading, isValidating } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const [editingRow, setEditingRow] = useState<number | null>(null);

  const defaultValues: Positions = {
    id: -1,
    name: "",
    organizationId: 0,
    description: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

  const { trigger: createPos, isMutating } = useSWRMutation(['create-position'], async () => createPosition({
    name: formData.name,
    organizationId: formData.organizationId,
    description: formData.description
  }));

  const { trigger: updatePos } = useSWRMutation(
    'update-position',
    async (_, { arg }: { arg: { positionId: number; description?: string } }) => 
      updatePosition(arg)
  );

  type FieldType = "name" | "organizationId" | "description";

  const handleInputChange = (field: FieldType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setButtonOn(!buttonOn);
  };

  const onSubmit = async () => {
    try {
      await createPos();
      mutate([`get-positions`]);
      resetForm();
    } catch (error) {
      console.error("Error during form submission: ", error);
    }
  };

  const handleUpdatePosition = async (positionId: number) => {
    if (position === originalPosition) {
      setEditingRow(null);
      return;
    }
    
    try {
      await updatePos({ positionId, description: position });
      mutate([`get-positions`]);
      setEditingRow(null);
    } catch (error) {
      console.error("Update failed: ", error);
    }
  };

  const positionsData = positionData?.map((pos) => pos.props) || [];

  const columns: ColumnsType<Positions> = [
    {
      title: t("Должность"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("Описание"),
      dataIndex: "description",
      key: "description",
      render: (_, record) => {
        const isEditable = editingRow === record.id;

        return isEditable ? (
          <AntInput
            type="text"
            className="w-full sm:w-80 h-10"
            placeholder={t("hr.enter")}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            onBlur={() => setEditingRow(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUpdatePosition(record.id);
              }
            }}
            autoFocus
          />
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => {
              setOriginalPosition(record.description);
              setPosition(record.description);
              setEditingRow(record.id);
            }}
          >
            {record.description || "-"}
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      render: (_, record) => (
        <div
          className="text-primary02 cursor-pointer"
          onClick={() => {
            setOriginalPosition(record.description);
            setPosition(record.description);
            setEditingRow(record.id);
          }}
        >
          <EditOutlined />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        dataSource={positionsData}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={positionLoading || isValidating}
        scroll={{ x: "max-content" }}
      />

      <DrawerCreate onClose={resetForm}>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("hr.pos")}</div>
          <div className="flex">
            <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
            <span className="text-errorFill">*</span>
            <span className="font-semibold text-sm text-text01">{t("routine.are")}</span>
          </div>
          <Input
            title={`${t("hr.name")}*`}
            label={t("hr.enter")}
            type={"text"}
            classname="w-80"
            value={formData.name}
            changeValue={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            {...register('name', { required: 'Name is required' })}
            helperText={errors.name?.message || ''}
          />
          <DropdownInput
            title={t("warehouse.organization")}
            options={organizations}
            classname="w-64"
            {...register('organizationId', {
              required: 'Organization Id is required',
              validate: (value) =>
                (value !== 0) || "Organization Id is required"
            })}
            value={formData.organizationId}
            onChange={(value) => handleInputChange('organizationId', value)}
            error={!!errors.organizationId}
            helperText={errors.organizationId?.message}
          />
          <MultilineInput
            title={t("warehouse.desc")}
            label={t("hr.about")}
            classname="w-80"
            inputType="secondary"
            value={formData.description}
            changeValue={(e) => handleInputChange('description', e.target.value)}
            {...register('description')}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Button
              title={t("organizations.cancel")}
              type="outline" handleClick={() => {
                setButtonOn(!buttonOn);
                resetForm();
              }}
            />
            <Button
              title={t("hr.pos")}
              form={true}
              isLoading={isMutating}
              handleClick={() => { }}
            />
          </div>
        </form>
      </DrawerCreate>
    </div>
  )
}

export default Positions;