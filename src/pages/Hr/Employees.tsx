import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { Table, Drawer, Button, Grid } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useToast } from '@/components/context/useContext';
import ProfilePhoto from '@/assets/ProfilePhoto.svg';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import DateInput from '@/components/ui/Input/DateInput';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import EmployeesFilter from '@/components/ui/Filter/EmployeesFilter';
import Input from '@/components/ui/Input/Input';
import MultilineInput from '@/components/ui/Input/MultilineInput';
import Notification from '@ui/Notification.tsx';
import useFormHook from '@/hooks/useFormHook';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import {
  createWorker,
  CreateWorkerRequest,
  getPositions,
  getWorkers,
  getWorkersCount,
  TWorker,
} from '@/services/api/hr';
import { getPlacement } from '@/services/api/device';
import { getOrganization } from '@/services/api/organization';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { PlusOutlined } from '@ant-design/icons';
import { useUser } from '@/hooks/useUserStore';
import hasPermission from '@/permissions/hasPermission';
import { usePermissions } from '@/hooks/useAuthStore';
import { formatRussianPhone } from '@/utils/tableUnits';

const Employees: React.FC = () => {
  const { t } = useTranslation();
  const allCategoriesText = t('warehouse.all');
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [notificationVisibleForm, setNotificationVisibleForm] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const city = Number(searchParams.get('city')) || undefined;
  const user = useUser();
  const userPermissions = usePermissions();

  const { showToast } = useToast();

  const screens = Grid.useBreakpoint();

  const { data: cityData } = useSWR([`get-city`], () => getPlacement(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const { data: organizationData } = useSWR(
    [`get-organization`],
    () => getOrganization({ placementId: city }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: positionData } = useSWR(
    [`get-positions`],
    () => getPositions(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const cities: { name: string; value: number }[] =
    cityData?.map(item => ({ name: item.region, value: item.id })) || [];

  const organizations: {
    name: string;
    value: number | string;
    label: string;
  }[] =
    organizationData?.map(item => ({
      name: item.name,
      value: item.id,
      label: item.name,
    })) || [];

  const allObj = {
    name: allCategoriesText,
    value: '*',
    label: allCategoriesText,
  };

  const positions: { name: string; value: number | string; label: string }[] =
    positionData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
      label: item.props.name,
    })) || [];

  const placementId = Number(searchParams.get('placementId')) || undefined;
  const hrPositionId = Number(searchParams.get('hrPositionId')) || undefined;
  const organizationId =
    Number(searchParams.get('organizationId')) || user.organizationId;
  const name = searchParams.get('name') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const { data: workersData, isLoading: workersLoading } = useSWR(
    [
      'get-workers',
      placementId,
      hrPositionId,
      organizationId,
      name,
      currentPage,
      pageSize,
    ],
    () =>
      getWorkers({
        placementId: placementId,
        hrPositionId: hrPositionId,
        organizationId: organizationId,
        name: name || undefined,
        page: currentPage,
        size: pageSize,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: workersCount } = useSWR(
    [
      'get-workers-count',
      placementId,
      hrPositionId,
      organizationId,
      name,
      currentPage,
      pageSize,
    ],
    () =>
      getWorkersCount({
        placementId: placementId,
        hrPositionId: hrPositionId,
        organizationId: organizationId,
        name: name || undefined,
        page: currentPage,
        size: pageSize,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const tableData =
    workersData?.map(item => ({
      ...item.props,
      placement: cities.find(city => city.value === item.props.placementId)
        ?.name,
      organization: organizations.find(
        org => org.value === item.props.organizationId
      )?.name,
      position: positions.find(pos => pos.value === item.props.hrPositionId)
        ?.name,
    })) || [];

  const defaultValues: CreateWorkerRequest = {
    name: '',
    hrPositionId: '',
    placementId: '',
    organizationId: user.organizationId || -1,
    startWorkDate: undefined,
    phone: undefined,
    email: undefined,
    description: undefined,
    monthlySalary: '',
    dailySalary: '',
    percentageSalary: '',
    gender: undefined,
    citizenship: undefined,
    passportSeries: undefined,
    passportNumber: undefined,
    passportExtradition: undefined,
    passportDateIssue: undefined,
    inn: undefined,
    snils: undefined,
    registrationAddress: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createEmp, isMutating } = useSWRMutation(
    ['create-employee'],
    async () =>
      createWorker(
        {
          name: formData.name,
          hrPositionId: String(formData.hrPositionId),
          placementId: String(formData.placementId),
          organizationId: formData.organizationId,
          startWorkDate: formData.startWorkDate,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
          monthlySalary: String(formData.monthlySalary),
          dailySalary: String(formData.dailySalary),
          percentageSalary: String(formData.percentageSalary),
          gender: formData.gender,
          citizenship: formData.citizenship,
          passportSeries: formData.passportSeries,
          passportNumber: formData.passportNumber,
          passportExtradition: formData.passportExtradition,
          passportDateIssue: formData.passportDateIssue,
          inn: formData.inn,
          snils: formData.snils,
          registrationAddress: formData.registrationAddress,
        },
        selectedFile
      )
  );

  type FieldType = keyof typeof formData;

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = ['monthlySalary', 'dailySalary', 'percentageSalary'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    let cleanValue = '+7' + input.replace(/\D/g, '').replace(/^7/, '');
    if (cleanValue.length > 12) cleanValue = cleanValue.slice(0, 12);

    setFormData(prev => ({ ...prev, phone: cleanValue }));
    setValue('phone', cleanValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setDrawerOpen(false);
  };

  const onSubmit = async () => {
    try {
      const result = await createEmp();
      if (result) {
        mutate([
          'get-workers',
          placementId,
          hrPositionId,
          organizationId,
          name,
          currentPage,
          pageSize,
        ]);
        mutate([
          'get-workers-count',
          placementId,
          hrPositionId,
          organizationId,
          name,
          currentPage,
          pageSize,
        ]);
        showToast(t('success.recordCreated'), 'success');
        resetForm();
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const columnsEmployee: ColumnsType<TWorker['props']> = [
    {
      title: 'ФИО Сотрудника',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return (
          <Link
            to={`/hr/employees/profile?workerId=${record.id}`}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: 'Город',
      dataIndex: 'placement',
      key: 'placement',
      render: value => value || '-',
    },
    {
      title: 'Организация',
      dataIndex: 'organization',
      key: 'organization',
      render: value => value || '-',
    },
    {
      title: 'Должность',
      dataIndex: 'position',
      key: 'position',
      render: value => value || '-',
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector<TWorker['props']>(columnsEmployee, 'employee-columns');

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Hr' },
    { action: 'update', subject: 'Hr' },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xl sm:text-3xl font-normal text-text01 ${screens.md ? '' : 'ml-12'}`}
          >
            {t('routes.employees')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className={`btn-primary ${screens.md ? '' : 'ant-btn-icon-only'}`}
            onClick={() => setDrawerOpen(true)}
          >
            {screens.md && t('routes.addE')}
          </Button>
        )}
      </div>
      <div className="mt-5">
        {notificationVisible && (
          <Notification
            title={t('routes.employees')}
            message={t('hr.to')}
            onClose={() => setNotificationVisible(false)}
            showEmp={true}
          />
        )}

        <EmployeesFilter
          count={workersCount?.count || 0}
          positions={[allObj, ...positions]}
          organizations={organizations}
        />

        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          className="custom-ant-table"
          rowKey="id"
          dataSource={tableData}
          columns={visibleColumns}
          scroll={{ x: 'max-content' }}
          loading={workersLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: workersCount?.count || 0,
            showSizeChanger: true,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} сотрудников`,
            onChange: (page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              });
            },
          }}
        />
      </div>
      <Drawer
        title={t('routes.addE')}
        placement="right"
        size="large"
        onClose={resetForm}
        open={drawerOpen}
        zIndex={9999}
      >
        <form
          className="w-full max-w-2xl mx-auto p-4 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {notificationVisibleForm && (
            <Notification
              title={t('hr.att')}
              message={t('hr.if')}
              message2={t('hr.ifThe')}
              onClose={() => setNotificationVisibleForm(false)}
            />
          )}
          <div className="flex">
            <span className="font-semibold text-sm text-text01">
              {t('routine.fields')}
            </span>
            <span className="text-errorFill">*</span>
            <span className="font-semibold text-sm text-text01">
              {t('routine.are')}
            </span>
          </div>
          <div className="font-semibold text-2xl text-text01">
            {t('warehouse.basic')}
          </div>
          <Input
            title={`${t('hr.full')}*`}
            label={t('hr.enter')}
            type={'text'}
            classname="w-80"
            value={formData.name}
            changeValue={e => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            {...register('name', { required: t('validation.nameRequired') })}
            helperText={errors.name?.message || ''}
          />
          <DropdownInput
            title={`${t('roles.job')}*`}
            label={t('hr.selectPos')}
            options={positions}
            classname="w-80"
            {...register('hrPositionId', {
              required: t('validation.positionRequired'),
              validate: value =>
                value !== '' || t('validation.positionRequired'),
            })}
            value={formData.hrPositionId}
            onChange={value => handleInputChange('hrPositionId', value)}
            error={!!errors.hrPositionId}
            helperText={errors.hrPositionId?.message || ''}
          />
          <DropdownInput
            title={`${t('pos.city')} *`}
            label={
              cities.length === 0 ? t('warehouse.noVal') : t('warehouse.notSel')
            }
            options={cities}
            classname="w-80"
            {...register('placementId', {
              required: t('validation.cityRequired'),
              validate: value => value !== '' || t('validation.cityRequired'),
            })}
            value={formData.placementId}
            onChange={value => handleInputChange('placementId', value)}
            error={!!errors.placementId}
            helperText={errors.placementId?.message}
          />
          <DropdownInput
            title={`${t('warehouse.organization')} *`}
            label={
              organizations.length === 0
                ? t('warehouse.noVal')
                : t('warehouse.notSel')
            }
            options={organizations}
            classname="w-80"
            {...register('organizationId', {
              required: t('validation.organizationRequired'),
              validate: value =>
                value !== -1 || t('validation.organizationRequired'),
            })}
            value={formData.organizationId}
            onChange={value => handleInputChange('organizationId', value)}
            error={!!errors.organizationId}
            helperText={errors.organizationId?.message}
          />
          <div>
            <div className="text-sm text-text02">{t('hr.date')}</div>
            <DateInput
              classname="w-80"
              value={
                formData.startWorkDate ? dayjs(formData.startWorkDate) : null
              }
              changeValue={date =>
                handleInputChange(
                  'startWorkDate',
                  date ? date.format('YYYY-MM-DD') : ''
                )
              }
              {...register('startWorkDate')}
            />
          </div>
          <Input
            type=""
            title={t('profile.telephone')}
            label={t('warehouse.enterPhone')}
            classname="w-80"
            value={formatRussianPhone(String(formData.phone))}
            changeValue={handlePhoneChange}
            {...register('phone', {
              pattern: {
                value: /^\+79\d{9}$/,
                message: t('validation.phoneValidFormat'),
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message || ''}
          />
          <Input
            type=""
            title={'E-mail'}
            label={t('marketing.enterEmail')}
            classname="w-80"
            value={formData.email}
            changeValue={e => handleInputChange('email', e.target.value)}
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('validation.invalidEmailFormat'),
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message || ''}
          />
          <MultilineInput
            title={t('warehouse.desc')}
            label={t('warehouse.about')}
            classname="w-80"
            inputType="secondary"
            value={formData.description}
            changeValue={e => handleInputChange('description', e.target.value)}
            {...register('description')}
          />
          <div>
            <div className="text-sm text-text02">{t('profile.photo')}</div>

            <div
              className="flex space-x-2 items-center cursor-pointer"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <img
                src={imagePreview || ProfilePhoto}
                alt="Profile"
                className="w-16 h-16 object-cover rounded-full border border-gray-300"
                loading="lazy"
              />
              <div className="text-primary02 font-semibold">
                {t('hr.upload')}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <div className="text-text01 font-semibold text-2xl">
            {t('hr.salary')}
          </div>
          <Input
            title={`${t('hr.month')}`}
            type={'number'}
            classname="w-80"
            showIcon={true}
            IconComponent={<div className="text-text02 text-xl">₽</div>}
            value={formData.monthlySalary}
            changeValue={e =>
              handleInputChange('monthlySalary', e.target.value)
            }
          />
          <Input
            title={`${t('hr.daily')}`}
            type={'number'}
            classname="w-80"
            showIcon={true}
            IconComponent={<div className="text-text02 text-xl">₽</div>}
            value={formData.dailySalary}
            changeValue={e => handleInputChange('dailySalary', e.target.value)}
            error={!!errors.dailySalary}
          />
          <Input
            title={`${t('marketing.per')}`}
            type={'number'}
            classname="w-80"
            value={formData.percentageSalary}
            showIcon={true}
            IconComponent={<div className="text-text02 text-xl">%</div>}
            changeValue={e =>
              handleInputChange('percentageSalary', e.target.value)
            }
          />
          <div className="text-text01 font-semibold text-2xl">
            {t('hr.add')}
          </div>
          <DropdownInput
            title={`${t('marketing.floor')}`}
            label={t('warehouse.notSel')}
            options={[
              { name: t('marketing.man'), value: 'Man' },
              { name: t('marketing.woman'), value: 'Woman' },
            ]}
            classname="w-80"
            {...register('gender')}
            value={formData.gender}
            onChange={value => handleInputChange('gender', value)}
          />
          <Input
            type=""
            title={t('hr.citi')}
            label={t('hr.enterCiti')}
            classname="w-80"
            value={formData.citizenship}
            changeValue={e => handleInputChange('citizenship', e.target.value)}
            {...register('citizenship')}
          />
          <Input
            title={t('hr.passportSeries')}
            classname="w-80"
            inputType="secondary"
            value={formData.passportSeries}
            changeValue={e =>
              handleInputChange('passportSeries', e.target.value)
            }
            {...register('passportSeries')}
          />
          <Input
            type="number"
            title={t('hr.passportNumber')}
            classname="w-80"
            inputType="secondary"
            value={formData.passportNumber}
            changeValue={e =>
              handleInputChange('passportNumber', e.target.value)
            }
            {...register('passportNumber')}
          />
          <Input
            title={t('hr.passportExtradition')}
            classname="w-80"
            inputType="secondary"
            value={formData.passportExtradition}
            changeValue={e =>
              handleInputChange('passportExtradition', e.target.value)
            }
            {...register('passportExtradition')}
          />
          <DateInput
            title={t('hr.passportDateIssue')}
            classname="w-80"
            value={
              formData.passportDateIssue
                ? dayjs(formData.passportDateIssue)
                : null
            }
            changeValue={date =>
              handleInputChange(
                'passportDateIssue',
                date ? date.format('YYYY-MM-DD') : ''
              )
            }
            {...register('passportDateIssue')}
          />
          <Input
            type=""
            title={t('marketing.inn')}
            classname="w-80"
            value={formData.inn}
            changeValue={e => handleInputChange('inn', e.target.value)}
            {...register('inn')}
          />
          <Input
            type=""
            title={t('hr.snils')}
            classname="w-80"
            value={formData.snils}
            changeValue={e => handleInputChange('snils', e.target.value)}
            {...register('snils')}
          />
          <Input
            type=""
            title={t('hr.registrationAddress')}
            label={t('hr.enterRegistrationAddress')}
            classname="w-80"
            value={formData.registrationAddress}
            changeValue={e => handleInputChange('registrationAddress', e.target.value)}
            {...register('registrationAddress')}
          />
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button onClick={() => resetForm()}>
              {t('organizations.cancel')}
            </Button>
            <Button htmlType="submit" loading={isMutating} type="primary">
              {t('routes.addE')}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default Employees;
