import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';
import MultiInput from '@ui/Input/MultiInput';
import useSWR from 'swr';
import { getTags } from '@/services/api/marketing';

const TechTaskTagsFilter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: tagsData } = useSWR([`get-tags`], () => getTags(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false
  });

  const options = tagsData ? tagsData.map(tag => tag.props) : [];

  const tagsParam = getParam(searchParams, 'tags');
  const tags: string[] | undefined = tagsParam
    ? tagsParam.split(',').map(tag => tag.trim())
    : undefined;

  const handleChange = (selected: typeof options) => {
    updateSearchParams(searchParams, setSearchParams, {
      tags: selected.map(sel => sel.name),
      page: DEFAULT_PAGE,
    });
  };

  // Convert string tags to options format for MultiInput
  const selectedOptions = tags ? options.filter(option => tags.includes(option.name)) : [];

  return (
    <MultiInput 
      options={options} 
      value={selectedOptions.map(opt => opt.id)} 
      onChange={handleChange} 
    />
  );
};

export default TechTaskTagsFilter;
