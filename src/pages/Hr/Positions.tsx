import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate, useToast } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import useSWR, { mutate } from "swr";
import { createPosition, getPositions, updatePosition } from "@/services/api/hr";
import useSWRMutation from "swr/mutation";
import { useCity } from "@/hooks/useAuthStore";
import { getOrganization } from "@/services/api/organization";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { Table, Popconfirm, Typography, Input as AntInput, Button as AntButton } from "antd";
import { EditOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";

type Positions = {
  id: number;
  name: string;
  organizationId: number;
  description?: string;
};

const Positions: React.FC = () => {
  const { t } = useTranslation();
  const { buttonOn, setButtonOn } = useButtonCreate();
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const city = useCity();
  const { showToast } = useToast();

  const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

  const { data: positionData, isLoading: positionLoading, isValidating } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

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
      showToast(t("errors.other.errorDuringFormSubmission"), "error");
    }
  };

  const positionsData = positionData?.map((pos) => pos.props) || [];

  const startEditing = (record: Positions) => {
    setEditingKey(record.id);
    setEditingValue(record.description || "");
  };

  const cancelEditing = () => {
    setEditingKey(null);
  };

  const saveEditing = async (id: number) => {
    try {
      await updatePos({ positionId: id, description: editingValue });
      mutate([`get-positions`]);
      setEditingKey(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const columns: ColumnsType<Positions> = [
    {
      title: t("Должность"),
      dataIndex: "name",
      key: "name",
      width: '35%',
    },
    {
      title: t("Описание"),
      dataIndex: "description",
      key: "description",
      width: '50%',
      render: (text: string, record: Positions) => {
        if (editingKey === record.id) {
          return (
            <AntInput
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onPressEnter={() => saveEditing(record.id)}
              autoFocus
            />
          );
        }
        return text || "-";
      },
    },
    {
      title: "",
      key: "actions",
      width: '15%',
      render: (_: any, record: Positions) => {
        if (editingKey === record.id) {
          return (
            <span>
              <AntButton
                type="text"
                icon={<CheckOutlined />}
                onClick={() => saveEditing(record.id)}
                style={{ marginRight: 8, color: "green" }}
              />
              <Popconfirm
                title={`${t("common.discardChanges")}?`}
                onConfirm={cancelEditing}
                okText={t("equipment.yes")}
                cancelText={t("equipment.no")}
              >
                <AntButton
                  type="text"
                  icon={<CloseOutlined />}
                  style={{ marginRight: 8, color: "red" }}
                />
              </Popconfirm>
            </span>
          );
        }
        return (
          <Typography.Link
            disabled={editingKey !== null}
            onClick={() => startEditing(record)}
          >
            <EditOutlined />
          </Typography.Link>
        );
      },
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