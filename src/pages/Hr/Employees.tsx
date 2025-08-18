import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Table, Drawer, Button as AntButton } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useToast } from '@/components/context/useContext';
import ProfilePhoto from '@/assets/ProfilePhoto.svg';
import Button from '@/components/ui/Button/Button';
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
  getPositions,
  getWorkers,
  TWorker,
  WorkerParams,
} from '@/services/api/hr';
import { getPlacement } from '@/services/api/device';
import { getOrganization } from '@/services/api/organization';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
} from '@/utils/constants';
import { getCurrencyRender, getPercentRender } from '@/utils/tableUnits';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { PlusOutlined } from '@ant-design/icons';

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

  const { showToast } = useToast();

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
    }
  );

  const { data: positionData } = useSWR(
    [`get-positions`],
    () => getPositions(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
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
  const organizationId = Number(searchParams.get('organizationId')) || undefined;
  const name = searchParams.get('name') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const filterParams = useMemo<WorkerParams>(
    () => ({
      placementId: placementId,
      hrPositionId: hrPositionId,
      organizationId: organizationId,
      name: name,
      page: currentPage,
      size: pageSize,
    }),
    [placementId, hrPositionId, organizationId, name, currentPage, pageSize]
  );

  const swrKey = useMemo(
    () => [
      'get-workers',
      filterParams.placementId,
      filterParams.hrPositionId,
      filterParams.organizationId,
      filterParams.name,
      filterParams.page,
      filterParams.size,
    ],
    [filterParams]
  );

  const {
    data: workersData,
    isLoading: workersLoading,
    mutate: refetchWorkers,
  } = useSWR(
    swrKey,
    () =>
      getWorkers({
        placementId: filterParams.placementId,
        hrPositionId: filterParams.hrPositionId,
        organizationId: filterParams.organizationId,
        name: filterParams.name || undefined,
        page: filterParams.page,
        size: filterParams.size,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
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

  const defaultValues = {
    id: 0,
    name: '',
    hrPositionId: -1,
    placementId: -1,
    organizationId: -1,
    startWorkDate: undefined,
    phone: undefined,
    email: undefined,
    description: undefined,
    monthlySalary: -1,
    dailySalary: -1,
    percentageSalary: -1,
    gender: undefined,
    citizenship: undefined,
    passportSeries: undefined,
    passportNumber: undefined,
    passportExtradition: undefined,
    passportDateIssue: undefined,
    inn: undefined,
    snils: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createEmp, isMutating } = useSWRMutation(
    ['create-employee'],
    async () =>
      createWorker(
        {
          id: 9,
          name: formData.name,
          hrPositionId: formData.hrPositionId,
          placementId: formData.placementId,
          organizationId: formData.organizationId,
          startWorkDate: formData.startWorkDate,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
          monthlySalary: formData.monthlySalary,
          dailySalary: formData.dailySalary,
          percentageSalary: formData.percentageSalary,
          gender: formData.gender,
          citizenship: formData.citizenship,
          passportSeries: formData.passportSeries,
          passportNumber: formData.passportNumber,
          passportExtradition: formData.passportExtradition,
          passportDateIssue: formData.passportDateIssue,
          inn: formData.inn,
          snils: formData.snils,
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
        refetchWorkers();
        resetForm();
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const totalCount = workersData?.length || 0;

  const currencyRender = getCurrencyRender();
  const percentRender = getPercentRender();

  const columnsEmployee: ColumnsType<TWorker['props']> = [
    {
      title: 'ФИО Сотрудника',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return (
          <Link
            to="/hr/employees/profile"
            state={{ ownerId: record.hrPositionId, name: record.name }}
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
    {
      title: 'Месячный оклад',
      dataIndex: 'monthlySalary',
      key: 'monthlySalary',
      sorter: (a, b) => Number(a.monthlySalary) - Number(b.monthlySalary),
      render: currencyRender,
    },
    {
      title: 'Дневной оклад',
      dataIndex: 'dailySalary',
      key: 'dailySalary',
      sorter: (a, b) => Number(a.dailySalary) - Number(b.dailySalary),
      render: currencyRender,
    },
    {
      title: 'Проценты',
      dataIndex: 'percentageSalary',
      key: 'percentageSalary',
      render: percentRender,
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector<TWorker['props']>(columnsEmployee, 'employee-columns');

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.employees')}
          </span>
          <QuestionMarkIcon />
        </div>
        <AntButton
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => setDrawerOpen(true)}
        >
          {t('routes.addE')}
        </AntButton>
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
          count={totalCount}
          positions={[allObj, ...positions]}
          organizations={[allObj, ...organizations]}
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
            total: totalCount,
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
        className="custom-drawer"
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            {...register('name', { required: 'Name is required' })}
            helperText={errors.name?.message || ''}
          />
          <DropdownInput
            title={`${t('roles.job')}*`}
            label={t('hr.selectPos')}
            options={positions}
            classname="w-64"
            {...register('hrPositionId', {
              required: 'hrPositionId is required',
              validate: value => value !== -1 || 'Pos ID is required',
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
            classname="w-64"
            {...register('placementId', {
              required: 'Placement Id is required',
              validate: value => value !== -1 || 'Organization ID is required',
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
            classname="w-64"
            {...register('organizationId', {
              required: 'Organization Id is required',
              validate: value => value !== -1 || 'Organization ID is required',
            })}
            value={formData.organizationId}
            onChange={value => handleInputChange('organizationId', value)}
            error={!!errors.organizationId}
            helperText={errors.organizationId?.message}
          />
          <div>
            <div className="text-sm text-text02">{t('hr.date')}</div>
            <DateInput
              classname="w-40"
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
            value={formData.phone}
            changeValue={e => handleInputChange('phone', e.target.value)}
            {...register('phone', {
              pattern: {
                value: /^\+79\d{9}$/,
                message:
                  'Phone number must start with +79 and be 11 digits long',
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
            {...register('email')}
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
            title={`${t('hr.month')}*`}
            type={'number'}
            classname="w-44"
            showIcon={true}
            IconComponent={<div className="text-text02 text-xl">₽</div>}
            value={formData.monthlySalary === -1 ? '' : formData.monthlySalary}
            changeValue={e =>
              handleInputChange('monthlySalary', e.target.value)
            }
            error={!!errors.monthlySalary}
            {...register('monthlySalary', {
              required: 'monthlySalary is required',
            })}
            helperText={errors.monthlySalary?.message || ''}
          />
          <Input
            title={`${t('hr.daily')}*`}
            type={'number'}
            classname="w-44"
            value={formData.dailySalary === -1 ? '' : formData.dailySalary}
            changeValue={e => handleInputChange('dailySalary', e.target.value)}
            error={!!errors.dailySalary}
            {...register('dailySalary', {
              required: 'dailySalary is required',
            })}
            helperText={errors.dailySalary?.message || ''}
          />
          <Input
            title={`${t('marketing.per')}*`}
            type={'number'}
            classname="w-44"
            value={
              formData.percentageSalary === -1 ? '' : formData.percentageSalary
            }
            changeValue={e =>
              handleInputChange('percentageSalary', e.target.value)
            }
            error={!!errors.percentageSalary}
            {...register('percentageSalary', {
              required: 'percentageSalary is required',
            })}
            helperText={errors.percentageSalary?.message || ''}
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
            classname="w-64"
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
            classname="w-40"
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
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Button
              title={t('organizations.cancel')}
              type="outline"
              handleClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
            />
            <Button
              title={t('routes.addE')}
              form={true}
              isLoading={isMutating}
            />
          </div>
        </form>
      </Drawer>

      <style>{`
      .custom-ant-table .ant-table-thead th.ant-table-column-has-sorters {
        z-index: 0 !important;
      }
    `}</style>
    </div>
  );
};

export default Employees;
