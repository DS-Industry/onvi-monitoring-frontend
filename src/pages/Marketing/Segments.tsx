import NoDataUI from '@/components/ui/NoDataUI';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SegmentEmpty from '@/assets/NoSegment.png';
import { useButtonCreate } from '@/components/context/useContext';
import { useNavigate } from 'react-router-dom';

const Segments: React.FC = () => {
  const { t } = useTranslation();
  const { buttonOn } = useButtonCreate();
  const navigate = useNavigate();

  useEffect(() => {
    if (buttonOn) navigate('/marketing/segments/new');
  }, [buttonOn, navigate]);

  return (
    <>
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
