import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

enum CategoryReportTemplate {
  POS = 'POS',
}

type Reports = {
  id: number;
  name: string;
  category: CategoryReportTemplate;
  description?: string;
  params: JSON;
};

type Props = {
  iconText: string;
  firstText: string;
  secondText: string;
  reports?: Reports;
};

// Mapping string to icon component
const iconMap: Record<string, React.ReactNode> = {
  pie: <PieChartOutlined className="text-white text-[16px]" />,
  bar: <BarChartOutlined className="text-white text-[16px]" />,
  line: <LineChartOutlined className="text-white text-[16px]" />,
  db: <DatabaseOutlined className="text-white text-[16px]" />,
  file: <FileTextOutlined className="text-white text-[16px]" />,
};

const AnalysisCard: React.FC<Props> = ({
  iconText,
  firstText,
  secondText,
  reports,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const IconComponent = iconMap[iconText] || (
    <FileTextOutlined className="text-white text-[16px]" />
  );

  return (
    <div className="h-[200px] w-[456px] rounded-lg shadow-card flex flex-col justify-between p-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="bg-primary02 h-8 w-8 rounded-3xl flex justify-center items-center">
            {IconComponent}
          </div>
          <div className="font-semibold text-lg text-text01">{firstText}</div>
        </div>
        <hr />
        <div className="text-text02 w-64">{secondText}</div>
      </div>
      <div
        className="font-semibold text-primary02 mt-auto cursor-pointer"
        onClick={() =>
          navigate('/analysis/report', { state: { ownerId: reports?.id } })
        }
      >
        {t('analysis.to')}
      </div>
    </div>
  );
};

export default AnalysisCard;
