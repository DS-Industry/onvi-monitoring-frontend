import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Button from "@/components/ui/Button/Button";
import { useButtonCreate, useToast } from "@/components/context/useContext";
import useSWR, { mutate } from "swr";
import {
  createIncident,
  getDevices,
  getEquipmentKnots,
  getIncident,
  getIncidentEquipmentKnots,
  getPoses,
  getPrograms,
  getWorkers,
  Incident,
  IncidentBody,
  updateIncident,
} from "@/services/api/equipment";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import DateTimeInput from "@/components/ui/Input/DateTimeInput";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import { Table, Tooltip } from "antd";
import { getDateRender } from "@/utils/tableUnits";
import { usePermissions } from "@/hooks/useAuthStore";
import hasPermission from "@/permissions/hasPermission";
import { ColumnsType } from "antd/es/table";
import { EditOutlined } from "@ant-design/icons";
import AntDButton from "antd/es/button";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";

const EquipmentFailure: React.FC = () => {
  const { t } = useTranslation();
  const allCategoriesText = t("warehouse.all");
  const { buttonOn, setButtonOn } = useButtonCreate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIncidentId, setEditIncidentId] = useState<number>(0);
  const today = dayjs().toDate();
  const formattedDate = today.toISOString().slice(0, 10);
  const [deviceCheck, setDeviceCheck] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const posId = searchParams.get("posId") || "*";
  const dateStart = searchParams.get("dateStart") || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get("dateEnd") || `${formattedDate} 23:59`;
  const cityParam = searchParams.get("city") || "*";
  const userPermissions = usePermissions();
  const { showToast } = useToast();

  const filterParams = {
    dateStart,
    dateEnd,
    posId: posId || "*",
    placementId: cityParam,
  };
  const swrKey = `get-incidents-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}`;

  const { data, isLoading: incidentLoading } = useSWR(
    swrKey,
    () => getIncident(filterParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const defaultValues: IncidentBody = {
    posId: 0,
    workerId: 0,
    appearanceDate: "",
    startDate: "",
    finishDate: "",
    objectName: "",
    equipmentKnotId: undefined,
    incidentNameId: undefined,
    incidentReasonId: undefined,
    incidentSolutionId: undefined,
    downtime: 2,
    comment: "",
    carWashDeviceProgramsTypeId: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const {
    data: posData,
    isLoading: loadingPos,
    isValidating: validatingPos,
  } = useSWR(
    [`get-pos`, cityParam],
    () => getPoses({ placementId: cityParam }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const { data: deviceData } = useSWR(
    formData.posId !== 0 ? [`get-device`, formData.posId] : null,
    () => getDevices(formData.posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: equipmentKnotData } = useSWR(
    formData.posId !== 0 ? [`get-equipment-knot`, formData.posId] : null,
    () => getEquipmentKnots(formData.posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: incidentEquipmentKnotData } = useSWR(
    equipmentKnotData ? [`get-incident-equipment-knot`] : null,
    () =>
      getIncidentEquipmentKnots(
        equipmentKnotData ? equipmentKnotData[0].props.id : 0
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: allProgramsData } = useSWR(
    formData.posId !== 0 ? [`get-all-programs`, formData.posId] : null,
    () => getPrograms({ posId: formData.posId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const poses: { name: string; value: number | string }[] = (
    posData?.map((item) => ({ name: item.name, value: item.id })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const posesAllObj = {
    name: allCategoriesText,
    value: "*",
  };

  const workers: { name: string; value: number }[] = (
    workerData?.map((item) => ({ name: item.name, value: item.id })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const programs: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          allProgramsData?.map((item) => ({
            name: item.props.name,
            value: item.props.id,
          })) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const incidents: Incident[] =
    data
      ?.map((item: Incident) => ({
        ...item,
        posName: poses.find((pos) => pos.value === item.posId)?.name || "-",
        workerName:
          workers.find((work) => work.value === item.workerId)?.name || "-",
        programName:
          programs.find((prog) => prog.value === item.programId)?.name || "-",
      }))
      .sort((a, b) => a.id - b.id) || [];

  const devices: { name: string; value: string }[] =
    formData.posId === 0
      ? []
      : (
          deviceData?.map((item) => ({
            name: item.props.name,
            value: item.props.name,
          })) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const equipmentKnots: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          equipmentKnotData?.map((item) => ({
            name: item.props.name,
            value: item.props.id,
          })) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const problemNames: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          incidentEquipmentKnotData?.map((item) => ({
            name: item.problemName,
            value: item.id,
          })) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const reasons: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          incidentEquipmentKnotData
            ?.flatMap((item) =>
              item.reason.map((reas) => ({
                name: reas.infoName,
                value: reas.id,
              }))
            )
            .filter(
              (reason, index, self) =>
                index === self.findIndex((r) => r.value === reason.value)
            ) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const solutions: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          incidentEquipmentKnotData
            ?.flatMap((item) =>
              item.solution.map((sol) => ({
                name: sol.infoName,
                value: sol.id,
              }))
            )
            .filter(
              (reason, index, self) =>
                index === self.findIndex((r) => r.value === reason.value)
            ) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createInc, isMutating } = useSWRMutation(
    ["create-incident"],
    async () =>
      createIncident({
        posId: formData.posId,
        workerId: formData.workerId,
        appearanceDate: formData.appearanceDate,
        startDate: formData.startDate,
        finishDate: formData.finishDate,
        objectName: formData.objectName,
        equipmentKnotId: formData.equipmentKnotId,
        incidentNameId: formData.incidentNameId,
        incidentReasonId: formData.incidentReasonId,
        incidentSolutionId: formData.incidentSolutionId,
        downtime: formData.downtime,
        comment: formData.comment,
        carWashDeviceProgramsTypeId: formData.carWashDeviceProgramsTypeId,
      })
  );

  const { trigger: updateInc, isMutating: updatingIncident } = useSWRMutation(
    ["update-incident"],
    async () =>
      updateIncident({
        incidentId: editIncidentId,
        workerId: formData.workerId,
        appearanceDate: formData.appearanceDate,
        startDate: formData.startDate,
        finishDate: formData.finishDate,
        objectName: formData.objectName,
        equipmentKnotId: formData.equipmentKnotId,
        incidentNameId: formData.incidentNameId,
        incidentReasonId: formData.incidentReasonId,
        incidentSolutionId: formData.incidentSolutionId,
        downtime: formData.downtime,
        comment: formData.comment,
        carWashDeviceProgramsTypeId: formData.carWashDeviceProgramsTypeId,
      })
  );

  type FieldType =
    | "posId"
    | "workerId"
    | "appearanceDate"
    | "startDate"
    | "finishDate"
    | "objectName"
    | "equipmentKnotId"
    | "incidentNameId"
    | "incidentReasonId"
    | "incidentSolutionId"
    | "downtime"
    | "comment"
    | "carWashDeviceProgramsTypeId";

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = [
      "downtime",
      "posId",
      "workerId",
      "equipmentKnotId",
      "incidentNameId",
      "incidentReasonId",
      "incidentSolutionId",
      "carWashDeviceProgramsTypeId",
    ];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handleUpdate = (id: number) => {
    setEditIncidentId(id);
    setIsEditMode(true);
    setButtonOn(true);
    const incidentToEdit = incidents.find((org) => org.id === id);

    if (incidentToEdit) {
      const formatDateTime = (dateString: Date) => {
        return dayjs(dateString).format("YYYY-MM-DDTHH:mm");
      };

      setFormData({
        posId: incidentToEdit.posId,
        workerId: incidentToEdit.workerId,
        appearanceDate: formatDateTime(incidentToEdit.appearanceDate),
        startDate: formatDateTime(incidentToEdit.startDate),
        finishDate: formatDateTime(incidentToEdit.finishDate),
        objectName: incidentToEdit.objectName,
        equipmentKnotId: equipmentKnots.find(
          (equipmentKnot) => equipmentKnot.name === incidentToEdit.equipmentKnot
        )
          ? Number(
              equipmentKnots.find(
                (equipmentKnot) =>
                  equipmentKnot.name === incidentToEdit.equipmentKnot
              )?.value
            )
          : 0,
        incidentNameId: problemNames.find(
          (incidentName) => incidentName.name === incidentToEdit.equipmentKnot
        )
          ? Number(
              problemNames.find(
                (incidentName) =>
                  incidentName.name === incidentToEdit.incidentName
              )?.value
            )
          : 0,
        incidentReasonId: reasons.find(
          (reason) => reason.name === incidentToEdit.equipmentKnot
        )
          ? Number(
              reasons.find(
                (reason) => reason.name === incidentToEdit.incidentReason
              )?.value
            )
          : 0,
        incidentSolutionId: solutions.find(
          (solution) => solution.name === incidentToEdit.equipmentKnot
        )
          ? Number(
              solutions.find(
                (solution) => solution.name === incidentToEdit.incidentSolution
              )?.value
            )
          : 0,
        downtime: incidentToEdit.downtime === "Нет" ? 0 : 1,
        comment: incidentToEdit.comment,
        carWashDeviceProgramsTypeId: incidentToEdit.programId,
      });
    }
  };

  const resetForm = () => {
    setFormData(defaultValues);
    setIsEditMode(false);
    reset();
    setEditIncidentId(0);
    setButtonOn(false);
  };

  const onSubmit = async () => {
    try {
      if (editIncidentId) {
        const result = await updateInc();
        if (result) {
          mutate(swrKey);
          resetForm();
        } else {
          throw new Error("Invalid update data.");
        }
      } else {
        const result = await createInc();
        if (result) {
          mutate(swrKey);
          resetForm();
        } else {
          throw new Error("Invalid response from API");
        }
      }
    } catch (error) {
      console.error("Error during form submission: ", error);
      showToast(t("errors.other.errorDuringFormSubmission"), "error");
    }
  };

  const dateRender = getDateRender();

  const allowed = hasPermission(userPermissions, [
    { action: "manage", subject: "Incident" },
    { action: "update", subject: "Incident" },
  ]);

  const columnsEquipmentFailure: ColumnsType<Incident> = [
    {
      title: "Название объекта",
      dataIndex: "posName",
      key: "posName",
    },
    {
      title: "Сотрудник",
      dataIndex: "workerName",
      key: "workerName",
    },
    {
      title: "Дата поломки",
      dataIndex: "appearanceDate",
      key: "appearanceDate",
      render: dateRender,
    },
    {
      title: "Дата начала работы",
      dataIndex: "startDate",
      key: "startDate",
      render: dateRender,
    },
    {
      title: "Дата окончания работы",
      dataIndex: "finishDate",
      key: "finishDate",
      render: dateRender,
    },
    {
      title: "Устройство",
      dataIndex: "objectName",
      key: "objectName",
    },
    {
      title: "Узел",
      dataIndex: "equipmentKnot",
      key: "equipmentKnot",
      render: (value: string) => <div>{value ? value : "-"}</div>,
    },
    {
      title: "Проблема",
      dataIndex: "incidentName",
      key: "incidentName",
      render: (value: string) => <div>{value ? value : "-"}</div>,
    },
    {
      title: "Причина",
      dataIndex: "incidentReason",
      key: "incidentReason",
      render: (value: string) => <div>{value ? value : "-"}</div>,
    },
    {
      title: "Принятые меры",
      dataIndex: "incidentSolution",
      key: "incidentSolution",
      render: (value: string) => <div>{value ? value : "-"}</div>,
    },
    {
      title: "Время исправления",
      dataIndex: "repair",
      key: "repair",
    },
    {
      title: "Простой",
      dataIndex: "downtime",
      key: "downtime",
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: "Программа",
      dataIndex: "programName",
      key: "programName",
    },
  ];

  if (allowed) {
    columnsEquipmentFailure.push({
      title: "",
      dataIndex: "actions",
      key: "actions",
      render: (_: unknown, record: { id: number }) => (
        <Tooltip title="Редактировать">
          <AntDButton
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: "24px" }}
          />
        </Tooltip>
      ),
    });
  }
  const {
    checkedList,
    setCheckedList,
    options: columnOptions,
    visibleColumns,
  } = useColumnSelector(columnsEquipmentFailure, "equipment-failure-columns");

  return (
    <>
      <GeneralFilters
        count={incidents.length}
        poses={[...poses, posesAllObj]}
        hideSearch={true}
        loadingPos={loadingPos || validatingPos}
      />
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={columnOptions}
          onChange={setCheckedList}
        />
        <Table
          dataSource={incidents}
          columns={visibleColumns}
          rowKey="id"
          pagination={false}
          loading={incidentLoading}
          scroll={{ x: "max-content" }}
        />
      </div>
      <DrawerCreate onClose={resetForm}>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <span className="font-semibold text-xl md:text-3xl mb-5 text-text01">
            {t("equipment.break")}
          </span>
          <DropdownInput
            title={t("equipment.carWash")}
            label={
              poses.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")
            }
            options={poses}
            classname="w-72"
            {...register("posId", {
              required: !isEditMode && "Pos ID is required",
              validate: (value) =>
                value !== 0 || isEditMode || "Pos ID is required",
            })}
            value={formData.posId}
            onChange={(value) => {
              handleInputChange("posId", value);
              updateSearchParams(searchParams, setSearchParams, {
                posId: value,
              });
            }}
            error={!!errors.posId}
            helperText={errors.posId?.message}
            isDisabled={isEditMode}
          />
          <DropdownInput
            title={t("equipment.employee")}
            label={
              workers.length === 0
                ? t("warehouse.noVal")
                : t("warehouse.notSel")
            }
            options={workers}
            classname="w-72"
            {...register("workerId", {
              required: !isEditMode && "Worker ID is required",
              validate: (value) =>
                value !== 0 || isEditMode || "Worker ID is required",
            })}
            value={formData.workerId}
            onChange={(value) => handleInputChange("workerId", value)}
            error={!!errors.workerId}
            helperText={errors.workerId?.message}
          />
          <DateTimeInput
            title={t("equipment.call")}
            classname="w-64"
            value={
              formData.appearanceDate
                ? dayjs(formData.appearanceDate)
                : undefined
            }
            changeValue={(date) =>
              handleInputChange(
                "appearanceDate",
                date ? date.format("YYYY-MM-DDTHH:mm") : ""
              )
            }
            error={!!errors.appearanceDate}
            {...register("appearanceDate", {
              required: !isEditMode && "Appearance Date is required",
            })}
            helperText={errors.appearanceDate?.message || ""}
          />
          <DateTimeInput
            title={t("equipment.start")}
            classname="w-64"
            value={formData.startDate ? dayjs(formData.startDate) : undefined}
            changeValue={(date) =>
              handleInputChange(
                "startDate",
                date ? date.format("YYYY-MM-DDTHH:mm") : ""
              )
            }
            error={!!errors.startDate}
            {...register("startDate", {
              required: !isEditMode && "Start Date is required",
            })}
            helperText={errors.startDate?.message || ""}
          />
          <DateTimeInput
            title={t("equipment.end")}
            classname="w-64"
            value={formData.finishDate ? dayjs(formData.finishDate) : undefined}
            changeValue={(date) =>
              handleInputChange(
                "finishDate",
                date ? date.format("YYYY-MM-DDTHH:mm") : ""
              )
            }
            error={!!errors.finishDate}
            {...register("finishDate", {
              required: !isEditMode && "Finish Date is required",
            })}
            helperText={errors.finishDate?.message || ""}
          />
          <div className="flex">
            <input
              type="checkbox"
              checked={deviceCheck}
              onChange={(e) => {
                setDeviceCheck(e.target.checked);
                handleInputChange("objectName", "Вся мойка");
              }}
            />
            <div className="text-text02 ml-2">{t("equipment.whole")}</div>
          </div>
          <DropdownInput
            title={t("equipment.device")}
            label={
              devices.length === 0
                ? t("warehouse.noVal")
                : t("warehouse.notSel")
            }
            options={devices}
            classname="w-72"
            {...register("objectName", {
              required: !isEditMode && "Device is required",
            })}
            value={formData.objectName}
            onChange={(value) => handleInputChange("objectName", value)}
            error={!!errors.objectName}
            helperText={errors.objectName?.message}
            isDisabled={deviceCheck}
          />
          <DropdownInput
            title={t("equipment.knot")}
            label={
              equipmentKnots.length === 0
                ? t("warehouse.noVal")
                : t("warehouse.notSel")
            }
            options={equipmentKnots}
            classname="w-72"
            {...register("equipmentKnotId")}
            value={formData.equipmentKnotId}
            onChange={(value) => handleInputChange("equipmentKnotId", value)}
          />
          <DropdownInput
            title={t("equipment.name")}
            label={
              problemNames.length === 0
                ? t("warehouse.noVal")
                : t("warehouse.notSel")
            }
            options={problemNames}
            classname="w-72"
            {...register("incidentNameId")}
            value={formData.incidentNameId}
            onChange={(value) => handleInputChange("incidentNameId", value)}
          />
          <DropdownInput
            title={t("equipment.cause")}
            label={
              reasons.length === 0
                ? t("warehouse.noVal")
                : t("warehouse.notSel")
            }
            options={reasons}
            classname="w-72"
            {...register("incidentReasonId")}
            value={formData.incidentReasonId}
            onChange={(value) => handleInputChange("incidentReasonId", value)}
          />
          <DropdownInput
            title={t("equipment.measures")}
            label={
              solutions.length === 0
                ? t("warehouse.noVal")
                : t("warehouse.notSel")
            }
            options={solutions}
            classname="w-72"
            {...register("incidentSolutionId")}
            value={formData.incidentSolutionId}
            onChange={(value) => handleInputChange("incidentSolutionId", value)}
          />
          <div className="space-y-2">
            <div className="text-text02 text-sm font-semibold">
              {t("equipment.simple")}
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={1}
                  checked={formData.downtime === 1}
                  className="mr-2"
                  {...register("downtime", {
                    required: !isEditMode && "Downtime is required",
                  })}
                  onChange={(e) =>
                    handleInputChange("downtime", e.target.value)
                  }
                />
                {t("equipment.yes")}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={0}
                  checked={formData.downtime === 0}
                  {...register("downtime", {
                    required: !isEditMode && "Downtime is required",
                  })}
                  onChange={(e) =>
                    handleInputChange("downtime", e.target.value)
                  }
                  className="mr-2"
                />
                {t("equipment.no")}
              </label>
            </div>
            {errors.downtime && (
              <div className={`text-[11px] font-normal text-errorFill`}>
                Downtime is required.
              </div>
            )}
          </div>
          <DropdownInput
            title={t("equipment.program")}
            label={
              programs.length === 0
                ? t("warehouse.noVal")
                : t("warehouse.notSel")
            }
            options={programs}
            classname="w-72"
            {...register("carWashDeviceProgramsTypeId")}
            value={formData.carWashDeviceProgramsTypeId}
            onChange={(value) =>
              handleInputChange("carWashDeviceProgramsTypeId", value)
            }
          />
          <MultilineInput
            title={t("equipment.comment")}
            classname="w-96"
            value={formData.comment}
            changeValue={(e) => handleInputChange("comment", e.target.value)}
            error={!!errors.comment}
            {...register("comment", {
              required: !isEditMode && "Comment is required",
            })}
            helperText={errors.comment?.message || ""}
          />
          <div className="flex justify-end space-x-4">
            <Button
              title={t("organizations.cancel")}
              type="outline"
              handleClick={() => {
                setButtonOn(!buttonOn);
                resetForm();
              }}
            />
            <Button
              title={t("organizations.save")}
              form={true}
              isLoading={isEditMode ? updatingIncident : isMutating}
              handleClick={() => {}}
            />
          </div>
        </form>
      </DrawerCreate>
    </>
  );
};

export default EquipmentFailure;
