import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/context/useContext';
import useSWRMutation from 'swr/mutation';
import useFormHook from '@/hooks/useFormHook';
import {
  addWorkerPayment,
  addWorkerRequest,
  calculatePayment,
  createPayment,
  getPositions,
  getWorkers,
  PaymentCreateRequest,
  PrepaymentCalculateBody,
} from '@/services/api/hr';
import {
  Button,
  Table,
  DatePicker,
  Select,
  Transfer,
  Modal,
  InputNumber,
  Grid,
  ConfigProvider,
} from 'antd';
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import NoDataUI from '@/components/ui/NoDataUI';
import PositionEmpty from '@/assets/NoPosition.png';

import { getOrganization } from '@/services/api/organization';
import { getCurrencyRender, getPercentRender } from '@/utils/tableUnits';
import ruRU from 'antd/locale/ru_RU';
import enUS from 'antd/locale/en_US';

interface PaymentRecord {
  check: boolean;
  id: number;
  hrWorkerId: number;
  name: string;
  hrPositionId: number;
  billingMonth: Date;
  monthlySalary: number;
  dailySalary: number;
  percentageSalary: number;
  prepaymentSum: number;
  prepaymentCountShifts: number;
  paymentDate: Date;
  countShifts: number;
  sum: number;
  prize: number;
  fine: number;
  hrPosition?: string;
  totalCountShifts?: number;
  totalPayment?: number;
}

const SalaryCalculationCreation: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [paymentsData, setPaymentsData] = useState<PaymentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const { showToast } = useToast();
  const currentLocale = i18n.language === 'ru' ? ruRU : enUS;
  dayjs.locale(i18n.language);

  const screens = Grid.useBreakpoint();

  const { data: organizationData } = useSWR(
    [`get-organization`],
    () => getOrganization({ placementId: undefined }),
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


  const defaultValues: PrepaymentCalculateBody = {
    organizationId: 0,
    billingMonth: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const { data: workersData } = useSWR(formData?.organizationId ? [`get-workers`, formData.organizationId] : null, () => getWorkers({ organizationId: formData.organizationId }), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const organizations = [
    { name: t('chemical.select'), value: 0 },
    ...(organizationData?.map(item => ({ name: item.name, value: item.id })) ||
      []),
  ];

  const workers = [
    ...(workersData?.map(work => ({
      key: String(work.props.id),
      title: work.props.name,
      value: work.props.id,
    })) || []),
  ];

  const positions = [
    { label: t('analysis.all'), value: '', name: t('analysis.all') },
    ...(positionData?.map(pos => ({
      label: pos.props.name,
      value: pos.props.id,
      name: pos.props.name,
    })) || []),
  ];

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  const { trigger: calculateSal, isMutating: calculatingSal } = useSWRMutation(
    ['calculate-salary'],
    async () => {
      const result = await calculatePayment({
        organizationId: formData.organizationId,
        billingMonth: formData.billingMonth,
        hrPositionId: Number(formData.hrPositionId) || undefined,
      });

      setShowAddButton(true);
      return result;
    }
  );

  const { trigger: createSal, isMutating: creatingSal } = useSWRMutation(
    ['create-salary'],
    (_key, { arg }: { arg: PaymentCreateRequest }) => createPayment(arg)
  );

  type FieldType = 'organizationId' | 'billingMonth' | 'hrPositionId';

  const handleInputChange = (field: FieldType, value: string | number | '') => {
    const numericFields = ['organizationId'];
    let updatedValue: any = value;
    if (numericFields.includes(field)) {
      updatedValue = Number(value);
    }
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, updatedValue);
  };

  const handleTableChange = (
    id: number,
    key: keyof PaymentRecord,
    value: any
  ) => {
    setPaymentsData(prevData =>
      prevData?.map(item => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const onSubmit = async () => {
    try {
      const result = await calculateSal();
      if (result) {
        setPaymentsData(
          result.map((res, index) => ({
            ...res,
            check: false,
            paymentDate: new Date(),
            countShifts: 0,
            prize: 0,
            fine: 0,
            sum: 0,
            id: index,
          }))
        );
      } else {
        throw new Error('Invalid update data.');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const handlePaymentCreation = async () => {
    for (let i = 0; i < paymentsData.length; i++) {
      const item = paymentsData[i];
      const errors = [];

      if (!item.paymentDate) errors.push('Дата выдачи');
      if (item.countShifts == null || item.countShifts <= 0)
        errors.push('Количество отработанных смен');
      if (item.prize == null || item.prize <= 0) errors.push('Премия');
      if (item.fine == null || item.fine <= 0) errors.push('Штраф');

      if (errors.length > 0) {
        showToast(
          `Строка ${i + 1}: Заполните корректно поля: ${errors.join(', ')}`,
          'error'
        );
        return;
      }
    }

    const paymentCreate: PaymentCreateRequest = {
      payments:
        paymentsData?.map(data => ({
          hrWorkerId: data.hrWorkerId,
          paymentDate: data.paymentDate,
          billingMonth: data.billingMonth,
          countShifts: Number(data.countShifts),
          sum:
            data.monthlySalary +
            data.dailySalary * data.countShifts -
            data.prepaymentSum,
          prize: Number(data.prize),
          fine: Number(data.fine),
        })) || [],
    };

    try {
      const result = await createSal(paymentCreate);
      if (result) {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error during payment creation:', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const deleteRow = () => {
    setPaymentsData(prevData => prevData.filter(row => !row.check));
  };

  const defaultValuesWorker: addWorkerRequest = {
    organizationId: 0,
    billingMonth: '',
    workerIds: [],
  };

  const [formDataWorker, setFormDataWorker] = useState(defaultValuesWorker);

  const {
    handleSubmit: handleSubmitWorker,
    setValue: setValueWorker,
    reset: resetWorker,
  } = useFormHook(formDataWorker);

  const { trigger: addWork, isMutating: addingWorker } = useSWRMutation(
    ['adding-worker'],
    async () =>
      addWorkerPayment({
        organizationId: formData.organizationId,
        billingMonth: formData.billingMonth,
        workerIds: formDataWorker.workerIds,
      })
  );

  const handleTransfer = (nextTargetKeys: (string | number | bigint)[]) => {
    const numericKeys = nextTargetKeys.map(key => Number(key));
    setFormDataWorker(prev => ({ ...prev, workerIds: numericKeys }));
    setValueWorker('workerIds', numericKeys);
  };

  const resetFormWorker = () => {
    setFormDataWorker(defaultValuesWorker);
    resetWorker();
  };

  const onSubmitWorker = async () => {
    try {
      const result = await addWork();
      if (result) {
        if (result.length === 0) showToast(t('hr.noSalary'), 'error');
        setPaymentsData(
          result.map((res, index) => ({
            ...res,
            paymentDate: new Date(),
            check: false,
            countShifts: 0,
            prize: 0,
            fine: 0,
            sum: 0,
            id: index,
          }))
        );
        resetFormWorker();
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const transformPaymentsData = (paymentsData: PaymentRecord[]) => {
    return paymentsData.map(item => ({
      ...item,
      hrPosition:
        positions.find(pos => pos.value === item.hrPositionId)?.name || '',
      totalCountShifts:
        (item.prepaymentCountShifts || 0) + (item.countShifts || 0),
      sum:
        item.monthlySalary +
        item.dailySalary *
          ((item.prepaymentCountShifts || 0) + (item.countShifts || 0)) -
        item.prepaymentSum +
        (item.prize || 0) -
        (item.fine || 0),
      totalPayment:
        (item.prepaymentSum || 0) +
        (item.monthlySalary || 0) +
        (item.dailySalary || 0) *
          ((item.prepaymentCountShifts || 0) + (item.countShifts || 0)) -
        (item.prepaymentSum || 0) +
        (item.prize || 0) -
        (item.fine || 0),
    }));
  };

  const columnsPaymentsCreation: ColumnsType<PaymentRecord> = [
    {
      title: '',
      key: 'check',
      render: (_, record) => (
        <input
          type="checkbox"
          checked={record.check}
          className="w-[18px] h-[18px]"
          onChange={e =>
            handleTableChange(record.id, 'check', e.target.checked)
          }
        />
      ),
    },
    {
      title: 'ФИО',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Должность',
      key: 'hrPosition',
      render: (_, record) =>
        positions.find(pos => pos.value === record.hrPositionId)?.name || '',
    },
    {
      title: 'Месяц расчёта',
      key: 'billingMonth',
      render: (_, record) =>
        record.billingMonth ? dayjs(record.billingMonth).format('MM.YYYY') : '',
    },
    {
      title: 'Оклад',
      dataIndex: 'monthlySalary',
      key: 'monthlySalary',
      sorter: (a, b) => a.monthlySalary - b.monthlySalary,
      render: getCurrencyRender(),
    },
    {
      title: 'Посменное начисление',
      dataIndex: 'dailySalary',
      key: 'dailySalary',
      sorter: (a, b) => a.dailySalary - b.dailySalary,
      render: getCurrencyRender(),
    },
    {
      title: 'Процент',
      dataIndex: 'percentageSalary',
      key: 'percentageSalary',
      sorter: (a, b) => a.percentageSalary - b.percentageSalary,
      render: getPercentRender(),
    },
    {
      title: 'Выплачено аванс',
      dataIndex: 'prepaymentSum',
      key: 'prepaymentSum',
      sorter: (a, b) => a.prepaymentSum - b.prepaymentSum,
      render: getCurrencyRender(),
    },
    {
      title: 'Количество отработанных смен аванс',
      dataIndex: 'prepaymentCountShifts',
      key: 'prepaymentCountShifts',
      sorter: (a, b) => a.prepaymentCountShifts - b.prepaymentCountShifts,
    },
    {
      title: 'Количество отработанных смен',
      key: 'countShifts',
      render: (_, record) => (
        <InputNumber
          value={record.countShifts}
          onChange={value => handleTableChange(record.id, 'countShifts', value)}
        />
      ),
    },
    {
      title: 'Количество отработанных смен итог',
      key: 'totalCountShifts',
      sorter: (a, b) => (a?.totalCountShifts || 0) - (b?.totalCountShifts || 0),
      render: (_, record) =>
        (record.prepaymentCountShifts || 0) + (record.countShifts || 0),
    },
    {
      title: 'Выплачено ЗП',
      dataIndex: 'sum',
      key: 'sum',
      sorter: (a, b) => a.sum - b.sum,
      render: getCurrencyRender(),
    },
    {
      title: 'Премия',
      key: 'prize',
      render: (_, record) => (
        <InputNumber
          value={record.prize}
          onChange={value => handleTableChange(record.id, 'prize', value)}
        />
      ),
    },
    {
      title: 'Штраф',
      key: 'fine',
      render: (_, record) => (
        <InputNumber
          value={record.fine}
          onChange={value => handleTableChange(record.id, 'fine', value)}
        />
      ),
    },
    {
      title: 'Выплачено итог',
      key: 'totalPayment',
      sorter: (a, b) => (a?.totalPayment || 0) - (b?.totalPayment || 0),
      render: (_, record) => {
        const totalPayment =
          (record.prepaymentSum || 0) +
          (record.monthlySalary || 0) +
          (record.dailySalary || 0) *
            ((record.prepaymentCountShifts || 0) + (record.countShifts || 0)) -
          (record.prepaymentSum || 0) +
          (record.prize || 0) -
          (record.fine || 0);

        return getCurrencyRender()(totalPayment);
      },
    },
    {
      title: 'Дата выдачи',
      key: 'paymentDate',
      render: (_, record) => (
        <DatePicker
          value={record.paymentDate ? dayjs(record.paymentDate) : null}
          onChange={date =>
            handleTableChange(record.id, 'paymentDate', date?.toDate())
          }
        />
      ),
    },
  ];

  return (
    <ConfigProvider locale={currentLocale}>
      <div>
        <div
          className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeftOutlined />
          <p className="ms-2">{t('login.back')}</p>
        </div>
        <div className={`flex items-center`}>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xl sm:text-3xl font-normal text-text01 ${screens.md ? '' : 'ml-12'}`}
            >
              {t('routes.sal')}
            </span>
          </div>
        </div>

        <Modal
          open={isModalOpen}
          onCancel={() => {
            resetFormWorker();
            setIsModalOpen(false);
          }}
          footer={null}
        >
          <div className="flex flex-row items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
              {t('roles.create')}
            </h2>
          </div>
          <form onSubmit={handleSubmitWorker(onSubmitWorker)}>
            <div className="flex flex-col space-y-4 text-text02">
              <Transfer
                dataSource={workers}
                targetKeys={formDataWorker.workerIds.map(String)}
                onChange={handleTransfer}
                render={item => item.title}
                showSearch
                listStyle={{
                  width: 'calc(50% - 8px)',
                  height: 300,
                }}
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <Button onClick={() => setIsModalOpen(false)}>
                {t('organizations.cancel')}
              </Button>
              <Button type="primary" htmlType="submit" loading={addingWorker}>
                {t('organizations.save')}
              </Button>
            </div>
          </form>
        </Modal>
        <div className="mt-5">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div>
                <div className="text-sm text-text02">
                  {t('warehouse.organization')}
                </div>
                <Select
                  className="w-64 h-10"
                  options={organizations.map(item => ({
                    label: item.name,
                    value: item.value,
                  }))}
                  value={formData.organizationId}
                  {...register('organizationId', {
                    required: t('validation.organizationRequired'),
                    validate: value =>
                      value !== 0 || t('validation.organizationRequired'),
                  })}
                  onChange={value => handleInputChange('organizationId', value)}
                  dropdownRender={menu => (
                    <div style={{ maxHeight: 100, overflowY: 'auto' }}>
                      {menu}
                    </div>
                  )}
                  status={errors.organizationId ? 'error' : ''}
                />
                {errors.organizationId?.message && (
                  <div className="text-xs text-errorFill mt-1">
                    {errors.organizationId.message}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-text02">{t('hr.billing')}</div>
                <DatePicker
                  picker="month"
                  {...register('billingMonth', {
                    required: t('validation.billingMonthRequired'),
                  })}
                  value={
                    formData.billingMonth ? dayjs(formData.billingMonth) : null
                  }
                  onChange={(_date, dateString) =>
                    handleInputChange('billingMonth', dateString.toString())
                  }
                  className="w-40 h-10"
                  status={errors.billingMonth ? 'error' : ''}
                  placeholder={t('finance.selMon')}
                />
                {errors.billingMonth?.message && (
                  <div className="text-xs text-errorFill mt-1">
                    {errors.billingMonth.message}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-text02">
                  {t('routes.employees')}
                </div>
                <Select
                  className="w-64 h-10"
                  options={positions}
                  value={formData.hrPositionId}
                  {...register('hrPositionId')}
                  placeholder={t('analysis.all')}
                  onChange={value => handleInputChange('hrPositionId', value)}
                  dropdownRender={menu => (
                    <div style={{ maxHeight: 100, overflowY: 'auto' }}>
                      {menu}
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => navigate(-1)}>
                {t('organizations.cancel')}
              </Button>
              <Button type="primary" htmlType="submit" loading={calculatingSal}>
                {t('finance.form')}
              </Button>
            </div>
          </form>

          {calculatingSal ? (
            <Table
              columns={columnsPaymentsCreation}
              dataSource={[]}
              loading={true}
              rowKey="id"
              className="mt-8"
            />
          ) : paymentsData.length > 0 ? (
            <div className="mt-8 space-y-5 shadow-card rounded-2xl p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex space-x-4">
                  <Button onClick={deleteRow} danger>
                    {t('marketing.delete')}
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    {t('finance.addE')}
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button
                    icon={<ArrowUpOutlined />}
                    onClick={() => {
                      const sortedData = [...paymentsData].sort(
                        (a, b) => a.id - b.id
                      );
                      setPaymentsData(sortedData);
                    }}
                  />
                  <Button
                    icon={<ArrowDownOutlined />}
                    onClick={() => {
                      const sortedData = [...paymentsData].sort(
                        (a, b) => b.id - a.id
                      );
                      setPaymentsData(sortedData);
                    }}
                  />
                </div>
              </div>

              <Table
                columns={columnsPaymentsCreation}
                dataSource={transformPaymentsData(paymentsData)}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />

              <div>
                <div className="flex space-x-4">
                  <Button
                    type="primary"
                    loading={creatingSal}
                    onClick={handlePaymentCreation}
                  >
                    {t('organizations.save')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            showAddButton && (
              <div className="flex flex-col justify-center items-center space-y-4">
                <NoDataUI title={t('marketing.nodata')} description={''}>
                  <img
                    src={PositionEmpty}
                    className="mx-auto"
                    loading="lazy"
                    alt="Position Empty"
                  />
                </NoDataUI>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalOpen(true)}
                >
                  {t('finance.addE')}
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SalaryCalculationCreation;
