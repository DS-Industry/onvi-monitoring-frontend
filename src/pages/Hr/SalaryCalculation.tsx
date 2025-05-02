import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NoCollection from "@/assets/NoCollection.png";
import Filter from "@/components/ui/Filter/Filter";
import { useNavigate } from "react-router-dom";
import { useButtonCreate, useFilterOn } from "@/components/context/useContext";
import useSWR from "swr";
import { getPayments, getPositions, getWorkers } from "@/services/api/hr";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsPayments } from "@/utils/OverFlowTableData";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { DatePicker, Select, TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useCurrentPage, usePageNumber, useSetPageNumber } from "@/hooks/useAuthStore";

type PaymentParams = {
    startPaymentDate: Date | string;
    endPaymentDate: Date | string;
    hrWorkerId: number | string;
    billingMonth: Date | string;
    page?: number;
    size?: number;
}

const SalaryCalculation: React.FC = () => {
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

    type DateField = 'startPaymentDate' | 'endPaymentDate';

    const handleDateChange = (field: DateField, date: Dayjs | null) => {
        if (!date) {
            updateDateField(field, null);
            return;
        }

        const existingValue = field === 'startPaymentDate' ? startPaymentDate : endPaymentDate;
        const updated = existingValue
            ? date.set('hour', existingValue.hour()).set('minute', existingValue.minute())
            : date;

        updateDateField(field, updated);
    };

    const handleTimeChange = (field: DateField, time: Dayjs | null) => {
        if (!time) return;

        const existingValue = field === 'startPaymentDate' ? startPaymentDate : endPaymentDate;
        const updated = existingValue
            ? existingValue.set('hour', time.hour()).set('minute', time.minute())
            : dayjs().set('hour', time.hour()).set('minute', time.minute());

        updateDateField(field, updated);
    };

    const updateDateField = (field: DateField, value: Dayjs | null) => {
        if (field === 'startPaymentDate') {
            setStartPaymentDate(value);
        } else {
            setEndPaymentDate(value);
        }
    };

    const { data: positionData } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const positions: { name: string; value: number; label: string; }[] = positionData?.map((item) => ({ name: item.props.name, value: item.props.id, label: item.props.name })) || [];

    const { data: paymentsData, isLoading: paymentsLoading, mutate: paymentsMutating } = useSWR([`get-payments`], () => getPayments({
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

    const workers: { label: string; value: number | "*"; }[] = [
        { label: t("hr.all"), value: "*" },
        ...(workersData?.map((work) => ({
            label: work.props.name,
            value: work.props.id
        })) || [])
    ];

    useEffect(() => {
        if (buttonOn)
            navigate("/hr/salary/creation");
    }, [buttonOn, navigate])

    return (
        <div>
            <Filter count={payments.length} hideDateTime={true} hideCity={true} hideSearch={true} handleClear={handleClear}>
                <div className="flex flex-col">
                    <label className="text-sm text-text02">{t("hr.startPaymentDate")}</label>
                    <div className="flex space-x-2">
                        <DatePicker
                            value={startPaymentDate}
                            onChange={(date) => handleDateChange('startPaymentDate', date)}
                            placeholder="Select Date"
                            className="w-40"
                            format="YYYY-MM-DD"
                        />
                        <TimePicker
                            value={startPaymentDate}
                            onChange={(time) => handleTimeChange('startPaymentDate', time)}
                            placeholder="Select Time"
                            className="w-40"
                            format="HH:mm"
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-text02">{t("hr.endPaymentDate")}</label>
                    <div className="flex space-x-2">
                        <DatePicker
                            value={endPaymentDate}
                            onChange={(date) => handleDateChange('endPaymentDate', date)}
                            placeholder="Select Date"
                            className="w-40"
                            format="YYYY-MM-DD"
                        />
                        <TimePicker
                            value={endPaymentDate}
                            onChange={(time) => handleTimeChange('endPaymentDate', time)}
                            placeholder="Select Time"
                            className="w-40"
                            format="HH:mm"
                        />
                    </div>
                </div>
                <div>
                    <div className="text-sm text-text02">{t("routes.employees")}</div>
                    <Select
                        className="w-full sm:w-80"
                        placeholder={t("warehouse.notSel")}
                        options={workers}
                        value={workerId}
                        onChange={(value) => setWorkerId(value)}
                        dropdownRender={(menu) => (
                            <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                {menu}
                            </div>
                        )}
                    />
                </div>
            </Filter>
            {paymentsLoading || isTableLoading ? (
                <TableSkeleton columnCount={columnsPayments.length} />
            ) : payments.length > 0 ? (
                <div className="mt-8">
                    <DynamicTable
                        data={payments.map((item, index) => ({
                            ...item,
                            id: index
                        }))}
                        columns={columnsPayments}
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

export default SalaryCalculation;