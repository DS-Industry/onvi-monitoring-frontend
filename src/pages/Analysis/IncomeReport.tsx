import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { getDevices, getPoses } from "@/services/api/equipment";
import React, { useState } from "react";
import useSWR from "swr";
import { useLocation, useNavigate } from "react-router-dom";
import { applyReport, getReportById } from "@/services/api/reports";
import Input from "@/components/ui/Input/Input";
import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button/Button";
import { useCity, usePosType } from "@/hooks/useAuthStore";
import { getWarehouses } from "@/services/api/warehouse";
import { getOrganization } from "@/services/api/organization";
import { useTranslation } from "react-i18next";
import DateInput from "@/components/ui/Input/DateInput";
import dayjs from "dayjs";
import { message, Skeleton } from "antd";

const IncomeReport: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const posType = usePosType();
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    const { data: deviceData } = useSWR(posType !== "*" ? [`get-device`] : null, () => getDevices(posType), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses({
        posId: posType,
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: reportData, isLoading: loadingReport, isValidating: validatingReport } = useSWR([`get-report`], () => getReportById(location.state.ownerId), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    const { trigger: createReport, isMutating } = useSWRMutation(reportData?.id ? ['create-report'] : null, async () => applyReport({
        ...formData
    }, reportData?.id ? reportData.id : 0));

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const devices: { name: string; value: string; }[] = deviceData?.map((item) => ({ name: item.props.name, value: item.props.name })) || [];

    const warehouses: { name: string; value: number; }[] = warehouseData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    // State for dynamic inputs
    const [formData, setFormData] = useState<{ [key: string]: any }>({});

    // Handle input changes dynamically
    const handleInputChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent page reload

        if (!reportData?.id) {
            console.error("Report ID is missing");
            return;
        }

        const missingFields = reportData.params.params
            .filter(param => !formData[param.name] || formData[param.name].toString().trim() === "")
            .map(param => param.description || param.name);

        if (missingFields.length > 0) {
            // Show Ant Design error notification or toast
            message.error(`Please fill in the following fields: ${missingFields.join(', ')}`);
            return;
        }

        try {
            await createReport(); // Pass formData correctly
            navigate("/analysis/transactions");
        } catch (error) {
            console.error("Error creating report:", error);
        }
    };

    return (
        <div>
            <Filter count={0} hideSearch={true} hideCity={true} hideDateTime={true} children={undefined}>
            </Filter>
            {/* Dynamic Input Fields Based on API Response */}
            <div className="p-4 bg-white rounded-lg shadow-md">
                <form onSubmit={onSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">{t("analysis.repo")}</h3>
                    <div className="flex flex-wrap gap-4">
                        {loadingReport || validatingReport ? (
                            <div className="flex flex-wrap gap-4">
                                <Skeleton.Input active style={{ width: 150, height: 32 }} />
                                <Skeleton.Input active style={{ width: 150, height: 32 }} />
                                <Skeleton.Input active style={{ width: 150, height: 32 }} />
                            </div>
                        ) : reportData &&
                        reportData.params.params
                            .map((value) => (
                                <div key={value.name}>
                                    {value.type === "date" ? (
                                        <DateInput
                                            title={value.description}
                                            value={formData[value.name] ? dayjs(formData[value.name]) : null}
                                            changeValue={(date) => handleInputChange(value.name, date ? date.format('YYYY-MM-DD') : "")}
                                            classname="w-64"
                                        />
                                    ) : value.name.toLowerCase().includes("pos") ?
                                        <DropdownInput
                                            title={value.description}
                                            value={formData[value.name] || ""}
                                            options={poses}
                                            onChange={(val) => handleInputChange(value.name, val)}
                                            classname="w-64"
                                        />
                                        : value.name.toLowerCase().includes("device") ?
                                            <DropdownInput
                                                title={value.description}
                                                value={formData[value.name] || ""}
                                                options={devices}
                                                onChange={(val) => handleInputChange(value.name, val)}
                                                classname="w-64"
                                            />
                                            : value.name.toLowerCase().includes("warehouse") ?
                                                <DropdownInput
                                                    title={value.description}
                                                    value={formData[value.name] || ""}
                                                    options={warehouses}
                                                    onChange={(value) => handleInputChange(value.name, value)}
                                                    classname="w-64"
                                                />
                                                : value.name.toLowerCase().includes("org") ?
                                                    <DropdownInput
                                                        title={value.description}
                                                        value={formData[value.name] || ""}
                                                        options={organizations}
                                                        onChange={(val) => handleInputChange(value.name, val)}
                                                        classname="w-64"
                                                    />
                                                    : value.type === "number" ? (
                                                        <Input
                                                            title={t(`analysis.${value.name}`)}
                                                            type="number"
                                                            value={formData[value.name] || ""}
                                                            changeValue={(e) => handleInputChange(value.name, Number(e.target.value))}
                                                            classname="w-64"
                                                        />
                                                    ) : (
                                                        <Input
                                                            title={t(`analysis.${value.name}`)}
                                                            type="text"
                                                            value={formData[value.name] || ""}
                                                            changeValue={(e) => handleInputChange(value.name, e.target.value)}
                                                            classname="w-64"
                                                        />
                                                    )}
                                </div>
                            ))}
                    </div>
                    <Button
                        title={t("analysis.add")}
                        form={true}
                        isLoading={isMutating}
                    />
                </form>
            </div>

            {/* Progress bar shown only when filterOn is true */}
            {/* {!filterOn && (
                <div className="w-full flex flex-col space-y-4 items-center justify-center py-4">
                    <div className="bg-primary02 h-16 w-16 rounded-full flex justify-center items-center">
                        <Icon icon="file-text" className="text-white w-10 h-10" />
                    </div>
                    <p className="text-text02 mt-2">Your request is being processed and the report is being generated.</p>
                    <div className="w-full h-1 bg-gray-200 relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-1/3 bg-primary02 animate-[progressMove_1.5s_linear_infinite]"></div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default IncomeReport;
