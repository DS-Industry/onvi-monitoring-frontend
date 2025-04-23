import { Card, Typography, Button, Space, Row, Col, DatePicker, Grid, Skeleton } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import useSWR from "swr";
import { getRating } from "@/services/api/organization";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import BarChart from "@ui/BarChart";

type Rating = {
  posName: string;
  sum: number;
};

const durations: { label: string; value: "today" | "week" | "month" }[] = [
  { label: "Today", value: "today" },
  { label: "For a week", value: "week" },
  { label: "For a month", value: "month" },
];

const RatingOfCarWashes = () => {
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);
  const { t } = useTranslation();
  const { Title } = Typography;
  const { RangePicker } = DatePicker;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [dateRange, setDateRange] = useState({
    dateStart: new Date("2023-01-01T00:00:00"),
    dateEnd: new Date(`${formattedDate}T23:59:59`),
  });

  const [activeDuration, setActiveDuration] = useState<"today" | "week" | "month" | null>(null);

  const { data, isLoading: loadingRating, isValidating: validatingRating } = useSWR(["get-rating-org", dateRange], () =>
    getRating(dateRange)
  );

  const ratingData: Rating[] = data?.map((item: Rating) => item) || [];

  const handleDurationClick = (duration: "today" | "week" | "month") => {
    const now = new Date();
    let newDateStart: Date = now;

    if (duration === "today") {
      newDateStart = new Date(now.toISOString().slice(0, 10)); 
    } else if (duration === "week") {
      newDateStart = new Date();
      newDateStart.setDate(now.getDate() - 7); 
    } else if (duration === "month") {
      newDateStart = new Date();
      newDateStart.setMonth(now.getMonth() - 1); 
    }

    setDateRange({
      dateStart: newDateStart,
      dateEnd: now,
    });

    setActiveDuration(duration);
  };

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange({
        dateStart: start?.toDate() || new Date(),
        dateEnd: end?.toDate() || new Date(),
      });
      setActiveDuration(null);
    }
  };

  return (
    <Card
      className="mt-4 w-full min-w-64"
      bodyStyle={{ padding: '24px' }}
      variant='borderless'
    >
      <Title level={4} style={{ marginBottom: '24px' }}>
        {t("indicators.carWash")}
      </Title>

      <Row justify="space-between" gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Space wrap>
            {durations.map((duration) => (
              <Button
                key={duration.value}
                type={activeDuration === duration.value ? "primary" : "default"}
                shape="round"
                onClick={() => handleDurationClick(duration.value)}
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
                value={dayjs(dateRange.dateStart)}
                onChange={(date) => {
                  if (date) {
                    setDateRange({
                      ...dateRange,
                      dateStart: date.toDate(),
                    });
                    setActiveDuration(null);
                  }
                }}
                style={{ width: '100%' }}
              />
              <DatePicker
                placeholder="End date"
                value={dayjs(dateRange.dateEnd)}
                onChange={(date) => {
                  if (date) {
                    setDateRange({
                      ...dateRange,
                      dateEnd: date.toDate(),
                    });
                    setActiveDuration(null);
                  }
                }}
                style={{ width: '100%' }}
              />
            </Space>
          ) : (
            // Desktop view: RangePicker
            <RangePicker
              onChange={handleDateRangeChange}
              value={[
                dayjs(dateRange.dateStart),
                dayjs(dateRange.dateEnd)
              ]}
              allowClear={false}
              style={{ width: '100%' }}
            />
          )}
        </Col>
      </Row>

      <div className="chart-container" style={{ width: '100%', overflowX: 'auto' }}>
        {loadingRating || validatingRating ? (
          <div className="h-full flex flex-col w-full">
            <Skeleton.Image style={{ width: '100%', height: '180px' }} active />
            <Skeleton.Image style={{ width: '100%', marginTop: 16, height: '180px' }} active />
          </div>
        ) : ratingData.length > 0 ? (
          <BarChart data={ratingData} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Space direction="vertical" align="center">
              <BarChartOutlined style={{ fontSize: '48px', opacity: 0.5 }} />
              <Typography.Text type="secondary">No data available</Typography.Text>
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RatingOfCarWashes;