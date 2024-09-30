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
import revenueData from "@/data/revenueData.json";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const data = {
    labels: revenueData.map((data) => data.label),
    datasets: [
      {
        fill: true,
        label: "Revenue",
        data: revenueData.map((data) => data.revenue),
        borderColor: "#0B68E1",
        backgroundColor: "#9BD0F5",
      },
    ],
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
