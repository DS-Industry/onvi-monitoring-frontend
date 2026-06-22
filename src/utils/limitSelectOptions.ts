type SelectOption = { value: string; label: string };

export function limitSelectOptions(
  options: SelectOption[],
  search: string,
  limit: number,
  selected?: string | string[]
): SelectOption[] {
  const query = search.toLowerCase();
  const result = options
    .filter(option => !query || option.label.toLowerCase().includes(query))
    .slice(0, limit);

  const selectedValues = selected
    ? Array.isArray(selected)
      ? selected
      : [selected]
    : [];

  selectedValues.forEach(value => {
    const option = options.find(item => item.value === value);
    if (option && !result.some(item => item.value === value)) {
      result.push(option);
    }
  });

  return result;
}
