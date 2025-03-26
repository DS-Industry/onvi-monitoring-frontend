import React from "react";
import { useTranslation } from "react-i18next";
import Clock from "@icons/Clock.png";
import Button from "@/components/ui/Button/Button";
import Flame from "@icons/Flame.png";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import { getClientById } from "@/services/api/marketing";

const Loyalty: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const editClientId = location.state.ownerId;

    const { data: clientData } = useSWR(editClientId !== 0 ? [`get-client-by-id`] : null, () => getClientById(editClientId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });


    return (
        <div className="flex space-x-6">
            <div className="rounded-2xl shadow-card p-4 space-y-4 w-[360px] h-80">
                <div className="font-semibold text-2xl mb-5 text-text01">{t("marketing.loyalty")}</div>
                <div>
                    <div className="text-text02 text-sm">{t("marketing.card")}</div>
                    <div className="w-80 border border-borderFill rounded-md text-text01 px-2">{clientData?.card.devNumber}</div>
                </div>
                <div>
                    <div className="text-text02 text-sm">{t("marketing.un")}</div>
                    <div className="w-80 border border-borderFill rounded-md text-text01 px-2">{clientData?.card.number}</div>
                </div>
                <div>
                    <div className="text-text02 text-sm">{t("equipment.start")}</div>
                    <div className="w-32 border border-borderFill rounded-md text-text01 px-2">01.06.2023</div>
                </div>
            </div>
            <div className="rounded-2xl shadow-card p-4 space-y-6 w-[360px] h-80">
                <div className="font-semibold text-2xl mb-5 text-text01">{t("marketing.purchase")}</div>
                <div>
                    <div className="text-xs text-text01 font-semibold">{t("marketing.detail")}</div>
                    <div className="flex">
                        <div>
                            <div className="text-lg text-text01 font-semibold">12 500</div>
                            <div className="text-text02 text-sm font-normal w-24">{t("marketing.acc")}</div>
                        </div>
                        <div className="text-end ml-auto">
                            <div className="text-lg text-text01 font-semibold">2 500</div>
                            <div className="text-text02 text-sm font-normal w-24">{t("marketing.until")}</div>
                        </div>
                    </div>
                    <div className="flex space-x-1.5 mt-2">
                        {Array.from({ length: 20 }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-2.5 h-5 ${index < 15 ? "bg-primary02/30" : "bg-background07"
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex">
                        <div>
                            <div className="text-lg text-text01 font-semibold">{t("marketing.newbie")}</div>
                            <div className="text-text02 text-sm font-normal">{t("marketing.current")}</div>
                        </div>
                        <div className="text-end ml-auto">
                            <div className="text-lg text-text01 font-semibold">{t("marketing.amateur")}</div>
                            <div className="text-text02 text-sm font-normal w-24">{t("marketing.next")}</div>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <img src={Clock} />
                    <div className="text-primary02 font-semibold">{t("marketing.accrual")}</div>
                </div>
            </div>
            <div className="shadow-card w-[360px] h-80 rounded-2xl">
                <div className="h-3/5 p-4 space-y-6">
                    <div className="flex items-center">
                        <div className="font-semibold text-2xl text-text01">{t("marketing.bonus")}</div>
                        <Button
                            title={t("marketing.accrue")}
                            iconPlus={true}
                            type="outline"
                            classname="ml-auto"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-text01 font-semibold">{t("marketing.detail")}</div>
                        <div className="flex justify-between">
                            <div>
                                <div className="text-lg text-text01 font-semibold">100</div>
                                <div className="text-text02 text-sm font-normal w-24">{t("marketing.active")}</div>
                            </div>
                            <div>
                                <div className="text-lg text-text01 font-semibold">0</div>
                                <div className="text-text02 text-sm font-normal w-24">{t("marketing.wait")}</div>
                            </div>
                            <div>
                                <div className="flex">
                                    <img src={Flame} />
                                    <div className="text-lg text-warningFill font-semibold">100</div>
                                </div>
                                <div className="text-text02 text-sm font-normal w-28">{t("marketing.will")}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-background07 h-2/5 p-4 rounded-b-2xl">
                    <div className="text-xs text-text01 font-semibold">{t("marketing.during")}</div>
                    <div className="flex justify-between">
                        <div>
                            <div className="text-lg text-text01 font-semibold">100</div>
                            <div className="text-text02 text-sm font-normal w-24">{t("marketing.accr")}</div>
                        </div>
                        <div>
                            <div className="text-lg text-text01 font-semibold">0</div>
                            <div className="text-text02 text-sm font-normal w-24">{t("marketing.writ")}</div>
                        </div>
                        <div>
                            <div className="text-lg text-text01 font-semibold">100</div>
                            <div className="text-text02 text-sm font-normal w-24">{t("marketing.burn")}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loyalty;