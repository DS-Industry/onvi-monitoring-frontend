import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Divider,
  List,
  Avatar,
} from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  CrownFilled,
  DashboardOutlined,
  LockOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import type { TariffRequirements } from '@/subscription/tariffAccess';
import type { SubscriptionPlanCode } from '@/services/api/subscription';

type SubscriptionPlaceholderProps = {
  routeName?: string;
  requirements?: TariffRequirements;
  reason?: 'missing_subscription' | 'inactive_subscription' | 'feature' | 'plan';
};

const PLAN_ORDER: SubscriptionPlanCode[] = ['BASIC', 'SPACE', 'BUSINESS', 'CUSTOM'];

const normalizePlanCode = (value?: string | null): SubscriptionPlanCode | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  return PLAN_ORDER.find(code => code === normalized);
};

const getUpgradePlans = (
  currentPlanCode: SubscriptionPlanCode | undefined,
  requirements?: TariffRequirements
): SubscriptionPlanCode[] => {
  const requiredPlans = requirements?.requiredPlanCodes || [];
  const requiredFeatures = requirements?.requiredTariffFeatures || [];

  if (requiredPlans.length > 0) {
    return requiredPlans.filter(plan => plan !== currentPlanCode);
  }

  const needsAddonPlan = requiredFeatures.some(feature => {
    const normalized = feature.trim().toUpperCase();
    return normalized === 'ONVI' || normalized === 'CORPORATE_CLIENTS' || normalized === 'CORPORATECLIENTS';
  });

  if (needsAddonPlan) {
    const addonPlans: SubscriptionPlanCode[] = ['BUSINESS', 'CUSTOM'];
    return addonPlans.filter(plan => plan !== currentPlanCode);
  }

  if (!currentPlanCode) {
    return ['SPACE', 'BUSINESS', 'CUSTOM'];
  }

  const currentIndex = PLAN_ORDER.indexOf(currentPlanCode);
  if (currentIndex < 0) {
    return PLAN_ORDER;
  }

  return PLAN_ORDER.slice(currentIndex + 1);
};

const SubscriptionPlaceholder = ({
  routeName,
  requirements,
  reason,
}: SubscriptionPlaceholderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );
  const currentPlanCode =
    activeSubscription?.planCode || normalizePlanCode(activeSubscription?.planName);
  const upgradePlans = getUpgradePlans(currentPlanCode, requirements);
  const moduleName = routeName
    ? t(`routes.${routeName}`)
    : t('subscriptionPlaceholder.defaultModule');
  const reasonText = reason
    ? t(`subscriptionPlaceholder.reason.${reason}`)
    : t('subscriptionPlaceholder.reason.fallback');

  return (
    <div className="w-full p-6">
      <Card style={{ borderRadius: 16 }}>
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} lg={13}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space align="center" size="middle">
                <Avatar
                  size={52}
                  style={{ backgroundColor: '#E6F4FF', color: '#1677FF' }}
                  icon={<LockOutlined />}
                />
                <div>
                  <Typography.Text type="secondary">
                    {moduleName}
                  </Typography.Text>
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    {t('subscriptionPlaceholder.title')}
                  </Typography.Title>
                </div>
              </Space>

              <Typography.Text type="secondary">
                {t('subscriptionPlaceholder.description')}
              </Typography.Text>

              <List
                size="small"
                split={false}
                dataSource={[
                  t('subscriptionPlaceholder.currentPlan', {
                    plan: activeSubscription?.planName || t('subscriptionPlaceholder.noActivePlan'),
                  }),
                  reasonText,
                  t('subscriptionPlaceholder.selectPlanHint'),
                ]}
                renderItem={item => (
                  <List.Item style={{ padding: '6px 0' }}>
                    <Space align="start">
                      <CheckCircleFilled style={{ color: '#1677FF', marginTop: 4 }} />
                      <Typography.Text>{item}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />

              <Divider style={{ margin: '8px 0 0' }} />

              <Space size="middle" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/administration/subscriptions')}
                >
                  {t('subscriptionPlaceholder.upgradeButton')}
                </Button>
                <Button
                  size="large"
                  icon={<DashboardOutlined />}
                  onClick={() => navigate('/')}
                >
                  {t('subscriptionPlaceholder.dashboardButton')}
                </Button>
              </Space>
            </Space>
          </Col>

          <Col xs={24} lg={11}>
            <div
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #F0F8FF 0%, #F9FBFF 100%)',
                border: '1px solid #E6F4FF',
                padding: 20,
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space align="center">
                  <CrownFilled style={{ color: '#FAAD14' }} />
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {t('subscriptionPlaceholder.availablePlansTitle')}
                  </Typography.Title>
                </Space>

                <Typography.Text type="secondary">
                  {t('subscriptionPlaceholder.availablePlansHint')}
                </Typography.Text>

                <Space wrap size={[8, 10]}>
                  {upgradePlans.length > 0 ? (
                    upgradePlans.map(plan => (
                      <Tag
                        key={plan}
                        color="blue"
                        style={{
                          borderRadius: 999,
                          padding: '6px 12px',
                          fontSize: 14,
                        }}
                      >
                        {t(`subscriptionPlaceholder.planNames.${plan}`)}
                      </Tag>
                    ))
                  ) : (
                    <Tag color="default">
                      {t('subscriptionPlaceholder.contactSupport')}
                    </Tag>
                  )}
                </Space>

                {!!requirements?.requiredTariffFeatures?.length && (
                  <>
                    <Divider style={{ margin: '8px 0' }} />
                    <Typography.Text type="secondary">
                      {t('subscriptionPlaceholder.requiredFeaturesTitle')}
                    </Typography.Text>
                    <Space wrap size={[8, 8]}>
                      {requirements.requiredTariffFeatures.map(feature => (
                        <Tag key={feature}>{feature}</Tag>
                      ))}
                    </Space>
                  </>
                )}

                <Button
                  type="link"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/administration/subscriptions')}
                  style={{ padding: 0 }}
                >
                  {t('subscriptionPlaceholder.manageSubscriptionLink')}
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SubscriptionPlaceholder;
