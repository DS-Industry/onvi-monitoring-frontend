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

const IncomeReport: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const posType = usePosType();
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    const { data: deviceData } = useSWR([`get-device`], () => getDevices(posType), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData } = useSWR([`get-warehouse`], () => getWarehouses(posType), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: reportData } = useSWR([`get-report`], () => getReportById(location.state.ownerId), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    const { trigger: createReport, isMutating } = useSWRMutation(reportData?.id ? ['create-report'] : null, async () => applyReport({
        ...formData
    }, reportData?.id ? reportData.id : 0));

    console.log("Report data: ", reportData);

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

        console.log("Submitting form data:", formData);

        try {
            const result = await createReport(); // Pass formData correctly
            console.log("Report created successfully:", result);
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
                    <div className="flex space-x-4">
                        {reportData?.params && Object.entries(reportData.params).map(([key, value]) => (
                            <div key={key}>
                                {key.toLowerCase().includes("date") ? (
                                    <Input
                                        title={t(`analysis.${key}`)}
                                        type="date"
                                        value={formData[key] || ""}
                                        changeValue={(e) => handleInputChange(key, e.target.value)}
                                        classname="w-64"
                                    />
                                ) : key.toLowerCase().includes("pos") ?
                                    <DropdownInput
                                        title={t("analysis.posId")}
                                        value={formData[key] || ""}
                                        options={poses}
                                        onChange={(value) => handleInputChange(key, value)}
                                        classname="w-64"
                                    />
                                    : key.toLowerCase().includes("device") ?
                                        <DropdownInput
                                            title={t("analysis.deviceId")}
                                            value={formData[key] || ""}
                                            options={devices}
                                            onChange={(value) => handleInputChange(key, value)}
                                            classname="w-64"
                                        />
                                        : key.toLowerCase().includes("warehouse") ?
                                            <DropdownInput
                                                title={t("analysis.warehouseId")}
                                                value={formData[key] || ""}
                                                options={warehouses}
                                                onChange={(value) => handleInputChange(key, value)}
                                                classname="w-64"
                                            />
                                            : key.toLowerCase().includes("org") ?
                                                <DropdownInput
                                                    title={t("analysis.organizationId")}
                                                    value={formData[key] || ""}
                                                    options={organizations}
                                                    onChange={(value) => handleInputChange(key, value)}
                                                    classname="w-64"
                                                />
                                                : typeof value === "number" ? (
                                                    <Input
                                                        title={t(`analysis.${key}`)}
                                                        type="number"
                                                        value={formData[key] || ""}
                                                        changeValue={(e) => handleInputChange(key, Number(e.target.value))}
                                                        classname="w-64"
                                                    />
                                                ) : (
                                                    <Input
                                                        title={t(`analysis.${key}`)}
                                                        type="text"
                                                        value={formData[key] || ""}
                                                        changeValue={(e) => handleInputChange(key, e.target.value)}
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
