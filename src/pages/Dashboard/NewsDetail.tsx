import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Skeleton, Typography } from 'antd';
import axios from 'axios';
import { getNewsBySlug } from '@/services/api/news';
import NewsBody from './components/NewsBody';
import NoDataUI from '@ui/NoDataUI';
import PosEmpty from '@/assets/EmptyPos.png';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import newsBackground from '@/assets/news/news_background.jpeg';

const { Title } = Typography;

const NewsDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useSWR(
    slug ? ['news-detail', slug] : null,
    () => getNewsBySlug(slug!),
    { shouldRetryOnError: false }
  );

  const isNotFound =
    axios.isAxiosError(error) && error.response?.status === 404;

  const sortedImages = article
    ? [...article.images].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const tagLabel = t('news.tagPlaceholder');

  const backButton = (
    <button
      type="button"
      onClick={() => navigate('/?tab=news')}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary02 bg-white"
      aria-label={t('login.back')}
    >
      <ArrowLeftOutlined className="text-primary02" />
    </button>
  );

  if (isNotFound) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-4 ml-12 md:ml-0">
          {backButton}
        </div>
        <NoDataUI
          title={t('news.notFound')}
          description={t('news.notFoundDescription')}
        >
          <img src={PosEmpty} className="mx-auto mb-6 h-32" alt="" />
        </NoDataUI>
      </div>
    );
  }

  return (
    <div className="relative -mt-5 -mx-4 pb-10 sm:-mx-6 ">
      <div
        className="relative h-[280px] w-full bg-[#F5F5F7] bg-contain bg-center bg-no-repeat md:h-[360px]"
        style={{ backgroundImage: `url(${newsBackground})` }}
      >
        <div className="relative z-10 flex items-center gap-4 px-6 pt-6 ml-12 md:ml-0 md:px-10 md:pt-8">
          {backButton}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-3xl font-normal text-text01">
              {t('news.pageTitle')}
            </span>
            <QuestionMarkIcon />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-4 -mt-20 w-full max-w-[1200px] rounded-[20px] bg-[#F8F9FC] px-6 py-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)] md:mx-auto md:px-12 md:py-10">
        {isLoading ? (
          <>
            <Skeleton.Input active className="!w-32 !h-6 mb-4" />
            <Skeleton.Input active className="!w-full !h-10 mb-4" />
            <Skeleton.Input active className="!w-48 !h-5 mb-6" />
            <Skeleton.Image active className="!w-full !h-64 mb-6" />
            <Skeleton paragraph={{ rows: 4 }} active />
          </>
        ) : article ? (
          <>
            {tagLabel !== '—' && (
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary02">
                {tagLabel}
              </p>
            )}

            <Title level={2} className="!mb-3 !text-2xl !font-bold md:!text-3xl">
              {article.title}
            </Title>

            {article.coverImageUrl && (
              <div className="mb-8 overflow-hidden rounded-xl">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full object-cover"
                />
              </div>
            )}

            <NewsBody html={article.body} />

            {sortedImages.length > 0 && (
              <div className="mt-8 flex flex-col gap-6">
                {sortedImages.map(image => {
                  const img = (
                    <img
                      src={image.imageUrl}
                      alt={image.alt || ''}
                      className="w-full rounded-xl object-cover"
                    />
                  );

                  return (
                    <figure key={image.id}>
                      {image.linkUrl ? (
                        <a
                          href={image.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {img}
                        </a>
                      ) : (
                        img
                      )}
                      {image.caption && (
                        <figcaption className="mt-2 text-center text-sm font-bold text-text02">
                          {image.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default NewsDetail;
