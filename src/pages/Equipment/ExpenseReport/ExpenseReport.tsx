import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Button, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import dayjs from 'dayjs';

import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import DateInput from '@/components/ui/Input/DateInput';
import useFormHook from '@/hooks/useFormHook';
import { useToast } from '@/components/context/useContext';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, ALL_PAGE_SIZES } from '@/utils/constants';
import { getStatusTagRender } from '@/utils/tableUnits';
import { getPoses, getTechExpenseReports, TechExpenseReport } from '@/services/api/equipment';
import {
  createTechExpenseReport,
  TechExpenseReportCreateDto,
} from '@/services/api/equipment';

const ExpenseReport: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const currentPage = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;
  const posId = searchParams.get('posId') ? Number(searchParams.get('posId')) : undefined;
  const dateStart = searchParams.get('dateStart') || undefined;
  const dateEnd = searchParams.get('dateEnd') || undefined;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    posId ? ['get-tech-expense-reports', currentPage, pageSize, posId, dateStart, dateEnd] : null,
    () =>
      getTechExpenseReports({
        page: currentPage,
        size: pageSize,
        posId,
        startPeriod: dateStart ? new Date(dateStart) : undefined,
        endPeriod: dateEnd ? new Date(dateEnd) : undefined,
      }),
    { revalidateOnFocus: false }
  );

  const reports = data?.reports || [];
  const totalCount = data?.totalCount || 0;

  const renderStatus = getStatusTagRender(t);

  const { data: posData } = useSWR(
    ['get-pos'],
    () => getPoses({}),
    { revalidateOnFocus: false }
  );
  const poses = useMemo(() => {
    return posData?.map(p => ({ name: p.name, value: p.id })) || [];
  }, [posData]);

  const defaultCreateValues: TechExpenseReportCreateDto = {
    posId: 0,
    startPeriod: dayjs().startOf('month').toDate(),
    endPeriod: dayjs().endOf('month').toDate(),
  };

  const [formData, setFormData] = useState(defaultCreateValues);
  const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData as any);

  type FieldType = keyof TechExpenseReportCreateDto;

  const handleInputChange = (field: FieldType, value: string | Date) => {
    const numericFields = ['posId'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultCreateValues);
    reset();
    setDrawerOpen(false);
  };

  const { trigger: createTrigger, isMutating: creating } = useSWRMutation(
    'create-tech-expense-report',
    () => createTechExpenseReport(formData)
  );

  const onSubmit = async () => {
    try {
      await createTrigger();
      mutate();
      resetForm();
      showToast(t('success.recordCreated'), 'success');
    } catch {
      showToast(t('errors.submitFailed'), 'error');
    }
  };

  const columns = [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      key: 'id',
      sorter: (a: TechExpenseReport, b: TechExpenseReport) => a.id - b.id,
    },
    {
      title: t('marketing.period'),
      dataIndex: 'period',
      key: 'period',
      render: (_: any, record: TechExpenseReport) => {
        const start = dayjs(record.startPeriod).format('DD.MM.YYYY');
        const end = dayjs(record.endPeriod).format('DD.MM.YYYY');
        return (
          <Button
            type="link"
            onClick={() => {
              navigate({
                pathname: '/equipment/expense-report/edit',
                search: `?id=${record.id}`,
              });
            }}
          >
            {`${start} - ${end}`}
          </Button>
        );
      },
    },
    {
      title: t('table.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatus(t(`tables.${status}`)),
    },
    {
      title: t('table.columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: t('table.columns.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: Date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
  ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.expenseReport')}
          </span>
          <Button
            className="btn-primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawerOpen(true)}
          >
            {t('routes.add')}
          </Button>
        </div>
      </div>

      <GeneralFilters display={['pos', 'dateTime']} />

      <Table
        rowKey="id"
        dataSource={reports}
        columns={columns}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalCount,
          pageSizeOptions: ALL_PAGE_SIZES,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          onChange: (page, size) => {
            updateSearchParams(searchParams, setSearchParams, {
              page: String(page),
              size: String(size),
            });
          },
        }}
        scroll={{ x: 'max-content' }}
      />

      <Drawer
        placement="right"
        size="large"
        onClose={resetForm}
        open={drawerOpen}
        title={t('pos.creating')}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 w-full max-w-2xl mx-auto p-4"
        >
          <DropdownInput
            title={`${t('analysis.posId')}*`}
            options={poses}
            classname="w-full"
            {...register('posId', {
              required: t('validation.required'),
              validate: value => value !== 0 || t('validation.required'),
            })}
            value={formData.posId}
            onChange={value => handleInputChange('posId', value)}
            error={!!errors.posId}
          />

          <DateInput
            title={`${t('finance.begin')}*`}
            classname="w-full"
            value={formData.startPeriod ? dayjs(formData.startPeriod) : null}
            changeValue={date =>
              handleInputChange('startPeriod', date ? date.toDate() : new Date())
            }
            error={!!errors.startPeriod}
            {...register('startPeriod', { required: t('validation.required') })}
          />

          <DateInput
            title={`${t('finance.end')}*`}
            classname="w-full"
            value={formData.endPeriod ? dayjs(formData.endPeriod) : null}
            changeValue={date =>
              handleInputChange('endPeriod', date ? date.toDate() : new Date())
            }
            error={!!errors.endPeriod}
            {...register('endPeriod', { required: t('validation.required') })}
          />

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button onClick={resetForm}>{t('organizations.cancel')}</Button>
            <Button htmlType="submit" loading={creating} type="primary">
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default ExpenseReport;