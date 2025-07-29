import React from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getCashOperSuspiciousById } from "@/services/api/finance";
import { getDevices } from "@/services/api/equipment";
import { columnsDataCashOperSuspiciously } from "@/utils/OverFlowTableData";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import NoDataUI from "@/components/ui/NoDataUI";
import NoTimeSheet from "@/assets/NoTimesheet.png";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { useSearchParams } from "react-router-dom";

const SuspiciousTab: React.FC = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();

  const ownerId = searchParams.get("ownerId")
    ? Number(searchParams.get("ownerId"))
    : undefined;
  const posId = searchParams.get("posId")
    ? Number(searchParams.get("posId"))
    : undefined;

  const { data: deviceData } = useSWR(
    posId ? [`get-device-${posId}`] : null,
    () => getDevices(posId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const devices: { name: string; value: number }[] =
    deviceData?.map((item) => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const { data: cashOperSuspData, isLoading: loadingCashOperSusp } = useSWR(
    ownerId ? [`get-cash-oper-susp-data-${ownerId}`] : null,
    () => getCashOperSuspiciousById(ownerId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const cashOperSubsArray =
    cashOperSuspData?.map((item) => ({
      ...item,
      deviceName: devices.find((dev) => dev.value === item.deviceId)?.name,
    })) || [];

  return (
    <div className="w-full max-w-[1003px] h-fit rounded-2xl shadow-card p-4 mt-5 mx-auto">
      {loadingCashOperSusp ? (
        <TableSkeleton columnCount={columnsDataCashOperSuspiciously.length} />
      ) : cashOperSubsArray.length > 0 ? (
        <DynamicTable
          data={cashOperSubsArray.map((item, index) => ({
            ...item,
            id: index,
          }))}
          columns={columnsDataCashOperSuspiciously}
        />
      ) : (
        <div className="flex flex-col justify-center items-center text-center p-4">
          <NoDataUI title={t("finance.data")} description={t("finance.atThe")}>
            <img
              src={NoTimeSheet}
              className="mx-auto w-3/4 sm:w-1/2 md:w-1/3"
              loading="lazy"
              alt="Timesheet"
            />
          </NoDataUI>
        </div>
      )}
    </div>
  );
};

export default SuspiciousTab;
