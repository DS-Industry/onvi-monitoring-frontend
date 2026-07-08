import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

enum NEWS {
  BASE = 'user/news',
}

export interface NewsAuthor {
  id: number;
  name: string;
  surname: string;
  avatar: string | null;
}

export interface NewsListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string;
  author: NewsAuthor;
}

export interface NewsPaginatedResponse {
  data: NewsListItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface NewsImage {
  id: number;
  imageUrl: string;
  alt: string | null;
  caption: string | null;
  linkUrl: string | null;
  sortOrder: number;
}

export interface NewsDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImageUrl: string | null;
  publishedAt: string;
  author: NewsAuthor;
  images: NewsImage[];
}

export interface NewsListParams {
  page?: number;
  size?: number;
}

export async function getPublishedNews(
  params: NewsListParams = {}
): Promise<NewsPaginatedResponse> {
  const response: AxiosResponse<NewsPaginatedResponse> = await api.get(
    NEWS.BASE,
    { params }
  );
  return response.data;
}

export async function getNewsBySlug(slug: string): Promise<NewsDetail> {
  const response: AxiosResponse<NewsDetail> = await api.get(
    `${NEWS.BASE}/${encodeURIComponent(slug)}`
  );
  return response.data;
}
