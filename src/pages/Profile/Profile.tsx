import GenericTabs from '@/components/ui/Tabs/GenericTab';
import useAuthStore from '@/config/store/authSlice';
import { useLogout, useClearPermissions, useSetPermissions } from '@/hooks/useAuthStore';
import { useClearUserData } from '@/hooks/useUserStore';
import { logoutPlatformUser } from '@/services/api/platform';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { Button } from 'antd';
import React from 'react';
const InfoTab = React.lazy(() => import('./InfoTab'));
const PasswordTab = React.lazy(() => import('./PasswordTab'));
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

const ProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab') || 'basic';

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      tab: key,
    });
  };

  const setClearUser = useClearUserData();
  const logout = useLogout();
  const setClearPermissions = useClearPermissions();
  const setPermissions = useSetPermissions();

    const tabItems = [
    {
      key: 'basic',
      label: t('profile.basic'),
      content: <InfoTab />,
    },
    {
      key: 'password',
      label: t('profile.changePass'),
      content: <PasswordTab />,
    }
  ];

  const handleLogout = async () => {
    try {
      await logoutPlatformUser();
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.clear();
    sessionStorage.clear();

    setClearUser();
    logout();
    setClearPermissions();
    setPermissions([]);

    useAuthStore.getState().reset();

    window.location.href = '';
  };

  return (
    <div>
      <div className="ml-12 md:ml-0 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.profile')}
          </span>
        </div>
        <Button
          className="btn-primary"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          <div className="hidden sm:flex">{t('profile.logout')}</div>
        </Button>
      </div>
      <div className="max-w-5xl bg-white">
        <div className="py-5">
        <GenericTabs
          tabs={tabItems}
          activeKey={tabFromUrl}
          onChange={handleTabChange}
          tabBarGutter={24}
          tabBarStyle={{ marginBottom: 24 }}
          type="line"
        />
      </div>
      </div>
    </div>
  );
};

export default ProfileForm;
