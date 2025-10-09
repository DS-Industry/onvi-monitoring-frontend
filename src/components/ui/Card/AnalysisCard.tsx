import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Divider, Typography, Button } from 'antd';
import {
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

type Props = {
  iconText: string;
  title: string;
  description: string;
  onNavigate: () => void;
};

const iconMap: Record<string, React.ReactNode> = {
  pie: <PieChartOutlined />,
  bar: <BarChartOutlined />,
  line: <LineChartOutlined />,
  db: <DatabaseOutlined />,
  file: <FileTextOutlined />,
};

const AnalysisCard: React.FC<Props> = ({
  iconText,
  title,
  description,
  onNavigate,
}) => {
  const { t } = useTranslation();

  const IconComponent = iconMap[iconText] || <FileTextOutlined />;

  return (
    <Card
      className="w-full sm:w-[456px] h-[200px] transition-transform duration-150 hover:scale-[1.02] hover:shadow-xl shadow-card border-0 cursor-pointer"
      tabIndex={0}
      aria-label={title}
      onClick={onNavigate}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          padding: 20,
        },
      }}
      role="button"
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="bg-primary02 h-12 w-12 rounded-full flex justify-center items-center shadow-md">
            {React.cloneElement(IconComponent as React.ReactElement, {
              className: 'text-white text-[22px]',
            })}
          </div>
          <Title
            level={4}
            style={{
              margin: 0,
              color: '#1F1F1F',
              fontWeight: 600,
              lineHeight: 1.1,
              whiteSpace: "nowrap"
            }}
          >
            {title}
          </Title>
        </div>
        <Divider style={{ margin: '16px 0 12px 0' }} />
        <Text type="secondary" style={{ fontSize: 16, lineHeight: 1.5 }}>
          {description}
        </Text>
      </div>
      <Button
        type="link"
        style={{
          alignSelf: 'flex-end',
          marginTop: 'auto',
          fontWeight: 500,
          paddingLeft: 0,
        }}
        onClick={e => {
          e.stopPropagation();
          onNavigate();
        }}
        tabIndex={-1}
      >
        {t('analysis.to')}
      </Button>
    </Card>
  );
};

export default AnalysisCard;
