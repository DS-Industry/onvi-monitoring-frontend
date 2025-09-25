import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';
import MultiInput from '@ui/Input/MultiInput';
import useSWR from 'swr';
import { getTags } from '@/services/api/marketing';

const TagsFilter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: tagsData } = useSWR([`get-tags`], () => getTags(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false
  });

  const options = tagsData ? tagsData.map(tag => tag.props) : [];

  const tagIdsParam = getParam(searchParams, 'tagIds');

  const tagIds: number[] | undefined = tagIdsParam
    ? tagIdsParam
        .split(',')
        .map(id => Number(id))
        .filter(id => !isNaN(id))
    : undefined;

  const handleChange = (selected: typeof options) => {
    updateSearchParams(searchParams, setSearchParams, {
      tagIds: selected.map(sel => sel.id),
      page: DEFAULT_PAGE,
    });
  };

  return (
    <MultiInput options={options} value={tagIds} onChange={handleChange} />
  );
};

export default TagsFilter;
