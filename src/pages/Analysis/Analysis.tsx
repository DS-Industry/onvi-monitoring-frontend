import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnalysisCard from '@ui/Card/AnalysisCard';
import useSWR from 'swr';
import { CategoryReportTemplate, getAllReports } from '@/services/api/reports';
import CardSkeleton from '@/components/ui/Card/CardSkeleton';
import { Pagination, Select } from 'antd';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';

const Analysis: React.FC = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<CategoryReportTemplate>(
    'POS' as CategoryReportTemplate
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;
  const searchReport = searchParams.get('search') || '';
  const [tableLoading, setTableLoading] = useState(false);
  const navigate = useNavigate();

  const {
    data: filter,
    mutate: mutateGetAllReport,
    isLoading: loadingReports,
    isValidating: validatingReports,
  } = useSWR(
    ['get-all-report', category, currentPage, pageSize],
    () =>
      getAllReports({
        category: category,
        page: currentPage,
        size: pageSize,
      }),
    {
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    setTableLoading(true);
    mutateGetAllReport().finally(() => setTableLoading(false));
  }, [category, currentPage, pageSize, mutateGetAllReport]);

  const reportsData = useMemo(
    () =>
      filter?.reports?.filter(report =>
        report.name.toLowerCase().includes(searchReport.toLowerCase())
      ) || [],
    [filter?.reports, searchReport]
  );

  const totalCount = filter?.count || 0;

  const updatePage = (page: number) => {
    updateSearchParams(searchParams, setSearchParams, {
      page: String(page),
      size: String(pageSize),
    });
  };

  return (
    <div>
      <div className="ml-12 md:ml-0 flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.analysis')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>

      <GeneralFilters count={reportsData.length} display={['search']}>
        <div>
          <div className="text-sm text-text02 mb-1">
            {t('warehouse.category')}
          </div>
          <Select
            className="w-full sm:w-80"
            value={category}
            onChange={value => {
              setCategory(value);
              updatePage(1);
            }}
            options={[{ label: t('analysis.posId'), value: 'POS' }]}
            popupRender={menu => (
              <div style={{ maxHeight: 100, overflowY: 'auto' }}>{menu}</div>
            )}
          />
        </div>
      </GeneralFilters>

      <hr className="my-4" />

      <div className="space-y-3">
        <div className="text-text01 uppercase">{t('analysis.oper')}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {loadingReports || validatingReports || tableLoading ? (
            <CardSkeleton cardHeight="200px" cardWidth="456px" />
          ) : (
            reportsData.map(report => (
              <AnalysisCard
                key={report.id}
                iconText="file"
                title={report.name}
                description={report.description || ''}
                onNavigate={() => {
                  navigate(`/analysis/report?id=${report?.id}`);
                }}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-4">
        <Pagination
          current={currentPage}
          total={totalCount}
          pageSize={pageSize}
          pageSizeOptions={ALL_PAGE_SIZES}
          onChange={(page, size) => {
            updateSearchParams(searchParams, setSearchParams, {
              page: String(page),
              size: String(size),
            });
          }}
          showSizeChanger={true}
        />
      </div>
    </div>
  );
};

export default Analysis;
