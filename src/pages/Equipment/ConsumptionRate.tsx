import {
  ConsumptionRateResponse,
  getConsumptionRate,
  getPoses,
  patchProgramCoefficient,
} from '@/services/api/equipment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import { useSearchParams } from 'react-router-dom';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import Input from '@/components/ui/Input/Input';
import { Table, Button } from 'antd';

const ConsumptionRate: React.FC = () => {
  const { t } = useTranslation();
  const allCategoriesText = t('warehouse.all');
  const [searchParams] = useSearchParams();
  const placementId = searchParams.get('city');
  const posId = searchParams.get('posId');
  const city = placementId ? Number(placementId) : undefined;
  const userPermissions = usePermissions();
  const { data: posData } = useSWR(
    [`get-pos`, city],
    () => getPoses({ placementId: city }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: consumptionRateData, isLoading: programCoeffsLoading } = useSWR(
    posId ? [`get-consumption-rate`, posId] : null,
    () => getConsumptionRate(Number(posId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: patchProgramCoeff, isMutating } = useSWRMutation(
    ['patch-program-coeff', posId],
    async (
      _,
      {
        arg,
      }: {
        arg: {
          valueData: {
            programTechRateId: number;
            literRate: number;
            concentration: number;
          }[];
        };
      }
    ) => {
      return patchProgramCoefficient(Number(posId), arg);
    }
  );

  const poses: { name: string; value: number | string }[] =
    posData?.map(item => ({ name: item.name, value: item.id })) || [];

  const posesAllObj = {
    name: allCategoriesText,
    value: '*',
  };

  poses.unshift(posesAllObj);

  const [tableData, setTableData] = useState(consumptionRateData);

  useEffect(() => {
    if (consumptionRateData) {
      const sortedData = [...consumptionRateData].sort((a, b) =>
        a.programTypeName.localeCompare(b.programTypeName)
      );
      setTableData(sortedData);
    }
  }, [consumptionRateData]);

  useEffect(() => {
    if (consumptionRateData) {
      const sortedData = [...consumptionRateData].sort((a, b) =>
        a.programTypeName.localeCompare(b.programTypeName)
      );
      setTableData(sortedData); // Update state with sorted data
    }
  }, [consumptionRateData]);

  const handleTableChange = (
    id: number,
    key: string,
    value: string | number
  ) => {
    setTableData(prevData => {
      const updatedData = prevData?.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      );

      return updatedData?.sort((a, b) =>
        a.programTypeName.localeCompare(b.programTypeName)
      );
    });
  };

  const handleSubmit = async () => {
    const hasNegativeValues =
      tableData &&
      tableData.some(data => data.literRate < 0 || data.concentration < 0);

    if (hasNegativeValues) {
      return; // Stop execution if there are negative values
    }

    const programCoeff: {
      programTechRateId: number;
      literRate: number;
      concentration: number;
    }[] =
      tableData?.map(data => ({
        programTechRateId: data.id,
        literRate: Number(data.literRate),
        concentration: Number(data.concentration),
      })) || [];

    const result = await patchProgramCoeff({
      valueData: programCoeff,
    });

    if (result) {
      mutate([`get-consumption-rate`, posId]);
    }
  };

  const columnsConsumptionRate = [
    {
      title: 'Программа',
      dataIndex: 'programTypeName',
      key: 'programTypeName',
      render: (row: { programTypeName: string }) => (
        <span>{row.programTypeName}</span>
      ),
    },
    {
      title: 'Расход литр/минута',
      dataIndex: 'literRate',
      key: 'literRate',
      render: (
        row: { literRate: number; id: number },
        handleChange: (arg0: number, arg1: string, arg2: string) => void
      ) => (
        <Input
          type="number"
          value={row.literRate}
          changeValue={e => handleChange(row.id, 'literRate', e.target.value)}
          error={row.literRate < 0}
        />
      ),
    },
    {
      title: 'Концентрация 1/х',
      dataIndex: 'concentration',
      key: 'concentration',
      render: (
        row: { concentration: number; id: number },
        handleChange: (arg0: number, arg1: string, arg2: string) => void
      ) => (
        <Input
          type="number"
          value={row.concentration}
          changeValue={e =>
            handleChange(row.id, 'concentration', e.target.value)
          }
          error={row.concentration < 0}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.consumption')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>
      <GeneralFilters
        count={tableData?.length || 0}
        display={['city', 'pos', 'count']}
      />
      <div className="mt-8">
        <Table
          dataSource={tableData}
          columns={columnsConsumptionRate.map(col => ({
            ...col,
            render: (text: number, record: ConsumptionRateResponse) =>
              col.render ? col.render(record, handleTableChange) : text,
          }))}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          loading={programCoeffsLoading}
        />
      </div>
      {tableData && tableData.length > 0 && (
        <div className="flex mt-4 space-x-4">
          <Button className="w-[168px] btn-outline-primary">
            {t('organizations.cancel')}
          </Button>
          <Can
            requiredPermissions={[
              { action: 'manage', subject: 'TechTask' },
              { action: 'update', subject: 'TechTask' },
            ]}
            userPermissions={userPermissions}
          >
            {allowed =>
              allowed && (
                <Button
                  htmlType="submit"
                  loading={isMutating}
                  onClick={handleSubmit}
                  className="w-[168px] btn-primary"
                >
                  {t('organizations.save')}
                </Button>
              )
            }
          </Can>
        </div>
      )}
    </div>
  );
};

export default ConsumptionRate;
