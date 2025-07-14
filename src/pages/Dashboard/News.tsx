import React, { useState } from "react";
import Toast from "@ui/Toast";
import Notification from "@ui/Notification";
import FactoryLetterS from "@/assets/Factory Letter S.png";
import Attention from "@/assets/Attention.png";
import { useTranslation } from "react-i18next";
import { Row, Col, Card, Typography } from "antd";

const { Text, Title } = Typography;

interface NewsItem {
  id: number;
  title: string;
  text: string;
}

const initialNews: NewsItem[] = [
  { id: 1, title: "promotion", text: "promotionText" },
  { id: 2, title: "newEquipment", text: "newEquipmentText" },
  { id: 3, title: "loyalty", text: "loyaltyText" },
];

const News: React.FC = () => {
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [news, setNews] = useState<NewsItem[]>(initialNews);

  const { t } = useTranslation();

  const handleClose = (id: number) => {
    setNews(news.filter((item) => item.id !== id));
  };

  return (
    <>
      {notificationVisible && (
        <Notification
          title={t("news.notification")}
          message={t("news.notificationText")}
          onClose={() => setNotificationVisible(false)}
        />
      )}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            styles={{
              body: {
                padding: 24,
                backgroundColor: "#F8F8FA",
                borderRadius: 18,
              },
            }}
            style={{ borderRadius: 18 }}
          >
            <Text type="secondary" strong>
              {t("news.daysLeft")}
            </Text>
            <Title level={4} style={{ margin: "8px 0" }}>
              {t("news.maximumTariff")}
            </Title>
            <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
              <Text>{t("news.upToDate")}</Text>
              <div style={{ marginLeft: "auto" }}>
                <img src={FactoryLetterS} alt="Factory" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            styles={{
              body: {
                padding: 24,
                backgroundColor: "#F8F8FA",
                borderRadius: 18,
              },
            }}
            style={{ borderRadius: 18 }}
          >
            <Text type="secondary" strong>{t("news.critical")}</Text>
            <Title level={4} style={{ margin: "8px 0" }}>{t("news.chemistry")}</Title>
            <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
              <Text>{t("news.chemistryText")}</Text>
              <div style={{ marginLeft: "auto" }}><img src={Attention} alt="Attention" className="h-20" /></div>
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <Row gutter={[24, 24]}>
            {news.map((item) => (
              <Col xs={24} md={12} key={item.id}>
                <Toast
                  id={item.id}
                  textColor="black"
                  bgColor="background05"
                  onClose={handleClose}
                >
                  <div className="font-semibold">{t(`news.${item.title}`)}</div>
                  <div>{t(`news.${item.text}`)}</div>
                </Toast>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default News;
