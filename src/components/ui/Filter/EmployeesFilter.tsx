import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select, Collapse, Typography, Input } from 'antd';
import Button from '@ui/Button/Button.tsx';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@/utils/constants.ts';
import useSWR from 'swr';
import { getPlacement } from '@/services/api/device';
import { useUser } from '@/hooks/useUserStore';

const Text = Typography.Text;

type Optional = {
  name: string;
  value: string | number;
};

type EmployeesFilterProps = {
  count: number;
  positions?: Optional[];
  organizations?: Optional[];
};

const EmployeesFilter: React.FC<EmployeesFilterProps> = ({
  count,
  positions,
  organizations,
}) => {
  const { t } = useTranslation();
  const [activeFilterKey, setActiveFilterKey] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const allCategoriesText = t('warehouse.all');
  const name = searchParams.get('name') || undefined;
  const user = useUser();

  const { data: cityData } = useSWR([`get-city`], () => getPlacement(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const cities: { name: string; value: number | string }[] =
    cityData?.map(item => ({ name: item.region, value: item.id })) || [];

  const citiesAllObj = {
    name: allCategoriesText,
    value: '*',
  };

  cities.unshift(citiesAllObj);

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      placementId: undefined,
      hrPositionId: undefined,
      organizationId: undefined,
      name: undefined,
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
    });
  };

  return (
    <Collapse
      bordered={false}
      ghost
      style={{ marginBottom: 16 }}
      activeKey={activeFilterKey}
      onChange={keys => setActiveFilterKey(keys)}
      items={[
        {
          key: 'filter-1',
          label: (
            <span className="font-semibold text-base">
              {activeFilterKey.includes('filter-1')
                ? t('routes.filter')
                : t('routes.expand')}
            </span>
          ),
          style: { background: '#fafafa', borderRadius: 8 },
          children: (
            <div className="overflow-hidden transition-all duration-500 ease-in-out">
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                  <div className="flex flex-col w-full sm:w-80">
                    <Text>{t('pos.city')}</Text>
                    <Select
                      className="w-full"
                      value={getParam(searchParams, 'placementId', '*')}
                      onChange={(val: string) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          placementId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={cities?.map(item => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
                      showSearch={true}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>

                  <div className="flex flex-col w-full sm:w-80">
                    <Text>{t('roles.job')}</Text>
                    <Select
                      className="w-full"
                      value={getParam(searchParams, 'hrPositionId', '*')}
                      onChange={(val: string) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          hrPositionId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={positions?.map(item => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
                      showSearch={true}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>

                  <div className="flex flex-col w-full sm:w-80">
                    <Text>{t('warehouse.organization')}</Text>
                    <Select
                      className="w-full"
                      value={getParam(
                        searchParams,
                        'organizationId',
                        String(user.organizationId)
                      )}
                      onChange={(val: string) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          organizationId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={organizations?.map(item => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
                      showSearch={true}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>

                  <div className="flex flex-col w-full sm:w-80">
                    <Text>{t('hr.full')}</Text>
                    <Input
                      className="w-full"
                      placeholder={t('hr.enter')}
                      value={name}
                      onChange={e => {
                        updateSearchParams(searchParams, setSearchParams, {
                          name: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Button
                  title={t('analysis.reset')}
                  type="outline"
                  handleClick={resetFilters}
                  classname="w-[168px]"
                />

                <p className="font-semibold">
                  {t('analysis.found')}: {count}
                </p>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default EmployeesFilter;
