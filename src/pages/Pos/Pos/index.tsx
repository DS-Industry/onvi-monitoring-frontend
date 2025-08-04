import PosEmpty from "@/assets/EmptyPos.png";
import React, { useState } from "react";
import NoDataUI from "@ui/NoDataUI.tsx";
import Notification from "@ui/Notification.tsx";
import { useButtonCreate } from "@/components/context/useContext.tsx";
import useSWR from "swr";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useTranslation } from "react-i18next";
import {
  getContactById,
  getOrganization,
  getOrganizationContactById,
} from "@/services/api/organization";
import { getPoses, PosResponse } from "@/services/api/equipment";
import { getPlacement } from "@/services/api/device";
import { Table } from "antd";
import PosForm from "./PosForm";
import { Link, useSearchParams } from "react-router-dom";
import { getDateRender } from "@/utils/tableUnits";
import { ColumnsType } from "antd/es/table";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";

const fetchOrgContact = async (id: number) => {
  if (!id) return null;
  return getOrganizationContactById(id);
};

const fetchContact = async (id: number) => {
  if (!id) return null;
  return getContactById(id);
};

function getDisplayName(contact: { name: string; surname: string; }) {
  if (!contact) return "-";
  const name = contact.name ?? "";
  const surname = contact.surname ?? "";
  return [name, surname].filter(Boolean).join(" ") || "-";
}

function useContactsByIds(
  keyPrefix: string,
  ids: number[],
  fetcher: (id: number) => Promise<any>
) {
  return useSWR(ids.length ? [keyPrefix, ...ids] : null, async () => {
    const responses = await Promise.all(ids.map(fetcher));
    return Object.fromEntries(
      responses.map((contact, idx) => [ids[idx], contact])
    );
  });
}

const Pos: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const { buttonOn } = useButtonCreate();
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city") || "*";
  const { data, isLoading: posLoading } = useSWR(
    [`get-pos`, city],
    () =>
      getPoses({
        placementId: city,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: organizationData } = useSWR(buttonOn ? [`get-org`] : null, () =>
    getOrganization({
      placementId: "*",
    })
  );

  const { data: placementData } = useSWR(
    [`get-placement`],
    () => getPlacement(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const organizationIds = React.useMemo(
    () => Array.from(new Set(data?.map((item) => item.organizationId) ?? [])),
    [data]
  );
  const createIds = React.useMemo(
    () => Array.from(new Set(data?.map((item) => item.createdById) ?? [])),
    [data]
  );
  const updateIds = React.useMemo(
    () => Array.from(new Set(data?.map((item) => item.updatedById) ?? [])),
    [data]
  );

  const { data: orgContacts = {} } = useContactsByIds(
    "organizationContacts",
    organizationIds,
    fetchOrgContact
  );

  const { data: createContacts = {} } = useContactsByIds(
    "createContacts",
    createIds,
    fetchContact
  );

  const { data: updateContacts = {} } = useContactsByIds(
    "updateContacts",
    updateIds,
    fetchContact
  );

  const poses = React.useMemo(
    () =>
      (data ?? [])
        .map((item) => ({
          ...item,
          organizationName: orgContacts[item.organizationId]?.name ?? "-",
          status: t(`tables.${item.posStatus}`),
          createdByName: getDisplayName(createContacts[item.createdById]),
          updatedByName: getDisplayName(updateContacts[item.updatedById]),
          city:
            placementData?.find((place) => place.id === item.placementId)
              ?.region ?? "",
          country:
            placementData?.find((place) => place.id === item.placementId)
              ?.country ?? "",
        }))
        .sort((a, b) => a.id - b.id),
    [data, orgContacts, createContacts, updateContacts, placementData, t]
  );

  const dateRender = getDateRender();

  const columnsPos: ColumnsType<PosResponse> = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: "/station/enrollments/devices",
              search: `?posId=${record.id || "*"}`,
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: "Страна",
      dataIndex: "country",
      key: "country",
    },
    {
      title: "Город",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Адрес",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Организация",
      dataIndex: "organizationName",
      key: "organizationName",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Дата создания",
      dataIndex: "createdAt",
      key: "createdAt",
      render: dateRender,
    },
    {
      title: "Дата обновления",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: dateRender,
    },
    {
      title: "Создал",
      dataIndex: "createdByName",
      key: "createdByName",
    },
    {
      title: "Обновил",
      dataIndex: "updatedByName",
      key: "updatedByName",
    },
  ];

  return (
    <>
      <GeneralFilters
        count={poses.length}
      />
      {posLoading ? (
        <TableSkeleton columnCount={columnsPos.length} />
      ) : poses.length > 0 ? (
        <>
          <div className="mt-8">
            <Table
              dataSource={poses}
              columns={columnsPos}
              pagination={false}
              scroll={{ x: "max-content" }}
            />
          </div>
        </>
      ) : (
        <>
          {notificationVisible && organizationData?.length === 0 && (
            <div className="mt-2">
              <Notification
                title={t("pos.companyName")}
                message={t("pos.createObject")}
                link={t("pos.goto")}
                linkUrl="/administration/legalRights"
                onClose={() => setNotificationVisible(false)}
              />
            </div>
          )}
          <NoDataUI title={t("pos.noObject")} description={t("pos.addCar")}>
            <img src={PosEmpty} className="mx-auto" loading="lazy" alt="Pos" />
          </NoDataUI>
        </>
      )}
      <PosForm organizations={organizationData || []} />
    </>
  );
};

export default Pos;
