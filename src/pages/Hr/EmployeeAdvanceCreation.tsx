import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/context/useContext';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import useFormHook from '@/hooks/useFormHook';
import {
  getPositions,
  getWorkers,
  addWorkerPrePayment,
  calculatePrepayment,
  createPrepayment,
  PrepaymentCreateRequest,
  addWorkerRequest,
  PrepaymentCalculateBody,
} from '@/services/api/hr';
import {
  Table,
  Button,
  Modal,
  DatePicker,
  Select,
  Transfer,
  InputNumber,
  Space
} from 'antd';
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import NoDataUI from '@/components/ui/NoDataUI';
import PositionEmpty from '@/assets/NoPosition.png';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { getOrganization } from '@/services/api/organization';
import { getCurrencyRender, getPercentRender } from '@/utils/tableUnits';

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
  paymentDate: Date;
  countShifts: number;
  sum: number;
  hrPosition?: string;
}

const EmployeeAdvanceCreation: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const placementId = searchParams.get('city');
  const city = placementId ? Number(placementId) : undefined;
  const navigate = useNavigate();
  const [paymentsData, setPaymentsData] = useState<PaymentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const { showToast } = useToast();

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

  const { data: workersData } = useSWR(
    [`get-workers`],
    () =>
      getWorkers({}),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const organizations = [
    { name: t('chemical.select'), value: 0 },
    ...(organizationData?.map(item => ({ name: item.name, value: item.id })) || []),
  ];

  const workers = [
    ...(workersData?.map(work => ({
      key: String(work.props.id),
      title: work.props.name,
      value: work.props.id,
    })) || []),
  ];

  const positions = [
    { label: t('analysis.all'), value: '*', name: t('analysis.all') },
    ...(positionData?.map(pos => ({
      label: pos.props.name,
      value: pos.props.id,
      name: pos.props.name,
    })) || []),
  ];

  const defaultValues: PrepaymentCalculateBody = {
    organizationId: 0,
    billingMonth: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  const { trigger: calculateSal, isMutating: calculatingSal } = useSWRMutation(
    ['calculate-salary'],
    async () => {
      const result = await calculatePrepayment({
        organizationId: formData.organizationId,
        billingMonth: formData.billingMonth,
        hrPositionId: formData.hrPositionId,
      });

      setShowAddButton(true);
      return result;
    }
  );

  const { trigger: createSal, isMutating: creatingSal } = useSWRMutation(
    ['create-salary'],
    (_key, { arg }: { arg: PrepaymentCreateRequest }) => createPrepayment(arg)
  );

  type FieldType = 'organizationId' | 'billingMonth' | 'hrPositionId';

  const handleInputChange = (
    field: FieldType,
    value: string | number | '*'
  ) => {
    const numericFields = ['organizationId', 'hrPositionId'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handleTableChange = (
    id: number,
    key: keyof PaymentRecord,
    value: any
  ) => {
    setPaymentsData(prevData =>
      prevData?.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  };

  const onSubmit = async () => {
    try {
      const result = await calculateSal();
      if (result) {
        setPaymentsData(
          result.map((res, index) => ({
            ...res,
            paymentDate: new Date(),
            check: false,
            countShifts: 0,
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
      if (item.sum == null || item.sum <= 0) errors.push('Выплачено ЗП');

      if (errors.length > 0) {
        showToast(
          `Строка ${i + 1}: Заполните корректно поля: ${errors.join(', ')}`,
          'error'
        );
        return;
      }
    }

    const paymentCreate: PrepaymentCreateRequest = {
      payments: paymentsData?.map(data => ({
        hrWorkerId: data.hrWorkerId,
        paymentDate: data.paymentDate,
        billingMonth: data.billingMonth,
        countShifts: Number(data.countShifts),
        sum: Number(data.sum),
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
      addWorkerPrePayment({
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
        if (result.length === 0) showToast(t('hr.noAdvance'), 'error');
        setPaymentsData(
          result.map((res, index) => ({
            ...res,
            paymentDate: new Date(),
            check: false,
            countShifts: 0,
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

  const columnsPaymentsCreation: ColumnsType<PaymentRecord> = [
    {
      title: '',
      key: 'check',
      width: 50,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={record.check}
          className="w-[18px] h-[18px]"
          onChange={(e) =>
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
        positions.find(pos => pos.value === record.hrPositionId)?.name || ''
    },
    {
      title: 'Месяц расчёта',
      key: 'billingMonth',
      render: (_, record) =>
        record.billingMonth ? dayjs(record.billingMonth).format('MM.YYYY') : ''
    },
    {
      title: 'Оклад',
      dataIndex: 'monthlySalary',
      key: 'monthlySalary',
      sorter: (a, b) => a.monthlySalary - b.monthlySalary,
      render: getCurrencyRender()
    },
    {
      title: 'Посменное начисление',
      dataIndex: 'dailySalary',
      key: 'dailySalary',
      sorter: (a, b) => a.dailySalary - b.dailySalary,
      render: getCurrencyRender()
    },
    {
      title: 'Процент',
      dataIndex: 'percentageSalary',
      key: 'percentageSalary',
      sorter: (a, b) => a.percentageSalary - b.percentageSalary,
      render: getPercentRender()
    },
    {
      title: 'Количество отработанных смен',
      key: 'countShifts',
      render: (_, record) => (
        <InputNumber
          value={record.countShifts}
          onChange={(value) =>
            handleTableChange(record.id, 'countShifts', value)
          }
        />
      ),
    },
    {
      title: 'Выплачено ЗП',
      key: 'sum',
      render: (_, record) => (
        <InputNumber
          value={record.sum}
          onChange={(value) =>
            handleTableChange(record.id, 'sum', value)
          }
        />
      ),
    },
    {
      title: 'Дата выдачи',
      key: 'paymentDate',
      render: (_, record) => (
        <DatePicker
          value={record.paymentDate ? dayjs(record.paymentDate) : null}
          onChange={(date) =>
            handleTableChange(record.id, 'paymentDate', date?.toDate())
          }
        />
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.empAdv')}
          </span>
          <QuestionMarkIcon />
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
            <Button
              onClick={() => setIsModalOpen(false)}
            >
              {t('organizations.cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={addingWorker}
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="mt-5">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
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
                  required: 'Organization Id is required',
                  validate: value => value !== 0 || 'Organization Id is required',
                })}
                onChange={value => handleInputChange('organizationId', value)}
                dropdownRender={menu => (
                  <div style={{ maxHeight: 100, overflowY: 'auto' }}>{menu}</div>
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
                  required: 'Billing Month is required',
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
              <div className="text-sm text-text02">{t('routes.employees')}</div>
              <Select
                className="w-64 h-10"
                options={positions}
                value={formData.hrPositionId}
                {...register('hrPositionId')}
                onChange={value => handleInputChange('hrPositionId', value)}
                dropdownRender={menu => (
                  <div style={{ maxHeight: 100, overflowY: 'auto' }}>{menu}</div>
                )}
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => navigate(-1)}
            >
              {t('organizations.cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={calculatingSal}
            >
              {t('finance.form')}
            </Button>
          </div>
        </form>

        {paymentsData.length > 0 ? (
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
              <Space>
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
              </Space>
            </div>

            <Table
              columns={columnsPaymentsCreation}
              dataSource={paymentsData.map(item => ({
                ...item,
                hrPosition: positions.find(pos => pos.value === item.hrPositionId)?.name || '',
              }))}
              rowKey="id"
              pagination={false}
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
  );
};

export default EmployeeAdvanceCreation;