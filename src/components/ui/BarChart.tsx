import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type OrgRatingDataItem = {
  posName: string;
  sum: number | 0;
};

interface BarChartProps {
  data: OrgRatingDataItem[];
}

const BarChart = ({ data: orgRatingData }: BarChartProps) => {
  // Преобразуем массив объектов в данные для графика
  const { t } = useTranslation();
  const labels = orgRatingData.map((item: { posName: string }) => item.posName);
  const datasetData = orgRatingData.map((item: { sum: number }) => item.sum);

  const data = {
    labels,
    datasets: [
      {
        label: t('indicators.rev'),
        data: datasetData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 50,
        maxBarThickness: 100,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-80 md:w-full h-96">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
