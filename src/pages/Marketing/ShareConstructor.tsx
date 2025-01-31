import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import { useButtonCreate } from "@/components/context/useContext";
import { useNavigate } from "react-router-dom";

const ShareConstructor: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();

    useEffect(() => {
        if (buttonOn)
            navigate("/marketing/share/constructor/bonus")
    }, [navigate, buttonOn]);

    return (
        <div>
            {notificationVisible && (
                <Notification
                    title={t("routes.share")}
                    message={t("marketing.promotion")}
                    showBonus={true}
                    onClose={() => setNotificationVisible(false)}
                />
            )}
        </div>
    )
}

export default ShareConstructor;