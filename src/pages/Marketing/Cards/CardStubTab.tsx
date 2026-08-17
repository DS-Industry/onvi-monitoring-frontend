import React from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Table } from 'antd';

type CardStubTabProps = {
  title?: string;
  withOrdersPlaceholder?: boolean;
};

const CardStubTab: React.FC<CardStubTabProps> = ({
  title,
  withOrdersPlaceholder = false,
}) => {
  const { t } = useTranslation();

  if (!withOrdersPlaceholder) {
    return (
      <div className="py-10">
        <Empty description={title || t('marketing.comingSoon')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-base font-semibold text-text01">
          {t('marketing.orderHistory')}
        </div>
        <span className="text-primary02 text-sm cursor-default opacity-60">
          {t('marketing.goToAllOrders')}
        </span>
      </div>

      <div>
        <div className="text-xs font-medium text-text02 uppercase mb-2">
          {t('marketing.filterByOrders')}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            t('constants.all'),
            t('marketing.orderStatusPaid'),
            t('marketing.orderStatusProcessing'),
          ].map((label, index) => (
            <span
              key={label}
              className={`rounded-full px-3 py-1 text-sm border ${
                index === 0
                  ? 'bg-primary02 text-white border-primary02'
                  : 'bg-white text-text02 border-gray-200'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <Table
        dataSource={[]}
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          {
            title: t('marketing.operationDate'),
            dataIndex: 'date',
            key: 'date',
          },
          {
            title: t('marketing.carWashBranch'),
            dataIndex: 'branch',
            key: 'branch',
          },
          { title: t('marketing.amount'), dataIndex: 'amount', key: 'amount' },
          {
            title: t('marketing.cardNumber'),
            dataIndex: 'cardNumber',
            key: 'cardNumber',
          },
          {
            title: t('marketing.operationType'),
            dataIndex: 'type',
            key: 'type',
          },
        ]}
        locale={{ emptyText: t('marketing.comingSoon') }}
        pagination={false}
      />
    </div>
  );
};

export default CardStubTab;
