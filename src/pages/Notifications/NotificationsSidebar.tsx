import React from 'react';
import {
  Menu,
  Typography,
  Dropdown,
  Button,
  Spin,
} from 'antd';
import {
  MailOutlined,
  StarOutlined,
  DeleteOutlined,
  TagFilled,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { TFunction } from 'i18next';
import { TagResponse, UserNotificationType } from '@/services/api/notifications';

const { Text } = Typography;

type Props = {
  t: TFunction;
  notificationsData?: any[];
  tags?: TagResponse[];
  loadingTags?: boolean;
  onFilter: (params: Record<string, unknown>) => void;
  onModalOpen: (value: boolean) => void;
  handleUpdate: (id: number) => void;
  onDrawerVisible?: (value: boolean) => void; // optional, for Drawer closing on mobile
};

const NotificationSidebar: React.FC<Props> = ({
  t,
  notificationsData,
  tags,
  loadingTags,
  onFilter,
  onModalOpen,
  handleUpdate,
  onDrawerVisible,
}) => {
  const closeDrawer = () => {
    if (onDrawerVisible) onDrawerVisible(false);
  };

  return (
    <div className="h-full bg-white border-r border-borderFill">
      {/* Section 1: General Filters */}
      <div className="p-4 border-b border-borderFill">
        <Text type="secondary">TITLE</Text>
        <Menu
          mode="vertical"
          selectable={false}
          className="bg-transparent border-none"
        >
          <Menu.Item
            className="!p-0"
            onClick={() => {
              onFilter({});
              closeDrawer();
            }}
          >
            <div className="flex justify-between pr-2">
              <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
                <MailOutlined
                  style={{ fontSize: '24px' }}
                  className="text-text02 group-hover:text-text01"
                />
                <span className="font-semibold text-text02 group-hover:text-text01">
                  {t('analysis.all')}
                </span>
              </div>
              <div className="hover:bg-opacity01 px-2 rounded-lg h-8 flex items-center mt-1">
                {notificationsData?.length}
              </div>
            </div>
          </Menu.Item>

          <Menu.Item
            className="!p-0"
            onClick={() => {
              onFilter({ type: UserNotificationType.FAVORITE });
              closeDrawer();
            }}
          >
            <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
              <StarOutlined
                style={{ fontSize: '24px' }}
                className="text-text02 group-hover:text-text01"
              />
              <span className="font-semibold text-text02 group-hover:text-text01">
                {t('notifications.fav')}
              </span>
            </div>
          </Menu.Item>

          <Menu.Item
            className="!p-0"
            onClick={() => {
              onFilter({ type: UserNotificationType.DELETED });
              closeDrawer();
            }}
          >
            <div className="flex items-center px-2 hover:bg-[#f5f5f5] group">
              <DeleteOutlined
                style={{ fontSize: '24px' }}
                className="text-text02 group-hover:text-text01"
              />
              <span className="font-semibold text-text02 group-hover:text-text01">
                {t('notifications.basket')}
              </span>
            </div>
          </Menu.Item>
        </Menu>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center">
          <Text type="secondary">TITLE</Text>
          <Button
            size="small"
            onClick={() => onModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <PlusOutlined />
          </Button>
        </div>

        <Menu
          mode="vertical"
          selectable={false}
          className="bg-transparent border-none"
        >
          {loadingTags ? (
            <Menu.Item className="!p-0">
              <div className="flex items-center px-2">
                <Spin size="small" />
                <span className="ml-2">{t('common.loading')}</span>
              </div>
            </Menu.Item>
          ) : (
            tags?.map(tag => (
              <Menu.Item
                key={tag.props.name}
                className="!p-0"
                onClick={() => {
                  onFilter({ tagId: tag.props.id });
                  closeDrawer();
                }}
              >
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2 px-2 hover:bg-[#f5f5f5]">
                    <div
                      style={{
                        color: tag.props.color,
                        fill: tag.props.color,
                        marginTop: '5px',
                      }}
                    >
                      <TagFilled style={{ fontSize: '24px' }} />
                    </div>
                    <span className="font-semibold text-text02 group-hover:text-text01">
                      {tag.props.name}
                    </span>
                  </div>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="Edit"
                          onClick={() => handleUpdate(tag.props.id)}
                        >
                          <div>{t('routes.edit')}</div>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <MoreOutlined
                      className="cursor-pointer text-text03 hover:text-opacity01"
                      style={{ fontSize: '24px' }}
                    />
                  </Dropdown>
                </div>
              </Menu.Item>
            ))
          )}
        </Menu>
      </div>
    </div>
  );
};

export default NotificationSidebar;
