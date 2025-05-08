import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NoCollection from "@/assets/NoCollection.png";
import Filter from "@/components/ui/Filter/Filter";
import { useNavigate } from "react-router-dom";
import { useButtonCreate, useFilterOn } from "@/components/context/useContext";
import useSWR from "swr";
import { getPositions, getPrepayments, getWorkers } from "@/services/api/hr";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsPrePayments } from "@/utils/OverFlowTableData";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import dayjs, { Dayjs } from "dayjs";
import { useCurrentPage, usePageNumber, useSetPageNumber } from "@/hooks/useAuthStore";
import DateTimeInput from "@/components/ui/Input/DateTimeInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";

type PaymentParams = {
    startPaymentDate: Date | string;
    endPaymentDate: Date | string;
    hrWorkerId: number | string;
    billingMonth: Date | string;
    page?: number;
    size?: number;
}

const EmployeeAdvance: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { buttonOn } = useButtonCreate();
    const [startPaymentDate, setStartPaymentDate] = useState<Dayjs | null>(null);
    const [endPaymentDate, setEndPaymentDate] = useState<Dayjs | null>(null);
    const [workerId, setWorkerId] = useState<number | string>("*");
    const [isTableLoading, setIsTableLoading] = useState(false);
    const pageNumber = usePageNumber();
    const setPageNumber = useSetPageNumber();
    const currentPage = useCurrentPage();
    const { filterOn } = useFilterOn();

    const { data: positionData } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const positions: { name: string; value: number; label: string; }[] = positionData?.map((item) => ({ name: item.props.name, value: item.props.id, label: item.props.name })) || [];

    const { data: paymentsData, isLoading: paymentsLoading, mutate: paymentsMutating } = useSWR([`get-payments`], () => getPrepayments({
        startPaymentDate: dataFilter.startPaymentDate ? dataFilter.startPaymentDate : "*",
        endPaymentDate: dataFilter.endPaymentDate ? dataFilter.endPaymentDate : "*",
        hrWorkerId: dataFilter.hrWorkerId,
        billingMonth: dataFilter.billingMonth ? dataFilter.billingMonth : "*"
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const payments = paymentsData?.map((pay) => ({
        ...pay,
        hrPosition: positions.find((pos) => pos.value === pay.hrPositionId)?.name
    })) || [];

    const initialFilter = {
        startPaymentDate: startPaymentDate ? startPaymentDate.toDate() : "*",
        endPaymentDate: endPaymentDate ? endPaymentDate.toDate() : "*",
        hrWorkerId: workerId,
        billingMonth: "*",
        page: currentPage,
        size: pageNumber
    }

    const [dataFilter, setDataFilter] = useState<PaymentParams>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<PaymentParams>) => {
        setDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.startPaymentDate) {
            setStartPaymentDate(
                typeof newFilterData.startPaymentDate === "string"
                    ? dayjs(newFilterData.startPaymentDate)
                    : dayjs(newFilterData.startPaymentDate)
            );
        }

        if (newFilterData.endPaymentDate) {
            setEndPaymentDate(
                typeof newFilterData.endPaymentDate === "string"
                    ? dayjs(newFilterData.endPaymentDate)
                    : dayjs(newFilterData.endPaymentDate)
            );
        }

        if (newFilterData.hrWorkerId) setWorkerId(newFilterData.hrWorkerId);

        if (newFilterData.size) setPageNumber(newFilterData.size);
    };

    useEffect(() => {
        handleDataFilter({
            startPaymentDate: startPaymentDate?.toDate(),
            endPaymentDate: endPaymentDate?.toDate(),
            hrWorkerId: workerId,
            billingMonth: "*",
            page: currentPage,
            size: pageNumber
        })
    }, [filterOn]);

    useEffect(() => {
        paymentsMutating().then(() => setIsTableLoading(false));
    }, [dataFilter, paymentsMutating]);

    const handleClear = () => {
        setStartPaymentDate(null);
        setEndPaymentDate(null);
        setWorkerId("*");
    }

    const { data: workersData } = useSWR([`get-workers`], () => getWorkers({
        placementId: "*",
        hrPositionId: "*",
        organizationId: "*"
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const workers: { name: string; value: number | "*"; }[] = [
        { name: t("hr.all"), value: "*" },
        ...(workersData?.map((work) => ({
            name: work.props.name,
            value: work.props.id
        })) || [])
    ];

    useEffect(() => {
        if (buttonOn)
            navigate("/hr/employee/advance/creation");
    }, [buttonOn, navigate])

    return (
        <div>
            <Filter count={payments.length} hideDateTime={true} hideCity={true} hideSearch={true} handleClear={handleClear}>
                <DateTimeInput
                    title={t("hr.startPaymentDate")}
                    classname="w-64"
                    value={startPaymentDate}
                    changeValue={(date) => setStartPaymentDate(date)}
                />
                <DateTimeInput
                    title={t("hr.endPaymentDate")}
                    classname="w-64"
                    value={endPaymentDate}
                    changeValue={(date) => setStartPaymentDate(date)}
                />
                <DropdownInput
                    title={t("routes.employees")}
                    classname="w-full sm:w-80"
                    label={t("warehouse.notSel")}
                    options={workers}
                    value={workerId}
                    onChange={(value) => setWorkerId(value)}
                />
            </Filter>
            {paymentsLoading || isTableLoading ? (
                <TableSkeleton columnCount={columnsPrePayments.length} />
            ) : payments.length > 0 ? (
                <div className="mt-8">
                    <DynamicTable
                        data={payments.map((item, index) => ({
                            ...item,
                            id: index
                        }))}
                        columns={columnsPrePayments}
                    />
                </div>
            ) : (<div className="flex flex-col justify-center items-center">
                <NoDataUI
                    title={t("hr.here")}
                    description={t("hr.you")}
                >
                    <img src={NoCollection} className="mx-auto" loading="lazy" />
                </NoDataUI>
            </div>
            )}
        </div>
    )
}

export default EmployeeAdvance;