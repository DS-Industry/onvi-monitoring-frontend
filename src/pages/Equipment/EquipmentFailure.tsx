import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Drawer, Form, Select, Table, Tooltip } from 'antd';
import { getDateRender } from '@/utils/tableUnits';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { ColumnsType } from 'antd/es/table';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useUser } from '@/hooks/useUserStore';

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
      shouldRetryOnError: false,
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
  const user = useUser();

  const { data: posData } = useSWR(
    [`get-pos`, cityParam],
    () => getPoses({ placementId: cityParam }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: deviceData } = useSWR(
    formData.posId !== 0 ? [`get-device`, formData.posId] : null,
    () => getDevices(formData.posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: equipmentKnotData } = useSWR(
    formData.posId !== 0 ? [`get-equipment-knot`, formData.posId] : null,
    () => getEquipmentKnots(formData.posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
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
      shouldRetryOnError: false,
    }
  );

  const { data: allProgramsData } = useSWR(
    formData.posId !== 0 ? [`get-all-programs`, formData.posId] : null,
    () => getPrograms({ posId: Number(formData.posId) || undefined }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

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
        posName: posData?.find(pos => pos.id === item.posId)?.name || '-',
        workerName:
          workerData?.find(work => work.id === item.workerId)?.name || '-',
        programName:
          programs.find(prog => prog.value === item.programId)?.name || '-',
      }))
      .sort((a, b) => a.id - b.id) || [];

  const reasons: { label: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          incidentEquipmentKnotData
            ?.flatMap(item =>
              item.reason.map(reas => ({
                label: reas.infoName,
                value: reas.id,
              }))
            )
            .filter(
              (reason, index, self) =>
                index === self.findIndex(r => r.value === reason.value)
            ) || []
        ).sort((a, b) => a.label.localeCompare(b.label));

  const solutions: { label: string; value: number }[] =
    formData.posId === 0
      ? []
      : (
          incidentEquipmentKnotData
            ?.flatMap(item =>
              item.solution.map(sol => ({
                label: sol.infoName,
                value: sol.id,
              }))
            )
            .filter(
              (reason, index, self) =>
                index === self.findIndex(r => r.value === reason.value)
            ) || []
        ).sort((a, b) => a.label.localeCompare(b.label));

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
      const knotNameToId: { [key: string]: number } = equipmentKnotData
        ? equipmentKnotData.reduce(
            (acc, eq) => ({ ...acc, [eq.props.name]: eq.props.id }),
            {}
          )
        : {};

      const problemNameToId: { [key: string]: number } =
        incidentEquipmentKnotData
          ? incidentEquipmentKnotData.reduce(
              (acc, item) => ({ ...acc, [item.problemName]: item.id }),
              {}
            )
          : {};

      const reasonLabelToValue: { [key: string]: number } = reasons
        ? reasons.reduce((acc, r) => ({ ...acc, [r.label]: r.value }), {})
        : {};

      const solutionLabelToValue: { [key: string]: number } = solutions
        ? solutions.reduce((acc, s) => ({ ...acc, [s.label]: s.value }), {})
        : {};

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
        equipmentKnotId:
          knotNameToId[incidentToEdit.equipmentKnot] || undefined,
        incidentNameId:
          problemNameToId[incidentToEdit.incidentName] || undefined,
        incidentReasonId:
          reasonLabelToValue[incidentToEdit.incidentReason] || undefined,
        incidentSolutionId:
          solutionLabelToValue[incidentToEdit.incidentSolution] || undefined,
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
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.equipmentFailure')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <div className="hidden sm:flex">{t('routes.fix')}</div>
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
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('equipment.carWash')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.posId?.message}
              validateStatus={errors.posId ? 'error' : undefined}
            >
              <Select
                placeholder={t('pos.companyName')}
                options={posData?.map(item => ({
                  value: item.id,
                  label: item.name,
                }))}
                className="!w-72"
                {...register('posId', {
                  required: !isEditMode && t('validation.posRequired'),
                  validate: value =>
                    value !== 0 || isEditMode || t('validation.posRequired'),
                })}
                value={formData.posId === 0 ? undefined : formData.posId}
                onChange={value => {
                  handleInputChange('posId', String(value));
                  updateSearchParams(searchParams, setSearchParams, {
                    posId: value,
                  });
                }}
                status={errors.posId ? 'error' : ''}
                showSearch={true}
                notFoundContent={t('table.noData')}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">
                {t('equipment.employee')}
              </div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.workerId?.message}
              validateStatus={errors.workerId ? 'error' : undefined}
            >
              <Select
                placeholder={
                  workerData?.length === 0
                    ? t('warehouse.noVal')
                    : t('warehouse.notSel')
                }
                options={workerData?.map(item => ({
                  value: item.id,
                  label: item.name,
                }))}
                className="!w-72"
                {...register('workerId', {
                  required: !isEditMode && t('validation.workerRequired'),
                  validate: value =>
                    value !== 0 || isEditMode || t('validation.workerRequired'),
                })}
                value={formData.workerId === 0 ? undefined : formData.workerId}
                onChange={value => {
                  handleInputChange('workerId', String(value));
                }}
                status={errors.workerId ? 'error' : ''}
                showSearch={true}
                notFoundContent={t('table.noData')}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
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
              required: !isEditMode && t('validation.appearanceDateRequired'),
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
              required: !isEditMode && t('validation.startDateRequired'),
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
              required: !isEditMode && t('validation.finishDateRequired'),
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
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('equipment.device')}</div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.objectName?.message}
              validateStatus={errors.objectName ? 'error' : undefined}
            >
              <Select
                placeholder={
                  deviceData?.length === 0
                    ? t('warehouse.noVal')
                    : t('warehouse.notSel')
                }
                options={deviceData?.map(item => ({
                  value: item.props.name,
                  label: item.props.name,
                }))}
                className="!w-72"
                {...register('objectName', {
                  required: !isEditMode && t('validation.deviceRequired'),
                })}
                value={formData.objectName}
                onChange={value => {
                  handleInputChange('objectName', value);
                }}
                status={errors.objectName ? 'error' : ''}
                showSearch={true}
                notFoundContent={t('table.noData')}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('equipment.knot')}</div>
            <Form.Item>
              <Select
                placeholder={
                  equipmentKnotData?.length === 0
                    ? t('warehouse.noVal')
                    : t('warehouse.notSel')
                }
                options={equipmentKnotData?.map(item => ({
                  value: item.props.id,
                  label: item.props.name,
                }))}
                className="!w-72"
                {...register('equipmentKnotId')}
                value={formData.equipmentKnotId}
                onChange={value => {
                  handleInputChange('equipmentKnotId', String(value));
                }}
                showSearch={true}
                notFoundContent={t('table.noData')}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('equipment.name')}</div>
            <Form.Item>
              <Select
                placeholder={
                  incidentEquipmentKnotData?.length === 0
                    ? t('warehouse.noVal')
                    : t('warehouse.notSel')
                }
                options={incidentEquipmentKnotData?.map(item => ({
                  value: item.id,
                  label: item.problemName,
                }))}
                className="!w-72"
                {...register('incidentNameId')}
                value={formData.incidentNameId}
                onChange={value => {
                  handleInputChange('incidentNameId', String(value));
                }}
                showSearch={true}
                notFoundContent={t('table.noData')}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('equipment.cause')}</div>
            <Form.Item>
              <Select
                placeholder={
                  incidentEquipmentKnotData?.length === 0
                    ? t('warehouse.noVal')
                    : t('warehouse.notSel')
                }
                options={incidentEquipmentKnotData?.map(item => ({
                  value: item.id,
                  label: item.reason,
                }))}
                className="!w-72"
                {...register('incidentReasonId')}
                value={formData.incidentReasonId}
                onChange={value => {
                  handleInputChange('incidentReasonId', String(value));
                }}
                showSearch={true}
                notFoundContent={t('table.noData')}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-text02 text-sm">{t('equipment.measures')}</div>
            <Form.Item>
              <Select
                placeholder={
                  incidentEquipmentKnotData?.length === 0
                    ? t('warehouse.noVal')
                    : t('warehouse.notSel')
                }
                options={incidentEquipmentKnotData?.map(item => ({
                  value: item.id,
                  label: item.solution,
                }))}
                className="!w-72"
                {...register('incidentSolutionId')}
                value={formData.incidentSolutionId}
                onChange={value => {
                  handleInputChange('incidentSolutionId', String(value));
                }}
                showSearch={true}
                notFoundContent={t('table.noData')}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
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
                    required: !isEditMode && t('validation.downtimeRequired'),
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
                    required: !isEditMode && t('validation.downtimeRequired'),
                  })}
                  onChange={e => handleInputChange('downtime', e.target.value)}
                  className="mr-2"
                />
                {t('equipment.no')}
              </label>
            </div>
            {errors.downtime && (
              <div className={`text-[11px] font-normal text-errorFill`}>
                {t('validation.downtimeRequired')}
              </div>
            )}
          </div>
          <div>
            <div className="text-text02 text-sm">{t('equipment.program')}</div>
            <Form.Item>
              <Select
                placeholder={
                  allProgramsData?.length === 0
                    ? t('warehouse.noVal')
                    : t('warehouse.notSel')
                }
                options={allProgramsData?.map(item => ({
                  value: item.props.id,
                  label: item.props.name,
                }))}
                className="!w-72"
                {...register('carWashDeviceProgramsTypeId')}
                value={formData.carWashDeviceProgramsTypeId}
                onChange={value => {
                  handleInputChange(
                    'carWashDeviceProgramsTypeId',
                    String(value)
                  );
                }}
                showSearch={true}
                notFoundContent={t('table.noData')}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
          <MultilineInput
            title={t('equipment.comment')}
            classname="w-96"
            value={formData.comment}
            changeValue={e => handleInputChange('comment', e.target.value)}
            error={!!errors.comment}
            {...register('comment', {
              required: !isEditMode && t('validation.commentRequired'),
            })}
            helperText={errors.comment?.message || ''}
          />
          <div className="flex space-x-4">
            <Button
              onClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
            >
              {t('organizations.cancel')}
            </Button>
            <Button
              htmlType={'submit'}
              loading={isEditMode ? updatingIncident : isMutating}
              type="primary"
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
