import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'antd';
// import { DollarOutlined } from '@ant-design/icons';
import { useUser } from '@/hooks/useUserStore';
import PromoCodesTab from './PromoCodeManagement/PromoCodesTab';
// import ManualTransactionTab from './PromoCodeManagement/ManualTransactionTab';

const { TabPane } = Tabs;

const PromoCodeManagement: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();


  return (
    <div>
      <Tabs defaultActiveKey="promocodes">
        <TabPane
          tab={
            <span>
              <span className="mr-2">{t('marketing.promoCode')}</span>
            </span>
          }
          key="promocodes"
        >
          <PromoCodesTab organizationId={user.organizationId!} />
        </TabPane>

        {/* <TabPane
          tab={
            <span>
              <DollarOutlined className="mr-2" />
              {t('marketing.manualTransaction')}
            </span>
          }
          key="transaction"
        >
          <ManualTransactionTab organizationId={user.organizationId!} />
        </TabPane> */}
      </Tabs>
    </div>
  );
};

export default PromoCodeManagement;
