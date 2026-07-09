import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { NewsListItem } from '@/services/api/news';

interface NewsToastItemProps {
  item: NewsListItem;
}

const NewsToastItem: React.FC<NewsToastItemProps> = ({ item }) => {
  const navigate = useNavigate();

  const handleNavigate = () => navigate(`/news/${item.slug}`);

  return (
    <div
      role="button"
      tabIndex={0}
      className="w-full cursor-pointer rounded-[18px] bg-background05 p-4 transition-shadow hover:shadow-md"
      onClick={handleNavigate}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate();
        }
      }}
    >
      <div className="font-semibold">{item.title}</div>
      {item.excerpt && <div>{item.excerpt}</div>}
    </div>
  );
};

export default NewsToastItem;
