import DropdownInput from "@ui/Input/DropdownInput";
import SearchInput from "@ui/Input/SearchInput";
import { getCategory } from "@/services/api/warehouse";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import AnalysisCard from "@ui/Card/AnalysisCard";

const Analysis: React.FC = () => {
    const { t } = useTranslation();

    const [cat, setCat] = useState(0);

    const { data: categoryData } = useSWR([`get-category`], () => getCategory(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const categories: { name: string; value: number; }[] = [
        { name: t("analysis.all"), value: 0 }, // Extra entry
        ...(categoryData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [])
    ];

    return (
        <div>
            <div className="flex items-center space-x-4">
                <SearchInput
                    value={""}
                    onChange={() => { }}
                    searchType="outlined"
                    classname="mt-6 w-96"
                    placeholder={t("analysis.search")}
                />
                <DropdownInput
                    title={t("warehouse.category")}
                    value={cat}
                    classname="w-64"
                    options={categories}
                    onChange={(value) => setCat(value)}
                />
            </div>
            <hr className="my-4" />
            <div className="space-y-3">
                <div className="text-text01 uppercase">{t("analysis.oper")}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <AnalysisCard iconText="file-text" firstText={t("routes.deposits")} secondText={t("analysis.tran")} />
                    <AnalysisCard iconText="file-text" firstText={t("routes.planAct")} secondText={t("analysis.tran")} />
                    <AnalysisCard iconText="file-text" firstText={t("marketing.checks")} secondText={t("analysis.group")} />
                    <AnalysisCard iconText="book-open" firstText={t("marketing.events")} secondText={t("analysis.list")} />
                </div>
            </div>
        </div>
    )
}

export default Analysis;