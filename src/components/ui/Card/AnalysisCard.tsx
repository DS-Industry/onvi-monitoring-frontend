import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Divider, Typography } from 'antd';
import {
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Text, Link } = Typography;

type Props = {
  iconText: string;
  title: string;
  description: string;
  onNavigate: () => void;
};

const iconMap: Record<string, React.ReactNode> = {
  pie: <PieChartOutlined className="text-white text-[16px]" />,
  bar: <BarChartOutlined className="text-white text-[16px]" />,
  line: <LineChartOutlined className="text-white text-[16px]" />,
  db: <DatabaseOutlined className="text-white text-[16px]" />,
  file: <FileTextOutlined className="text-white text-[16px]" />,
};

const AnalysisCard: React.FC<Props> = ({
  iconText,
  title,
  description,
  onNavigate
}) => {
  const { t } = useTranslation();

  const IconComponent = iconMap[iconText] || (
    <FileTextOutlined className="text-white text-[16px]" />
  );

  return (
    <Card
      className="w-[456px] h-[200px] shadow-card"
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        },
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="bg-primary02 h-8 w-8 rounded-full flex justify-center items-center">
            {IconComponent}
          </div>
          <Title level={5} style={{ margin: 0, color: '#1F1F1F' }}>
            {title}
          </Title>
        </div>
        <Divider style={{ margin: '12px 0' }} />
        <Text type="secondary">{description}</Text>
      </div>

      <Link
        onClick={() =>
          onNavigate()
        }
        style={{ marginTop: 'auto' }}
      >
        {t('analysis.to')}
      </Link>
    </Card>
  );
};

export default AnalysisCard;
