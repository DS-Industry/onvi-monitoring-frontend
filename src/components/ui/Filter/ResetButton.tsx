import React from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Button } from "antd";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/utils/constants";

type ResetButtonProps = {
  onReset?: () => void;
  className?: string;
};

const ResetButton: React.FC<ResetButtonProps> = ({
  onReset,
  className = "w-[168px]",
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

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
      type="default"
      onClick={handleClick}
      className={className}
    >
      {t("filters.reset")}
    </Button>
  );
};

export default ResetButton;
