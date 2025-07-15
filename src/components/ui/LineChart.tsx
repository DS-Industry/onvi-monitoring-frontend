import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type StatGraphResponse = {
  date: Date;
  sum: number;
};

type Props = {
  revenueData: StatGraphResponse[];
};

const LineChart = ({ revenueData }: Props) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  console.log(options.lol);

  const data = {
    labels: revenueData.map((item) => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        fill: true,
        label: "Revenue",
        data: revenueData.map((item) => item.sum),
        borderColor: "#0B68E1",
        backgroundColor: "#9BD0F5",
        tension: 0.4, // Optional: makes the line smooth
      },
    ],
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
