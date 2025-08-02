import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import Button from "@ui/Button/Button.tsx";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/utils/constants.ts";

type ResetButtonProps = {
  onReset?: () => void;
  className?: string;
};

const ResetButton: React.FC<ResetButtonProps> = ({
  onReset,
  className = "w-[168px]"
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterToggle, setFilterToggle] = useState(false);

  const resetFilters = () => {
    const today = dayjs().format("YYYY-MM-DDTHH:mm");

    updateSearchParams(searchParams, setSearchParams, {
      dateStart: today,
      dateEnd: today,
      city: "*",
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
      posId: "*",
      deviceId: "",
      warehouseId: "",
      orgId: "",
      search: "",
    });

    setFilterToggle(!filterToggle);
  };

  const handleClick = () => {
    if (onReset) {
      onReset();
    } else {
      resetFilters();
    }
  };

  return (
    <Button
      title={t("filters.reset")}
      type="outline"
      handleClick={handleClick}
      classname={className}
    />
  );
};

export default ResetButton;