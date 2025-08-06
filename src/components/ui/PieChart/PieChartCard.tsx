import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartCard: React.FC = () => {
  const { t } = useTranslation();
  const pieData1 = {
    labels: [
      'Батайск, Урванцева',
      'Батайск, СЖМ',
      'Ростов-на-Дону, Жданова',
      'Ростов-на-Дону, Ленина',
    ],
    datasets: [
      {
        data: [3, 23, 15, 59],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false, // Disable default legend
      },
    },
  };

  return (
    <div className="rounded-2xl shadow-card p-6 bg-white w-[1128px]">
      <div className="text-sm uppercase text-text02 mb-4 w-40">
        {t('marketing.cust')}
      </div>
      <div className="flex space-x-10">
        <div className="text-text01 font-semibold text-[45px]">356</div>
        <div className="flex flex-wrap gap-20">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="w-40 h-40">
                <Pie data={pieData1} options={options} />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ul className="space-y-1">
                {pieData1.labels.map((label, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-nowrap"
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          pieData1.datasets[0].backgroundColor[index],
                      }}
                    ></span>
                    <span className="text-text01">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="w-40 h-40">
                <Pie data={pieData1} options={options} />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ul className="space-y-1">
                {pieData1.labels.map((label, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-nowrap"
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          pieData1.datasets[0].backgroundColor[index],
                      }}
                    ></span>
                    <span className="text-gray-700">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="w-40 h-40">
                <Pie data={pieData1} options={options} />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ul className="space-y-1">
                {pieData1.labels.map((label, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-nowrap"
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          pieData1.datasets[0].backgroundColor[index],
                      }}
                    ></span>
                    <span className="text-gray-700">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="w-40 h-40">
                <Pie data={pieData1} options={options} />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ul className="space-y-1">
                {pieData1.labels.map((label, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-nowrap"
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          pieData1.datasets[0].backgroundColor[index],
                      }}
                    ></span>
                    <span className="text-gray-700">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartCard;
