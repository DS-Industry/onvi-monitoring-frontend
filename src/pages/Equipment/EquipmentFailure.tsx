import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import MultilineInput from '@/components/ui/Input/MultilineInput';
import { useToast } from '@/components/context/useContext';
import useSWR, { mutate } from 'swr';
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
} from '@/services/api/equipment';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import DateTimeInput from '@/components/ui/Input/DateTimeInput';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { Drawer, Table, Tooltip } from 'antd';
import { getDateRender } from '@/utils/tableUnits';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { ColumnsType } from 'antd/es/table';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

const EquipmentFailure: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIncidentId, setEditIncidentId] = useState<number>(0);
  const today = dayjs().toDate();
  const formattedDate = today.toISOString().slice(0, 10);
  const [deviceCheck, setDeviceCheck] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const posId = Number(searchParams.get('posId')) || undefined;
  const dateStart = searchParams.get('dateStart') || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${formattedDate} 23:59`;
  const cityParam = Number(searchParams.get('city')) || undefined;
  const userPermissions = usePermissions();
  const { showToast } = useToast();

  const filterParams = {
    dateStart,
    dateEnd,
    posId: posId,
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
    appearanceDate: '',
    startDate: '',
    finishDate: '',
    objectName: '',
    equipmentKnotId: undefined,
    incidentNameId: undefined,
    incidentReasonId: undefined,
    incidentSolutionId: undefined,
    downtime: 2,
    comment: '',
    carWashDeviceProgramsTypeId: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { data: posData } = useSWR(
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
    () => getPrograms({ posId: Number(formData.posId) || undefined }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const poses: { name: string; value: number | string }[] = (
    posData?.map(item => ({ name: item.name, value: item.id })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const workers: { name: string; value: number }[] = (
    workerData?.map(item => ({ name: `${item.name} ${item.surname}`, value: item.id })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const programs: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          allProgramsData?.map(item => ({
            name: item.props.name,
            value: item.props.id,
          })) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const incidents: Incident[] =
    data
      ?.map((item: Incident) => ({
        ...item,
        posName: poses.find(pos => pos.value === item.posId)?.name || '-',
        workerName:
          workers.find(work => work.value === item.workerId)?.name || '-',
        programName:
          programs.find(prog => prog.value === item.programId)?.name || '-',
      }))
      .sort((a, b) => a.id - b.id) || [];

  const devices: { name: string; value: string }[] =
    formData.posId === 0
      ? []
      : (
          deviceData?.map(item => ({
            name: item.props.name,
            value: item.props.name,
          })) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const equipmentKnots: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          equipmentKnotData?.map(item => ({
            name: item.props.name,
            value: item.props.id,
          })) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const problemNames: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          incidentEquipmentKnotData?.map(item => ({
            name: item.problemName,
            value: item.id,
          })) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const reasons: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          incidentEquipmentKnotData
            ?.flatMap(item =>
              item.reason.map(reas => ({
                name: reas.infoName,
                value: reas.id,
              }))
            )
            .filter(
              (reason, index, self) =>
                index === self.findIndex(r => r.value === reason.value)
            ) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const solutions: { name: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          incidentEquipmentKnotData
            ?.flatMap(item =>
              item.solution.map(sol => ({
                name: sol.infoName,
                value: sol.id,
              }))
            )
            .filter(
              (reason, index, self) =>
                index === self.findIndex(r => r.value === reason.value)
            ) || []
        ).sort((a, b) => a.name.localeCompare(b.name));

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createInc, isMutating } = useSWRMutation(
    ['create-incident'],
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
    ['update-incident'],
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

  type FieldType = keyof typeof defaultValues;

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = [
      'downtime',
      'posId',
      'workerId',
      'equipmentKnotId',
      'incidentNameId',
      'incidentReasonId',
      'incidentSolutionId',
      'carWashDeviceProgramsTypeId',
    ];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handleUpdate = (id: number) => {
    setEditIncidentId(id);
    setIsEditMode(true);
    setDrawerOpen(true);
    const incidentToEdit = incidents.find(org => org.id === id);

    if (incidentToEdit) {
      const formatDateTime = (dateString: Date) => {
        return dayjs(dateString).format('YYYY-MM-DDTHH:mm');
      };

      setFormData({
        posId: incidentToEdit.posId,
        workerId: incidentToEdit.workerId,
        appearanceDate: formatDateTime(incidentToEdit.appearanceDate),
        startDate: formatDateTime(incidentToEdit.startDate),
        finishDate: formatDateTime(incidentToEdit.finishDate),
        objectName: incidentToEdit.objectName,
        equipmentKnotId: equipmentKnots.find(
          equipmentKnot => equipmentKnot.name === incidentToEdit.equipmentKnot
        )
          ? Number(
              equipmentKnots.find(
                equipmentKnot =>
                  equipmentKnot.name === incidentToEdit.equipmentKnot
              )?.value
            )
          : 0,
        incidentNameId: problemNames.find(
          incidentName => incidentName.name === incidentToEdit.equipmentKnot
        )
          ? Number(
              problemNames.find(
                incidentName =>
                  incidentName.name === incidentToEdit.incidentName
              )?.value
            )
          : 0,
        incidentReasonId: reasons.find(
          reason => reason.name === incidentToEdit.equipmentKnot
        )
          ? Number(
              reasons.find(
                reason => reason.name === incidentToEdit.incidentReason
              )?.value
            )
          : 0,
        incidentSolutionId: solutions.find(
          solution => solution.name === incidentToEdit.equipmentKnot
        )
          ? Number(
              solutions.find(
                solution => solution.name === incidentToEdit.incidentSolution
              )?.value
            )
          : 0,
        downtime: incidentToEdit.downtime === 'Нет' ? 0 : 1,
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
    setDrawerOpen(false);
  };

  const onSubmit = async () => {
    try {
      if (editIncidentId) {
        const result = await updateInc();
        if (result) {
          mutate(swrKey);
          resetForm();
        } else {
          throw new Error('Invalid update data.');
        }
      } else {
        const result = await createInc();
        if (result) {
          mutate(swrKey);
          resetForm();
        } else {
          throw new Error('Invalid response from API');
        }
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const dateRender = getDateRender();

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Incident' },
    { action: 'update', subject: 'Incident' },
  ]);

  const columnsEquipmentFailure: ColumnsType<Incident> = [
    {
      title: 'Название объекта',
      dataIndex: 'posName',
      key: 'posName',
    },
    {
      title: 'Сотрудник',
      dataIndex: 'workerName',
      key: 'workerName',
    },
    {
      title: 'Дата поломки',
      dataIndex: 'appearanceDate',
      key: 'appearanceDate',
      render: dateRender,
    },
    {
      title: 'Дата начала работы',
      dataIndex: 'startDate',
      key: 'startDate',
      render: dateRender,
    },
    {
      title: 'Дата окончания работы',
      dataIndex: 'finishDate',
      key: 'finishDate',
      render: dateRender,
    },
    {
      title: 'Устройство',
      dataIndex: 'objectName',
      key: 'objectName',
    },
    {
      title: 'Узел',
      dataIndex: 'equipmentKnot',
      key: 'equipmentKnot',
      render: (value: string) => <div>{value ? value : '-'}</div>,
    },
    {
      title: 'Проблема',
      dataIndex: 'incidentName',
      key: 'incidentName',
      render: (value: string) => <div>{value ? value : '-'}</div>,
    },
    {
      title: 'Причина',
      dataIndex: 'incidentReason',
      key: 'incidentReason',
      render: (value: string) => <div>{value ? value : '-'}</div>,
    },
    {
      title: 'Принятые меры',
      dataIndex: 'incidentSolution',
      key: 'incidentSolution',
      render: (value: string) => <div>{value ? value : '-'}</div>,
    },
    {
      title: 'Время исправления',
      dataIndex: 'repair',
      key: 'repair',
    },
    {
      title: 'Простой',
      dataIndex: 'downtime',
      key: 'downtime',
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: 'Программа',
      dataIndex: 'programName',
      key: 'programName',
    },
  ];

  if (allowed) {
    columnsEquipmentFailure.push({
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: unknown, record: { id: number }) => (
        <Tooltip title="Редактировать">
          <Button
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: '24px' }}
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
  } = useColumnSelector(columnsEquipmentFailure, 'equipment-failure-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.equipmentFailure')}
          </span>
          <QuestionMarkIcon />
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            {t('routes.fix')}
          </Button>
        )}
      </div>
      <GeneralFilters
        count={incidents.length}
        display={['city', 'pos', 'dateTime', 'reset', 'count']}
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
          scroll={{ x: 'max-content' }}
        />
      </div>
      <Drawer
        title={t('equipment.break')}
        placement="right"
        size="large"
        onClose={resetForm}
        open={drawerOpen}
        className="custom-drawer"
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <DropdownInput
            title={t('equipment.carWash')}
            label={
              poses.length === 0 ? t('warehouse.noVal') : t('warehouse.notSel')
            }
            options={poses}
            classname="w-72"
            {...register('posId', {
              required: !isEditMode && t("validation.posRequired"),
              validate: value =>
                value !== 0 || isEditMode || t("validation.posRequired"),
            })}
            value={formData.posId}
            onChange={value => {
              handleInputChange('posId', value);
              updateSearchParams(searchParams, setSearchParams, {
                posId: value,
              });
            }}
            error={!!errors.posId}
            helperText={errors.posId?.message}
            isDisabled={isEditMode}
          />
          <DropdownInput
            title={t('equipment.employee')}
            label={
              workers.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={workers}
            classname="w-72"
            {...register('workerId', {
              required: !isEditMode && t("validation.workerRequired"),
              validate: value =>
                value !== 0 || isEditMode || t("validation.workerRequired"),
            })}
            value={formData.workerId}
            onChange={value => handleInputChange('workerId', value)}
            error={!!errors.workerId}
            helperText={errors.workerId?.message}
          />
          <DateTimeInput
            title={t('equipment.call')}
            classname="w-64"
            value={
              formData.appearanceDate
                ? dayjs(formData.appearanceDate)
                : undefined
            }
            changeValue={date =>
              handleInputChange(
                'appearanceDate',
                date ? date.format('YYYY-MM-DDTHH:mm') : ''
              )
            }
            error={!!errors.appearanceDate}
            {...register('appearanceDate', {
              required: !isEditMode && t("validation.appearanceDateRequired")
            })}
            helperText={errors.appearanceDate?.message || ''}
          />
          <DateTimeInput
            title={t('equipment.start')}
            classname="w-64"
            value={formData.startDate ? dayjs(formData.startDate) : undefined}
            changeValue={date =>
              handleInputChange(
                'startDate',
                date ? date.format('YYYY-MM-DDTHH:mm') : ''
              )
            }
            error={!!errors.startDate}
            {...register('startDate', {
              required: !isEditMode && t("validation.startDateRequired"),
            })}
            helperText={errors.startDate?.message || ''}
          />
          <DateTimeInput
            title={t('equipment.end')}
            classname="w-64"
            value={formData.finishDate ? dayjs(formData.finishDate) : undefined}
            changeValue={date =>
              handleInputChange(
                'finishDate',
                date ? date.format('YYYY-MM-DDTHH:mm') : ''
              )
            }
            error={!!errors.finishDate}
            {...register('finishDate', {
              required: !isEditMode && t("validation.finishDateRequired"),
            })}
            helperText={errors.finishDate?.message || ''}
          />
          <div className="flex">
            <input
              type="checkbox"
              checked={deviceCheck}
              onChange={e => {
                setDeviceCheck(e.target.checked);
                handleInputChange('objectName', 'Вся мойка');
              }}
            />
            <div className="text-text02 ml-2">{t('equipment.whole')}</div>
          </div>
          <DropdownInput
            title={t('equipment.device')}
            label={
              devices.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={devices}
            classname="w-72"
            {...register('objectName', {
              required: !isEditMode && t("validation.deviceRequired"),
            })}
            value={formData.objectName}
            onChange={value => handleInputChange('objectName', value)}
            error={!!errors.objectName}
            helperText={errors.objectName?.message}
            isDisabled={deviceCheck}
          />
          <DropdownInput
            title={t('equipment.knot')}
            label={
              equipmentKnots.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={equipmentKnots}
            classname="w-72"
            {...register('equipmentKnotId')}
            value={formData.equipmentKnotId}
            onChange={value => handleInputChange('equipmentKnotId', value)}
          />
          <DropdownInput
            title={t('equipment.name')}
            label={
              problemNames.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={problemNames}
            classname="w-72"
            {...register('incidentNameId')}
            value={formData.incidentNameId}
            onChange={value => handleInputChange('incidentNameId', value)}
          />
          <DropdownInput
            title={t('equipment.cause')}
            label={
              reasons.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={reasons}
            classname="w-72"
            {...register('incidentReasonId')}
            value={formData.incidentReasonId}
            onChange={value => handleInputChange('incidentReasonId', value)}
          />
          <DropdownInput
            title={t('equipment.measures')}
            label={
              solutions.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={solutions}
            classname="w-72"
            {...register('incidentSolutionId')}
            value={formData.incidentSolutionId}
            onChange={value => handleInputChange('incidentSolutionId', value)}
          />
          <div className="space-y-2">
            <div className="text-text02 text-sm font-semibold">
              {t('equipment.simple')}
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={1}
                  checked={formData.downtime === 1}
                  className="mr-2"
                  {...register('downtime', {
                    required: !isEditMode && t("validation.downtimeRequired"),
                  })}
                  onChange={e => handleInputChange('downtime', e.target.value)}
                />
                {t('equipment.yes')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={0}
                  checked={formData.downtime === 0}
                  {...register('downtime', {
                    required: !isEditMode && t("validation.downtimeRequired"),
                  })}
                  onChange={e => handleInputChange('downtime', e.target.value)}
                  className="mr-2"
                />
                {t('equipment.no')}
              </label>
            </div>
            {errors.downtime && (
              <div className={`text-[11px] font-normal text-errorFill`}>
                {t("validation.downtimeRequired")}
              </div>
            )}
          </div>
          <DropdownInput
            title={t('equipment.program')}
            label={
              programs.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={programs}
            classname="w-72"
            {...register('carWashDeviceProgramsTypeId')}
            value={formData.carWashDeviceProgramsTypeId}
            onChange={value =>
              handleInputChange('carWashDeviceProgramsTypeId', value)
            }
          />
          <MultilineInput
            title={t('equipment.comment')}
            classname="w-96"
            value={formData.comment}
            changeValue={e => handleInputChange('comment', e.target.value)}
            error={!!errors.comment}
            {...register('comment', {
              required: !isEditMode && t("validation.commentRequired"),
            })}
            helperText={errors.comment?.message || ''}
          />
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
              className="btn-outline-primary"
            >
              {t('organizations.cancel')}
            </Button>
            <Button
              htmlType={'submit'}
              loading={isEditMode ? updatingIncident : isMutating}
              className="btn-primary"
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default EquipmentFailure;
