import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import { TransactionAnalyticsDataPoint } from '@/services/api/marketing';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TransactionAnalyticsChartProps {
  data: TransactionAnalyticsDataPoint[];
}

const TransactionAnalyticsChart: React.FC<TransactionAnalyticsChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const labels = data.map((_, index) => index.toString());
  
  const chartData = {
    labels,
    datasets: [
      {
        label: t('marketingLoyalty.accruals'),
        data: data.map(item => item.accruals),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.1,
      },
      {
        label: t('marketingLoyalty.debits'),
        data: data.map(item => item.debits),
        borderColor: '#BFFA00',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#BFFA00',
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
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (context: any) => {
            const dataIndex = context[0].dataIndex;
            const date = data[dataIndex]?.date;
            return date ? new Date(date).toLocaleDateString() : '';
          },
          label: (context: any) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxTicksLimit: 10,
          callback: function(value: any, index: any) {
            const step = Math.ceil(data.length / 10);
            return index % step === 0 ? value : '';
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        title: {
          display: false,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString();
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

export default TransactionAnalyticsChart;
