// import DropdownInput from "@ui/Input/DropdownInput";
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnalysisCard from '@ui/Card/AnalysisCard';
import Filter from '@/components/ui/Filter/Filter';
import useSWR from 'swr';
import { getAllReports } from '@/services/api/reports';
import {
  useCurrentPage,
  usePageNumber,
  usePageSize,
  useSetCurrentPage,
  useSetPageSize,
} from '@/hooks/useAuthStore';
import { useFilterOn } from '@/components/context/useContext';
import CardSkeleton from '@/components/ui/Card/CardSkeleton';
import { Select } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

enum CategoryReportTemplate {
  POS = 'POS',
}

const Analysis: React.FC = () => {
  const { t } = useTranslation();

  const [cat, setCat] = useState('POS');
  const pageNumber = usePageNumber();
  const currentPage = useCurrentPage();
  const curr = useCurrentPage();
  const setCurr = useSetCurrentPage();
  const rowsPerPage = usePageNumber();
  const totalCount = usePageSize();
  const setTotalCount = useSetPageSize();
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const { filterOn, setFilterOn } = useFilterOn();
  const [tableLoading, setTableLoading] = useState(false);
  const [searchReport, setSearchReport] = useState('');

  const {
    data: filter,
    mutate: mutateGetAllReport,
    isLoading: loadingReports,
    isValidating: validatingReports,
  } = useSWR(['get-all-report'], () =>
    getAllReports({
      category: cat as CategoryReportTemplate,
      page: currentPage,
      size: pageNumber,
    })
  );

  useEffect(() => {
    setTableLoading(true);
    mutateGetAllReport().then(() => setTableLoading(false));
  }, [filterOn, mutateGetAllReport]);

  useEffect(() => {
    if (!loadingReports && filter?.count) setTotalCount(filter?.count);
  }, [filter?.count, loadingReports, setTotalCount]);

  const reportsData = useMemo(
    () =>
      filter?.reports.filter(report =>
        report.name.toLowerCase().includes(searchReport.toLowerCase())
      ) || [],
    [filter?.reports, searchReport]
  );

  const generatePaginationRange = () => {
    const range: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);

      if (curr > 3) range.push('...');

      const start = Math.max(2, curr - 1);
      const end = Math.min(totalPages - 1, curr + 1);
      for (let i = start; i <= end; i++) range.push(i);

      if (curr < totalPages - 2) range.push('...');

      range.push(totalPages);
    }

    return range;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      setFilterOn(!filterOn);
      setCurr(page);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.analysis')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>

      <Filter
        count={reportsData.length}
        hideDateTime={true}
        hideCity={true}
        search={searchReport}
        setSearch={setSearchReport}
      >
        {/* <DropdownInput
                    title={t("warehouse.category")}
                    value={cat}
                    classname="w-64"
                    options={[
                        { name: "POS", value: "POS" }
                    ]}
                    onChange={(value) => setCat(value)}
                /> */}
        <div>
          <div className="text-sm text-text02">{t('warehouse.category')}</div>
          <Select
            className="w-full sm:w-80 h-10"
            value={cat}
            onChange={value => setCat(value)}
            options={[{ label: t('analysis.posId'), value: 'POS' }]}
            dropdownRender={menu => (
              <div style={{ maxHeight: 100, overflowY: 'auto' }}>{menu}</div>
            )}
          />
        </div>
      </Filter>
      <hr className="my-4" />
      <div className="space-y-3">
        <div className="text-text01 uppercase">{t('analysis.oper')}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {loadingReports || validatingReports || tableLoading ? (
            <CardSkeleton cardHeight="200px" cardWidth="456px" />
          ) : (
            reportsData.map(report => (
              <AnalysisCard
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
          onClick={() => {
            const newPage = Math.max(1, curr - 1);
            setFilterOn(!filterOn);
            setCurr(newPage);
          }}
          disabled={curr === 1}
          className={`px-2 py-1 ${curr === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-text01'}`}
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
              className={`px-4 py-2 font-semibold ${curr === page ? 'bg-white text-primary02 rounded-lg border border-primary02' : 'text-text01'}`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => {
            setFilterOn(!filterOn);
            setCurr(Math.min(totalPages, curr + 1));
          }}
          disabled={curr === totalPages}
          className={`px-2 py-1 ${curr === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-text01'}`}
        >
          <ArrowRightOutlined />
        </button>
      </div>
    </div>
  );
};

export default Analysis;
