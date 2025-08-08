import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnalysisCard from '@ui/Card/AnalysisCard';
import useSWR from 'swr';
import { getAllReports } from '@/services/api/reports';
import CardSkeleton from '@/components/ui/Card/CardSkeleton';
import { Select } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';

enum CategoryReportTemplate {
  POS = 'POS',
}

const Analysis: React.FC = () => {
  const { t } = useTranslation();
  const [cat, setCat] = useState<CategoryReportTemplate>(
    'POS' as CategoryReportTemplate
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;
  const searchReport = searchParams.get('search') || '';
  const [tableLoading, setTableLoading] = useState(false);

  const {
    data: filter,
    mutate: mutateGetAllReport,
    isLoading: loadingReports,
    isValidating: validatingReports,
  } = useSWR(['get-all-report', cat, currentPage, pageSize], () =>
    getAllReports({
      category: cat,
      page: currentPage,
      size: pageSize,
    })
  );

  useEffect(() => {
    setTableLoading(true);
    mutateGetAllReport().finally(() => setTableLoading(false));
  }, [cat, currentPage, pageSize, mutateGetAllReport]);

  const reportsData = useMemo(
    () =>
      filter?.reports?.filter(report =>
        report.name.toLowerCase().includes(searchReport.toLowerCase())
      ) || [],
    [filter?.reports, searchReport]
  );

  const totalCount = filter?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const generatePaginationRange = () => {
    const range: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);

      if (currentPage > 3) range.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) range.push(i);

      if (currentPage < totalPages - 2) range.push('...');

      range.push(totalPages);
    }

    return range;
  };

  const updatePage = (page: number) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev.toString());
      updated.set('page', page.toString());
      updated.set('size', pageSize.toString());
      return updated;
    });
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') updatePage(page);
  };

  const handlePrev = () => {
    if (currentPage > 1) updatePage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) updatePage(currentPage + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.analysis')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>

      <GeneralFilters count={reportsData.length} display={['search']}>
        <div>
          <div className="text-sm text-text02">{t('warehouse.category')}</div>
          <Select
            className="w-full sm:w-80 h-10"
            value={cat}
            onChange={value => {
              setCat(value);
              updatePage(1); // Reset to first page on category change
            }}
            options={[{ label: t('analysis.posId'), value: 'POS' }]}
            dropdownRender={menu => (
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
                firstText={report.name}
                secondText={report.description || ''}
                reports={report}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-2 py-1 ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-text01'
          }`}
        >
          <ArrowLeftOutlined />
        </button>

        {generatePaginationRange().map((page, index) =>
          page === '...' ? (
            <span key={index} className="px-2 py-1 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              className={`px-4 py-2 font-semibold ${
                currentPage === page
                  ? 'bg-white text-primary02 rounded-lg border border-primary02'
                  : 'text-text01'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-text01'
          }`}
        >
          <ArrowRightOutlined />
        </button>
      </div>
    </div>
  );
};

export default Analysis;
