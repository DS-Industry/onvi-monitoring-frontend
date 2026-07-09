import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWRInfinite from 'swr/infinite';
import { Button, Card, Col, Row, Skeleton, Typography } from 'antd';
import { getPublishedNews } from '@/services/api/news';
import NewsToastItem from './components/NewsToastItem';
import Notification from '@ui/Notification';
import FactoryLetterS from '@/assets/Factory Letter S.png';
import Attention from '@/assets/Attention.png';

const { Text, Title } = Typography;

const PAGE_SIZE = 10;

const cardBodyStyles = {
  padding: 24,
  backgroundColor: '#F8F8FA',
  borderRadius: 18,
};

const NewsToastSkeleton: React.FC = () => (
  <div className="rounded-[18px] bg-background05 p-4">
    <Skeleton.Input active size="small" className="!w-32 !mb-2" />
    <Skeleton.Input active className="!w-full" />
  </div>
);

const News: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);

  const { data, isLoading, size, setSize, isValidating } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.hasNext) return null;
      return ['news', pageIndex + 1, PAGE_SIZE] as const;
    },
    ([, page, pageSize]) => getPublishedNews({ page, size: pageSize }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const articles = data?.flatMap(page => page.data) ?? [];
  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage?.hasNext ?? false;
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');

  return (
    <>
      {notificationVisible && (
        <Notification
          title={t('news.notification')}
          message={t('news.notificationText')}
          onClose={() => setNotificationVisible(false)}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            styles={{ body: cardBodyStyles }}
            style={{ borderRadius: 18 }}
          >
            <Text type="secondary" strong>
              {t('news.daysLeft')}
            </Text>
            <Title level={4} style={{ margin: '8px 0' }}>
              {t('news.maximumTariff')}
            </Title>
            <div
              style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}
            >
              <Text>{t('news.upToDate')}</Text>
              <div style={{ marginLeft: 'auto' }}>
                <img src={FactoryLetterS} alt="" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            styles={{ body: cardBodyStyles }}
            style={{ borderRadius: 18 }}
          >
            <Text type="secondary" strong>
              {t('news.critical')}
            </Text>
            <Title level={4} style={{ margin: '8px 0' }}>
              {t('news.chemistry')}
            </Title>
            <div
              style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}
            >
              <Text>{t('news.chemistryText')}</Text>
              <div style={{ marginLeft: 'auto' }}>
                <img src={Attention} alt="" className="h-20" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <Row gutter={[24, 24]}>
            {isLoading && articles.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Col xs={24} md={12} key={`skeleton-${i}`}>
                    <NewsToastSkeleton />
                  </Col>
                ))
              : articles.map(item => (
                  <Col xs={24} md={12} key={item.id}>
                    <NewsToastItem item={item} />
                  </Col>
                ))}
          </Row>

          {!isLoading && articles.length === 0 && (
            <Text type="secondary" className="block text-center">
              {t('news.empty')}
            </Text>
          )}
        </Col>
      </Row>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            className="btn-primary"
            loading={isValidating && isLoadingMore}
            onClick={() => setSize(size + 1)}
          >
            {t('news.loadMore')}
          </Button>
        </div>
      )}
    </>
  );
};

export default News;
