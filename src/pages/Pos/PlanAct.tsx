import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

import { getPlanFactMonthlyByPos, updatePosMonthlyPlan } from '@/services/api/pos';

import { Button, InputNumber, Table } from 'antd';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { useToast } from '@/hooks/useToast';

import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { getCurrencyRender } from '@/utils/tableUnits';
import TableUtils from '@/utils/TableUtils.tsx';

import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

interface PlanFact {
  monthDate: string;
  plan: number;
  cashFact: number;
  virtualSumFact: number;
  yandexSumFact: number;
  onviSumFact: number;
  sumFact: number;
  completedPercent: number;
  notCompletedPercent: number;
}

interface PlanFactRow extends PlanFact {
  monthDateDisplay: string;
}

const PlanAct: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [editedPlans, setEditedPlans] = useState<Record<string, number>>({});
  const [savingMonth, setSavingMonth] = useState<string | null>(null);

  const today = dayjs().format('YYYY-MM-DD');

  const posId = Number(searchParams.get('posId')) || undefined;
  const dateStart = searchParams.get('dateStart') || `${today} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${today} 23:59`;

  const hasRequiredFilters = Boolean(
    posId &&
    searchParams.get('dateStart') &&
    searchParams.get('dateEnd')
  );

  const filterParams = useMemo(
    () => ({
      posId,
      dateStart,
      dateEnd,
    }),
    [posId, dateStart, dateEnd]
  );

  const swrKey = useMemo(() => {
    if (!hasRequiredFilters || !filterParams.posId) {
      return null;
    }

    return [
      'get-plan-fact-monthly-by-pos',
      filterParams.posId,
      filterParams.dateStart,
      filterParams.dateEnd,
    ];
  }, [filterParams, hasRequiredFilters]);

  const { data: planFactData, isLoading: isPlanLoading, mutate } = useSWR(
    swrKey,
    () =>
      getPlanFactMonthlyByPos(filterParams.posId!, {
        dateStart: dayjs(filterParams.dateStart).format('YYYY-MM-DD'),
        dateEnd: dayjs(filterParams.dateEnd).format('YYYY-MM-DD'),
      }),
    {
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const totalCount = hasRequiredFilters ? (planFactData?.monthly?.length ?? 0) : 0;

  const planFacts = useMemo<PlanFactRow[]>(() => {
    return (
      planFactData?.monthly
        ?.slice()
        .sort(
          (a: PlanFact, b: PlanFact) =>
            new Date(a.monthDate).getTime() - new Date(b.monthDate).getTime()
        )
        .map((item: PlanFact) => ({
          ...item,
          monthDateDisplay: dayjs(item.monthDate).format('MM.YYYY'),
        })) || []
    );
  }, [planFactData]);

  useEffect(() => {
    const nextPlans: Record<string, number> = {};
    planFacts.forEach((item) => {
      nextPlans[item.monthDate] = Number(item.plan) || 0;
    });
    setEditedPlans(nextPlans);
  }, [planFacts]);

  const handlePlanChange = useCallback((monthDate: string, value: number | null) => {
    setEditedPlans((prev) => ({
      ...prev,
      [monthDate]: value ?? 0,
    }));
  }, []);

  const handleSavePlan = useCallback(
    async (record: PlanFactRow) => {
      if (!posId) {
        return;
      }

      const monthlyPlan = Number(editedPlans[record.monthDate] ?? 0);

      setSavingMonth(record.monthDate);
      try {
        await updatePosMonthlyPlan(posId, {
          monthDate: record.monthDate,
          monthlyPlan,
        });

        await mutate();
        showToast(t('success.recordUpdated'), 'success');
      } catch (_error) {
        showToast(t('errors.updateFailed'), 'error');
      } finally {
        setSavingMonth(null);
      }
    },
    [editedPlans, mutate, posId, showToast, t]
  );

  const currencyRender = getCurrencyRender();

  const columnsPlanFact: ColumnsType<PlanFactRow> = [
    {
      title: t('table.columns.month'),
      dataIndex: 'monthDateDisplay',
      key: 'monthDate',
    },
    {
      title: t('table.headers.plan'),
      dataIndex: 'plan',
      key: 'plan',
      render: (_value, record) => {
        const editedValue = editedPlans[record.monthDate] ?? 0;
        const isChanged = editedValue !== record.plan;
        const isSaving = savingMonth === record.monthDate;

        return (
          <div className="flex items-center gap-2 min-w-[220px]">
            <InputNumber
              value={editedValue}
              min={0}
              precision={2}
              className="w-full"
              onChange={(value) => handlePlanChange(record.monthDate, value)}
            />
            <Button
              type="primary"
              onClick={() => handleSavePlan(record)}
              disabled={!isChanged}
              loading={isSaving}
            >
              {t('organizations.save')}
            </Button>
          </div>
        );
      },
    },
    {
      title: t('deposit.columns.cash'),
      dataIndex: 'cashFact',
      key: 'cashFact',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.cashless'),
      dataIndex: 'virtualSumFact',
      key: 'virtualSumFact',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.yandexSum'),
      dataIndex: 'yandexSumFact',
      key: 'yandexSumFact',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.onviSum'),
      dataIndex: 'onviSumFact',
      key: 'onviSumFact',
      render: currencyRender,
    },
    {
      title: t('table.headers.factSummary'),
      dataIndex: 'sumFact',
      key: 'sumFact',
      render: currencyRender,
    },
    {
      title: t('table.headers.planCompleted'),
      dataIndex: 'completedPercent',
      key: 'completedPercent',
      render: (_value, record) =>
        TableUtils.createPercentFormat(record.completedPercent),
    },
    {
      title: t('table.headers.planNotCompleted'),
      dataIndex: 'notCompletedPercent',
      key: 'notCompletedPercent',
      render: (_value, record) =>
        TableUtils.createPercentFormat(record.notCompletedPercent),
    },
  ];

  const {
    checkedList,
    setCheckedList,
    options: columnOptions,
    visibleColumns,
  } = useColumnSelector(columnsPlanFact, 'plan-fact-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.planAct')}
        </span>
      </div>

      <GeneralFilters
        count={totalCount}
        display={['pos', 'city', 'dateTime']}
      />

      {hasRequiredFilters && (
        <div className="mt-8">
          <ColumnSelector
            checkedList={checkedList}
            options={columnOptions}
            onChange={setCheckedList}
          />

          <Table
            rowKey="monthDate"
            dataSource={planFacts}
            columns={visibleColumns}
            loading={isPlanLoading}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </div>
      )}
    </>
  );
};

export default PlanAct;
