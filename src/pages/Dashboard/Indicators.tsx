import React, { useState } from 'react';
import TotalVisitorsIcon from '@icons/total-visitors.svg?react';
import ProfitIcon from '@icons/profit.svg?react';
import TotalDownTimeIcon from '@icons/total-downtime.svg?react';
import Notification from '@ui/Notification';
import LineChart from '@ui/LineChart';
import useSWR from 'swr';
import { getStatistic, getStatisticsGraph } from '@/services/api/organization';
import { useTranslation } from 'react-i18next';
import { getPoses } from '@/services/api/equipment';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  DatePicker,
  Grid,
  Skeleton,
} from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
const { Text, Title } = Typography;
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
interface Statistic {
  cars: number;
  sum: number;
}

const Indicators: React.FC = () => {
  const { RangePicker } = DatePicker;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [notificationVisible, setNotificationVisible] = useState(true);
  const [searchParams] = useSearchParams();
  const startDate = dayjs(
    searchParams.get('dateStart') || dayjs().format('YYYY-MM-DD')
  )
    .startOf('day')
    .toDate();
  const endDate = dayjs(
    searchParams.get('dateEnd') || dayjs().format('YYYY-MM-DD')
  )
    .endOf('day')
    .toDate();
  const [dateRangeRev, setDateRangeRev] = useState({
    dateStart: startDate,
    dateEnd: endDate,
  });
  const { t } = useTranslation();
  const allCategoriesText = t('warehouse.all');
  const placementId = searchParams.get('city');
  const city = placementId ? Number(placementId) : undefined;
  const [activeDurationRev, setActiveDurationRev] = useState<
    'today' | 'week' | 'month' | null
  >(null);

  const durations: { label: string; value: 'today' | 'week' | 'month' }[] = [
    { label: t('dashboard.today'), value: 'today' },
    { label: t('dashboard.week'), value: 'week' },
    { label: t('dashboard.month'), value: 'month' },
  ];

  const { data, isLoading: cardsDataLoading } = useSWR(
    ['get-statistic'],
    () => getStatistic(),
    {
      shouldRetryOnError: false,
    }
  );

  const {
    data: graphData,
    isLoading: graphLoading,
    isValidating: graphValidating,
  } = useSWR(['get-graph', dateRangeRev], () =>
    getStatisticsGraph({
      ...dateRangeRev,
    })
  );

  const graph = graphData || [];

  const { data: posData } = useSWR(
    [`get-pos`, city],
    () => getPoses({ placementId: city }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const statisticData: Statistic = data || { cars: 0, sum: 0 };

  const poses: { name: string; value: number | undefined }[] =
    posData?.map(item => ({ name: item.name, value: item.id })) || [];

  const posesAllObj = {
    name: allCategoriesText,
    value: undefined,
  };

  poses.unshift(posesAllObj);

  const formatNumber = (num: number): string => {
    if (num === null || num === undefined || isNaN(num)) return '-';

    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(num);
  };

  const cards = [
    {
      title: 'visitors',
      number: statisticData ? formatNumber(statisticData.cars) : 0,
      unit: '',
      icon: TotalVisitorsIcon,
      isPositive: true,
      percentage: '12',
      day: 'К предыдущему дню',
    },
    {
      title: 'profit',
      number: statisticData ? formatNumber(statisticData.sum) : 0,
      unit: '₽',
      icon: ProfitIcon,
      isPositive: true,
      percentage: '15',
      day: 'К предыдущему дню',
    },
    {
      title: 'downtime',
      number: 7,
      unit: 'мин',
      icon: TotalDownTimeIcon,
      isPositive: true,
      percentage: '15',
      day: 'К предыдущему дню',
    },
  ];

  const handleDurationClickRev = (duration: 'today' | 'week' | 'month') => {
    const now = new Date();
    let newDateStart: Date = now;

    if (duration === 'today') {
      newDateStart = new Date(now.toISOString().slice(0, 10));
    } else if (duration === 'week') {
      newDateStart = new Date();
      newDateStart.setDate(now.getDate() - 7);
    } else if (duration === 'month') {
      newDateStart = new Date();
      newDateStart.setMonth(now.getMonth() - 1);
    }

    setDateRangeRev({
      dateStart: newDateStart,
      dateEnd: now,
    });
    setActiveDurationRev(duration);
  };

  const handleDateRangeRevChange: RangePickerProps['onChange'] = dates => {
    if (dates) {
      const [start, end] = dates;
      setDateRangeRev({
        dateStart: start?.toDate() || new Date(),
        dateEnd: end?.toDate() || new Date(),
      });
      setActiveDurationRev(null);
    }
  };

  return (
    <>
      {notificationVisible && (
        <Notification
          title={t('indicators.notification')}
          message={t('indicators.notificationText')}
          onClose={() => setNotificationVisible(false)}
          link={''}
          linkUrl={''}
        />
      )}
      <div className="grid gap-4">
        {/* Cards Section */}
        <Row gutter={[24, 24]}>
          {cards.map(item => (
            <Col xs={24} md={12} lg={8} key={item.title}>
              <Card
                variant="borderless"
                styles={{
                  body: {
                    padding: 24,
                    borderRadius: 24,
                    backgroundColor: '#fff',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
                  },
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      {t(`indicators.${item.title}`)}
                    </Text>
                    <Title level={2} style={{ margin: 0, color: '#202224' }}>
                      {cardsDataLoading ? (
                        <Skeleton.Button
                          active={true}
                          size={'default'}
                          shape={'default'}
                          block={false}
                        />
                      ) : (
                        <>
                          {item.number} {item.unit}
                        </>
                      )}
                    </Title>
                  </div>
                  <item.icon />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Revenue Section */}
        <div className="mt-4 py-3 lg:py-8 grid gap-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl px-3 lg:px-8">
            {t('indicators.revenue')}
          </p>
          <Row
            justify="space-between"
            align="middle"
            wrap
            gutter={[16, 16]}
            style={{ marginBottom: '4px', padding: '20px' }}
          >
            <Col xs={24} lg={16}>
              <Space wrap>
                {durations.map(duration => (
                  <Button
                    key={duration.value}
                    type={
                      activeDurationRev === duration.value
                        ? 'primary'
                        : 'default'
                    }
                    shape="round"
                    onClick={() => handleDurationClickRev(duration.value)}
                  >
                    {duration.label}
                  </Button>
                ))}
              </Space>
            </Col>
            <Col xs={24} lg={8}>
              {screens.xs ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <DatePicker
                    placeholder="Start date"
                    value={dayjs(dateRangeRev.dateStart)}
                    onChange={date => {
                      if (date) {
                        setDateRangeRev({
                          ...dateRangeRev,
                          dateStart: date.toDate(),
                        });
                        setActiveDurationRev(null);
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                  <DatePicker
                    placeholder="End date"
                    value={dayjs(dateRangeRev.dateEnd)}
                    onChange={date => {
                      if (date) {
                        setDateRangeRev({
                          ...dateRangeRev,
                          dateEnd: date.toDate(),
                        });
                        setActiveDurationRev(null);
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                </Space>
              ) : (
                <RangePicker
                  onChange={handleDateRangeRevChange}
                  value={[
                    dayjs(dateRangeRev.dateStart),
                    dayjs(dateRangeRev.dateEnd),
                  ]}
                  allowClear={false}
                  style={{ width: '100%' }}
                />
              )}
            </Col>
          </Row>
          <div className="w-full h-64 lg:h-96 overflow-auto px-3 lg:px-8">
            {graphLoading || graphValidating ? (
              <div className="h-full flex flex-col w-full">
                <Skeleton.Image
                  style={{ width: '100%', height: '380px' }}
                  active
                />
              </div>
            ) : graph.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '300px',
                }}
              >
                <Space direction="vertical" align="center">
                  <BarChartOutlined
                    style={{ fontSize: '48px', opacity: 0.5 }}
                  />
                  <Typography.Text type="secondary">
                    No data available
                  </Typography.Text>
                </Space>
              </div>
            ) : (
              <LineChart revenueData={graph} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Indicators;
