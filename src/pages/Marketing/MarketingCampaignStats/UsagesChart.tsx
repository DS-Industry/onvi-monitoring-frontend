import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { CampaignAnalyticsGranularity } from '@/services/api/marketing';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UsagesChartProps {
  data: { bucket: string; count: number }[];
  granularity: CampaignAnalyticsGranularity;
}

const formatBucketLabel = (
  bucket: string,
  granularity: CampaignAnalyticsGranularity
): string => {
  const date = dayjs(bucket);

  switch (granularity) {
    case 'month':
      return date.format('MM.YYYY');
    case 'year':
      return date.format('YYYY');
    case 'day':
    case 'week':
    default:
      return date.format('DD.MM');
  }
};

const UsagesChart: React.FC<UsagesChartProps> = ({ data, granularity }) => {
  const { t } = useTranslation();

  const labels = data.map(item => formatBucketLabel(item.bucket, granularity));

  const chartData = {
    labels,
    datasets: [
      {
        label: t('marketingCampaigns.uses'),
        data: data.map(item => item.count),
        borderColor: '#0B68E1',
        backgroundColor: 'rgba(11, 104, 225, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0B68E1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (context: any) => {
            const dataIndex = context[0]?.dataIndex;
            const bucket = data[dataIndex]?.bucket;
            return bucket ? formatBucketLabel(bucket, granularity) : '';
          },
          label: (context: any) => {
            const value = context.parsed.y;
            return `${t('marketingCampaigns.uses')}: ${Number(value).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxTicksLimit: 10,
          callback: function (_value: unknown, index: number) {
            const step = Math.ceil(data.length / 10);
            return index % step === 0 ? labels[index] : '';
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function (value: string | number) {
            return Number(value).toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="h-96 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default UsagesChart;
