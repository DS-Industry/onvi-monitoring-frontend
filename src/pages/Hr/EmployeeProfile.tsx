import SearchInput from '@/components/ui/Input/SearchInput';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useFormHook from '@/hooks/useFormHook';
import Input from '@/components/ui/Input/Input';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import MultilineInput from '@/components/ui/Input/MultilineInput';
import CalendarComponent from '@/components/ui/Calendar/CalendarComponent';
import { useToast } from '@/components/context/useContext';
import type { DatePickerProps } from 'antd';
import { DatePicker, Skeleton, Button, Grid, Select } from 'antd';
import useSWR, { mutate } from 'swr';
import {
  getPositions,
  getWorkerById,
  getWorkers,
  StatusHrWorker,
  updateWorker,
  UpdateWorkerRequest,
  updateWorkerPosConnections,
  getWorkerConnectedPoses,
} from '@/services/api/hr';
import { getPoses } from '@/services/api/equipment';
import { useUser } from '@/hooks/useUserStore';
import useSWRMutation from 'swr/mutation';
import DateInput from '@/components/ui/Input/DateInput';
import dayjs from 'dayjs';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { SaveOutlined } from '@ant-design/icons';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { formatRussianPhone } from '@/utils/tableUnits';

const VITE_S3_CLOUD = import.meta.env.VITE_S3_CLOUD;

const DoubleSkeleton = () => (
  <>
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex flex-col space-y-4 mb-4">
        <Skeleton.Input style={{ width: '20%' }} active={true} />
        <Skeleton.Input style={{ width: '30%' }} active={true} />
      </div>
    ))}
  </>
);

const EmployeeProfile: React.FC = () => {
  const { t } = useTranslation();
  const [searchEmp, setSearchEmp] = useState('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const user = useUser();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPosIds, setSelectedPosIds] = useState<number[]>([]);
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();

  const workerId = searchParams.get('workerId')
    ? Number(searchParams.get('workerId'))
    : 0;

  const screens = Grid.useBreakpoint();

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

  const positions: { value: number; label: string }[] =
    positionData?.map(item => ({
      value: item.props.id,
      label: item.props.name,
    })) || [];

  const getInitials = (fullName: string) => {
    const words = fullName.trim().split(' ');

    if (words.length < 2) return words.at(0)?.at(0)?.toUpperCase() ?? '';

    return words
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  };

  const {
    data: employeeData,
    isLoading: loadingEmployee,
    isValidating,
  } = useSWR(
    workerId !== 0 ? [`get-employee-by-id`, workerId] : null,
    () => getWorkerById(workerId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const employee = employeeData?.props;
  const { data: workersData, isLoading: loadingWorkers } = useSWR(
    user.organizationId ? [`get-workers`, employee?.avatar, user.organizationId] : null,
    () => getWorkers({ organizationId: user.organizationId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: organizationPoses, isLoading: loadingOrganizationPoses } = useSWR(
    user.organizationId ? [`get-organization-poses`, user.organizationId] : null,
    () => getPoses({ organizationId: user.organizationId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: connectedPosesData, isLoading: loadingConnectedPoses } = useSWR(
    workerId !== 0 ? [`get-worker-connected-poses`, workerId] : null,
    () => getWorkerConnectedPoses(workerId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const employeeDetails =
    workersData
      ?.map(worker => ({
        fullName: worker.props.name,
        job: positions.find(pos => pos.value === worker.props.hrPositionId)
          ?.label,
        workerId: worker.props.id,
        avatar: worker.props.avatar,
      }))
      .filter(emp =>
        emp.fullName.toLowerCase().includes(searchEmp.toLowerCase())
      ) || [];

  const tabs = [
    { id: 'info', name: t('hr.info') },
    { id: 'addi', name: t('hr.addi') },
    { id: 'salary', name: t('hr.salary') },
    { id: 'poses', name: t('hr.poses') },
  ];

  const defaultValues: UpdateWorkerRequest = {
    workerId: '0',
    name: undefined,
    hrPositionId: undefined,
    placementId: undefined,
    startWorkDate: undefined,
    phone: undefined,
    email: undefined,
    description: undefined,
    monthlySalary: undefined,
    dailySalary: undefined,
    percentageSalary: undefined,
    status: undefined,
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

  useEffect(() => {
    if (employee?.avatar) {
      setImagePreview(`${VITE_S3_CLOUD}/avatar/worker/` + employee.avatar);
    } else setImagePreview(null);
  }, [employee?.avatar]);

  useEffect(() => {
    if (connectedPosesData?.poses) {
      setSelectedPosIds(connectedPosesData.poses.map(pos => pos.id));
    }
  }, [connectedPosesData]);

  const scheduleValues = {
    sch: 0,
    repeat: 0,
    openingHour: 0,
    openingMin: 0,
    closingHour: 0,
    closingMinute: 0,
    date: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const [scheduleData, setScheduleData] = useState(scheduleValues);

  const onChange: DatePickerProps['onChange'] = (_date, dateString) => {
    setScheduleData(prev => ({ ...prev, date: dateString.toString() }));
    const year = Number(dateString.toString().split('-')[0]);
    const startIndex = Number(dateString.toString().split('-')[1]);
    setYear(year);
    setStartIndex(startIndex - 1);
  };

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        workerId: String(employee.id),
        name: employee.name ? String(employee.name) : undefined,
        hrPositionId: employee.hrPositionId
          ? String(employee.hrPositionId)
          : undefined,
        placementId: employee.placementId
          ? String(employee.placementId)
          : undefined,
        monthlySalary: employee.monthlySalary
          ? String(employee.monthlySalary)
          : undefined,
        dailySalary: employee.dailySalary
          ? String(employee.dailySalary)
          : undefined,
        percentageSalary: employee.percentageSalary
          ? String(employee.percentageSalary)
          : undefined,
        status: employee.status ? employee.status : undefined,
        inn: employee.inn ?? undefined,
        snils: employee.snils ?? undefined,
        registrationAddress: employee.registrationAddress ?? undefined,
        phone: employee.phone ?? undefined,
        email: employee.email ?? undefined,
        gender: employee.gender ?? undefined,
        description: employee.description ?? undefined,
        citizenship: employee.citizenship ?? undefined,
        passportSeries: employee.passportSeries ?? undefined,
        passportExtradition: employee.passportExtradition ?? undefined,
        passportNumber: employee.passportNumber ?? undefined,
        startWorkDate: employee.startWorkDate
          ? dayjs(String(employee.startWorkDate).slice(0, 10)).toDate()
          : undefined,
        passportDateIssue: employee.passportDateIssue
          ? dayjs(String(employee.passportDateIssue).slice(0, 10)).toDate()
          : undefined,
      });
    }
  }, [employee]);

  const { register, handleSubmit, setValue } = useFormHook(formData);

  const { trigger: updateEmp, isMutating: updatingEmployee } = useSWRMutation(
    ['update-employee'],
    async () =>
      updateWorker(
        {
          workerId: formData.workerId,
          name: formData.name,
          hrPositionId: formData.hrPositionId,
          placementId: formData.placementId,
          startWorkDate: formData.startWorkDate,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
          monthlySalary: formData.monthlySalary,
          dailySalary: formData.dailySalary,
          percentageSalary: formData.percentageSalary,
          status: formData.status,
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

  const { trigger: updatePosConnections, isMutating: updatingPosConnections } = useSWRMutation(
    ['update-worker-pos-connections'],
    async () =>
      updateWorkerPosConnections({
        workerId: workerId,
        posIds: selectedPosIds,
      })
  );

  type FieldType = keyof typeof defaultValues;

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = [
      'monthlySalary',
      'dailySalary',
      'percentageSalary',
      'hrPositionId',
    ];
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    let cleanValue = '+7' + input.replace(/\D/g, '').replace(/^7/, '');
    if (cleanValue.length > 12) cleanValue = cleanValue.slice(0, 12);

    setFormData(prev => ({ ...prev, phone: cleanValue }));
    setValue('phone', cleanValue);
  };

  const onSubmit = async () => {
    try {
      const result = await updateEmp();
      if (result) {
        mutate([`get-employee-by-id`, workerId]);
        showToast(t('success.recordUpdated'), 'success');
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const onUpdatePosConnections = async () => {
    try {
      const result = await updatePosConnections();
      if (result) {
        mutate([`get-worker-connected-poses`, workerId]);
        showToast(t('success.recordUpdated'), 'success');
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const months = [
    { name: 'Январь', en: 'January' },
    { name: 'Февраль', en: 'February' },
    { name: 'Март', en: 'March' },
    { name: 'Апрель', en: 'April' },
    { name: 'Май', en: 'May' },
    { name: 'Июнь', en: 'June' },
    { name: 'Июль', en: 'July' },
    { name: 'Август', en: 'August' },
    { name: 'Сентябрь', en: 'September' },
    { name: 'Октябрь', en: 'October' },
    { name: 'Ноябрь', en: 'November' },
    { name: 'Декабрь', en: 'December' },
  ];

  const [startIndex, setStartIndex] = useState(4);
  const [year, setYear] = useState(2024);

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    } else {
      setStartIndex(9);
      setYear(year - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < months.length - 3) {
      setStartIndex(startIndex + 1);
    } else {
      setStartIndex(0);
      setYear(year + 1);
    }
  };

  const handlePrevYear = () => {
    setYear(year - 1);
  };

  const handleNextYear = () => {
    setYear(year + 1);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xl sm:text-3xl font-normal text-text01  ${screens.md ? '' : 'ml-12'}`}
          >
            {employee?.name ?? ''}
          </span>
        </div>
        <Button
          icon={<SaveOutlined />}
          className="btn-primary"
          onClick={() => handleSubmit(onSubmit)()}
          loading={updatingEmployee}
        >
          {screens.md && t('routes.save')}
        </Button>
      </div>

      <div className="mt-5">
        <hr />
        <div className="flex">
          <div className="w-25 md:w-72 border-r border-opacity01 min-h-screen p-4 space-y-4">
            <div
              className="flex space-x-2 text-primary02 cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftOutlined className="h-6 w-6" />
              <div>{t('login.back')}</div>
            </div>
            {screens.md ? (
              <SearchInput
                value={searchEmp}
                placeholder={t('hr.search')}
                searchType="outlined"
                onChange={value => setSearchEmp(value)}
              />
            ) : null}
            <div className="w-full w-25 md:w-60 max-h-[500px] overflow-y-auto">
              {loadingWorkers
                ? DoubleSkeleton()
                : employeeDetails.map(emp => (
                    <div
                      className="flex rounded-lg hover:bg-background05 p-2.5 cursor-pointer space-x-2"
                      onClick={() => {
                        updateSearchParams(searchParams, setSearchParams, {
                          workerId: emp.workerId.toString(),
                        });
                      }}
                    >
                      {emp.avatar ? (
                        <img
                          src={`${VITE_S3_CLOUD}/avatar/worker/` + emp.avatar}
                          alt="Profile"
                          className="rounded-full w-10 h-10 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-background03 flex items-center justify-center text-xs text-text01">
                          {getInitials(emp.fullName)}
                        </div>
                      )}
                      <div className="hidden md:block">
                        <div className="text-text01 font-semibold max-w-44 truncate overflow-hidden whitespace-nowrap">
                          {emp.fullName}
                        </div>
                        <div className="text-text02 text-sm">{emp.job}</div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
          <div className="px-4 w-full">
            <div className="flex flex-wrap space-x-4 border-b mb-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`p-2 flex-1 min-w-[120px] sm:w-40 text-center ${activeTab === tab.id ? 'text-text01 border-b-[3px] border-primary02' : 'text-text02'}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {loadingEmployee || isValidating ? (
                <div className="mt-4">{DoubleSkeleton()}</div>
              ) : (
                <div className="mt-4">
                  {activeTab === 'info' && (
                    <div className="space-y-4">
                      <Input
                        type=""
                        title={t('roles.name')}
                        label={t('profile.namePlaceholder')}
                        classname="w-64"
                        value={formData.name}
                        changeValue={e =>
                          handleInputChange('name', e.target.value)
                        }
                        {...register('name')}
                        inputType="secondary"
                      />
                      <div>
                        <div className="text-sm text-text02">
                          {t('roles.job')}
                        </div>
                        <Select
                          options={positions}
                          placeholder={t('hr.selectPos')}
                          className="w-64"
                          value={Number(formData.hrPositionId)}
                          onChange={value =>
                            handleInputChange('hrPositionId', String(value))
                          }
                        />
                      </div>
                      <div>
                        <div className="text-sm text-text02">{`${t('finance.status')}`}</div>
                        <Select
                          options={[
                            {
                              label: t('tables.WORKS'),
                              value: StatusHrWorker.WORKS,
                            },
                            {
                              label: t('tables.DISMISSED'),
                              value: StatusHrWorker.DISMISSED,
                            },
                          ]}
                          placeholder={t('warehouse.notSel')}
                          className="w-64"
                          value={formData.status}
                          onChange={value => handleInputChange('status', value)}
                        />
                      </div>
                      <div>
                        <div className="text-sm text-text02">
                          {t('hr.date')}
                        </div>
                        <DateInput
                          classname="w-64"
                          value={
                            formData.startWorkDate
                              ? dayjs(formData.startWorkDate)
                              : null
                          }
                          changeValue={date =>
                            handleInputChange(
                              'startWorkDate',
                              date ? date.format('YYYY-MM-DD') : ''
                            )
                          }
                          {...register('startWorkDate')}
                          inputType="secondary"
                        />
                      </div>
                      <Input
                        type=""
                        title={t('profile.telephone')}
                        label={t('warehouse.enterPhone')}
                        classname="w-64"
                        value={formatRussianPhone(formData.phone || '')}
                        changeValue={handlePhoneChange}
                        {...register('phone')}
                        inputType="secondary"
                      />
                      <Input
                        type=""
                        title={'E-mail'}
                        label={t('marketing.enterEmail')}
                        classname="w-64"
                        value={formData.email}
                        changeValue={e =>
                          handleInputChange('email', e.target.value)
                        }
                        {...register('email')}
                        inputType="secondary"
                      />
                      <MultilineInput
                        title={t('warehouse.desc')}
                        label={t('warehouse.about')}
                        classname="w-64"
                        inputType="secondary"
                        value={formData.description}
                        changeValue={e =>
                          handleInputChange('description', e.target.value)
                        }
                        {...register('description')}
                      />
                      <div>
                        <div className="text-sm text-text02">
                          {t('profile.photo')}
                        </div>
                        <label className="cursor-pointer">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile"
                              className="rounded-full w-10 h-10 object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-background03 flex items-center justify-center text-xs text-text01">
                              {getInitials(employee?.name || '')}
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                  {activeTab === 'addi' && (
                    <div className="space-y-4">
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
                        classname="w-64"
                        value={formData.citizenship}
                        changeValue={e =>
                          handleInputChange('citizenship', e.target.value)
                        }
                        {...register('citizenship')}
                        inputType="secondary"
                      />
                      <Input
                        title={t('hr.passportSeries')}
                        classname="w-64"
                        inputType="secondary"
                        value={formData.passportSeries}
                        changeValue={e =>
                          handleInputChange('passportSeries', e.target.value)
                        }
                        {...register('passportSeries')}
                      />
                      <Input
                        title={t('hr.passportNumber')}
                        classname="w-64"
                        inputType="secondary"
                        value={formData.passportNumber}
                        changeValue={e =>
                          handleInputChange('passportNumber', e.target.value)
                        }
                        {...register('passportNumber')}
                      />
                      <Input
                        title={t('hr.passportExtradition')}
                        classname="w-64"
                        inputType="secondary"
                        value={formData.passportExtradition}
                        changeValue={e =>
                          handleInputChange(
                            'passportExtradition',
                            e.target.value
                          )
                        }
                        {...register('passportExtradition')}
                      />
                      <DateInput
                        title={t('hr.passportDateIssue')}
                        classname="w-64"
                        inputType="secondary"
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
                        classname="w-64"
                        value={formData.inn}
                        changeValue={e =>
                          handleInputChange('inn', e.target.value)
                        }
                        {...register('inn')}
                        inputType="secondary"
                      />
                      <Input
                        type=""
                        title={t('hr.snils')}
                        classname="w-64"
                        value={formData.snils}
                        changeValue={e =>
                          handleInputChange('snils', e.target.value)
                        }
                        {...register('snils')}
                        inputType="secondary"
                      />
                      <Input
                        type=""
                        title={t('hr.registrationAddress')}
                        label={t('hr.enterRegistrationAddress')}
                        classname="w-64"
                        value={formData.registrationAddress}
                        changeValue={e =>
                          handleInputChange('registrationAddress', e.target.value)
                        }
                        {...register('registrationAddress')}
                        inputType="secondary"
                      />
                    </div>
                  )}
                  {activeTab === 'salary' && (
                    <div className="space-y-4">
                      <Input
                        title={`${t('hr.month')}`}
                        type="number"
                        classname="w-64"
                        showIcon={true}
                        IconComponent={
                          <div className="text-text02 text-xl">₽</div>
                        }
                        value={formData.monthlySalary}
                        changeValue={e =>
                          handleInputChange('monthlySalary', e.target.value)
                        }
                        {...register('monthlySalary')}
                        inputType="secondary"
                      />
                      <Input
                        title={`${t('hr.daily')}`}
                        type="number"
                        classname="w-64"
                        value={formData.dailySalary}
                        changeValue={e =>
                          handleInputChange('dailySalary', e.target.value)
                        }
                        {...register('dailySalary')}
                        inputType="secondary"
                        showIcon={true}
                        IconComponent={
                          <div className="text-text02 text-xl">₽</div>
                        }
                      />
                      <Input
                        title={`${t('marketing.per')}`}
                        type={'number'}
                        classname="w-64"
                        value={formData.percentageSalary}
                        changeValue={e =>
                          handleInputChange('percentageSalary', e.target.value)
                        }
                        {...register('percentageSalary')}
                        inputType="secondary"
                        showIcon={true}
                        IconComponent={
                          <div className="text-text02 text-xl">%</div>
                        }
                      />
                    </div>
                  )}
                  {activeTab === 'poses' && (
                    <div className="space-y-4">
                      <div className="text-lg font-semibold text-text01 mb-4">
                        {t('hr.connectedPoses')}
                      </div>
                      {loadingOrganizationPoses || loadingConnectedPoses ? (
                        <div className="mt-4">{DoubleSkeleton()}</div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-text02 mb-2">
                              {t('hr.selectPoses')}
                            </div>
                            <Select
                              mode="multiple"
                              placeholder={t('hr.selectPoses')}
                              className="w-full max-w-md"
                              value={selectedPosIds}
                              onChange={setSelectedPosIds}
                              options={organizationPoses?.map(pos => ({
                                label: `${pos.name} - ${pos.address}`,
                                value: pos.id,
                              })) || []}
                              loading={loadingOrganizationPoses}
                            />
                          </div>
                          <div className="mt-4">
                            <Button
                              type="primary"
                              onClick={onUpdatePosConnections}
                              loading={updatingPosConnections}
                              className="btn-primary"
                            >
                              {t('routes.save')}
                            </Button>
                          </div>
                          {connectedPosesData?.poses && connectedPosesData.poses.length > 0 && (
                            <div className="mt-6">
                              <div className="text-sm text-text02 mb-2">
                                {t('hr.currentlyConnected')}
                              </div>
                              <div className="space-y-2">
                                {connectedPosesData.poses.map(pos => (
                                  <div
                                    key={pos.id}
                                    className="flex items-center justify-between p-3 bg-background05 rounded-lg"
                                  >
                                    <div>
                                      <div className="font-medium text-text01">
                                        {pos.name}
                                      </div>
                                      <div className="text-sm text-text02">
                                        {pos.address.city}, {pos.address.location}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 'sch' && (
                    <div className="space-y-4">
                      <div className="h-72 w-[457px] rounded-lg bg-background05 p-4 space-y-6">
                        <div className="text-text01 font-semibold">
                          {t('hr.auto')}
                        </div>
                        <div className="flex space-x-3 items-center">
                          <div className="text-sm text-text01 font-semibold">
                            {t('finance.sch')}
                          </div>
                          <Input
                            type="number"
                            inputType="secondary"
                            classname="w-24"
                            value={scheduleData.sch}
                            changeValue={e =>
                              setScheduleData(prev => ({
                                ...prev,
                                sch: Number(e.target.value),
                              }))
                            }
                          />
                          <div className="text-sm text-text02">
                            {t('finance.thr')}
                          </div>
                          <Input
                            type="number"
                            inputType="secondary"
                            classname="w-24"
                            value={scheduleData.repeat}
                            changeValue={e =>
                              setScheduleData(prev => ({
                                ...prev,
                                repeat: Number(e.target.value),
                              }))
                            }
                          />
                        </div>
                        <div className="flex space-x-3 items-center">
                          <div className="text-sm text-text01 font-semibold">
                            {t('finance.sta')}
                          </div>
                          <DatePicker onChange={onChange} />
                        </div>
                        <div className="flex space-x-2 items-center">
                          <div className="text-text01 font-semibold text-sm">
                            {t('finance.open')}
                          </div>
                          <Input
                            type="number"
                            inputType="secondary"
                            label="09 ч"
                            classname="w-64"
                            value={scheduleData.openingHour}
                            changeValue={e =>
                              setScheduleData(prev => ({
                                ...prev,
                                openingHour: Number(e.target.value),
                              }))
                            }
                          />
                          <Input
                            type="number"
                            inputType="secondary"
                            label="00 м"
                            classname="w-64"
                            value={scheduleData.openingMin}
                            changeValue={e =>
                              setScheduleData(prev => ({
                                ...prev,
                                openingMin: Number(e.target.value),
                              }))
                            }
                          />
                          <div className="text-sm text-text02">-</div>
                          <Input
                            type="number"
                            inputType="secondary"
                            label="09 ч"
                            classname="w-64"
                            value={scheduleData.closingHour}
                            changeValue={e =>
                              setScheduleData(prev => ({
                                ...prev,
                                closingHour: Number(e.target.value),
                              }))
                            }
                          />
                          <Input
                            type="number"
                            inputType="secondary"
                            label="00 м"
                            classname="w-64"
                            value={scheduleData.closingMinute}
                            changeValue={e =>
                              setScheduleData(prev => ({
                                ...prev,
                                closingMinute: Number(e.target.value),
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-full md:w-[800px] space-x-4">
                        <button
                          onClick={handlePrevYear}
                          className="p-2 rounded-full bg-background05 text-text03"
                        >
                          <ArrowLeftOutlined size={20} />
                        </button>
                        <div className="text-xl font-semibold">{year}</div>
                        <button
                          onClick={handleNextYear}
                          className="p-2 rounded-full bg-background05 text-text03"
                        >
                          <ArrowRightOutlined size={20} />
                        </button>
                      </div>
                      <div className="flex flex-col md:flex-row items-center space-x-4">
                        {/* Left Arrow */}
                        <button
                          onClick={handlePrev}
                          className="p-2 rounded-full bg-background05 text-text03 disabled:opacity-50"
                          disabled={startIndex === 0}
                        >
                          <ArrowLeftOutlined size={20} />
                        </button>

                        {/* Calendars */}
                        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4">
                          {months
                            .slice(startIndex, startIndex + 3)
                            .map((month, index) => (
                              <div key={index}>
                                <div className="w-56 text-center font-semibold text-text01">
                                  {month.name} {year}
                                </div>
                                <CalendarComponent
                                  month={month.en}
                                  year={year}
                                  schedule={{
                                    sch: scheduleData.sch,
                                    repeat: scheduleData.repeat,
                                    date: scheduleData.date,
                                  }}
                                />
                              </div>
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                          onClick={handleNext}
                          className="p-2 rounded-full bg-background05 text-text03 disabled:opacity-50"
                          disabled={startIndex >= months.length - 3}
                        >
                          <ArrowRightOutlined size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
