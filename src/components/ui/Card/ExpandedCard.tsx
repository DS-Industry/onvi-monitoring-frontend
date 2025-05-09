import React, { FunctionComponent, SVGProps, useState } from "react";
import { Button, Card, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import Icon from "feather-icons-react";

type Props = {
    children: React.ReactNode;
    firstText: string;
    secondText: string;
    Component: FunctionComponent<SVGProps<SVGSVGElement>>;
    handleClick?: () => void;
    buttonText?: string;
};

const ExpandedCard: React.FC<Props> = ({
    children,
    firstText,
    secondText,
    Component,
    handleClick,
    buttonText
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useTranslation();

    const toggleExpand = () => setIsExpanded((prev) => !prev);

    return (
        <Card
            className="rounded-2xl shadow-card w-full md:max-w-[1400px]"
            styles={{
                body: {
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }
            }}
        >
            <Row
                align="middle"
                justify="space-between"
                gutter={[16, 16]}
                wrap
            >
                <Col flex="none">
                    <Component className="w-10 h-10" />
                </Col>
                <Col flex="auto">
                    <div className={`text-lg font-semibold ${isExpanded ? "text-primary02" : "text-text01"}`}>
                        {firstText}
                    </div>
                    <div className="text-text02">{secondText}</div>
                </Col>
                <Col flex="none">
                    <div
                        onClick={toggleExpand}
                        className="cursor-pointer"
                    >
                        <Icon
                            icon={isExpanded ? "chevron-up" : "chevron-down"}
                            className="w-6 h-6 text-text01"
                        />
                    </div>
                </Col>
            </Row>

            {isExpanded && (
                <>
                    <div>{children}</div>
                    <Row
                        gutter={[16, 16]}
                        justify="start"
                        className="pl-0 sm:pl-14"
                    >
                        {handleClick && (
                            <Col>
                                <Button
                                    type="primary"
                                    onClick={handleClick}
                                >
                                    {buttonText || t("organizations.save")}
                                </Button>
                            </Col>
                        )}
                        <Col>
                            <Button
                                type="default"
                                onClick={toggleExpand}
                            >
                                {t("marketing.close")}
                            </Button>
                        </Col>
                    </Row>
                </>
            )}
        </Card>
    );
};

export default ExpandedCard;
