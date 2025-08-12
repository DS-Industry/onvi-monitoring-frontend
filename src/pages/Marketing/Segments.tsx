import NoDataUI from '@/components/ui/NoDataUI';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SegmentEmpty from '@/assets/NoSegment.png';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { PlusOutlined } from '@ant-design/icons';

const Segments: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.segments')}
          </span>
          <QuestionMarkIcon />
        </div>
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => navigate('/marketing/segments/new')}
        >
          {t('routes.add')}
        </Button>
      </div>
      <div className="flex flex-col justify-center items-center">
        <NoDataUI
          title={t('marketing.customer')}
          description={t('marketing.atThe')}
        >
          <img
            src={SegmentEmpty}
            className="mx-auto"
            loading="lazy"
            alt="Segments"
          />
        </NoDataUI>
      </div>
    </>
  );
};

export default Segments;
