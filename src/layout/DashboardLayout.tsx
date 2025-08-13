import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ContextProvider } from '@/components/context/Context.tsx';
import Spin from 'antd/es/spin';
import MainLayout from './MainLayout';
import { setToastFunction } from '@/config/axiosConfig';
import { useToast } from '@/hooks/useToast';

const DashboardLayoutContent: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  return (
    <MainLayout>
        <Suspense
          fallback={
            <div
              style={{
                height: '50vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Spin size="large" />
            </div>
          }
        >
          <main>
            <Outlet />
          </main>
        </Suspense>
    </MainLayout>
  );
};

const DashboardLayout: React.FC = () => {
  return (
    <ContextProvider>
      <DashboardLayoutContent />
    </ContextProvider>
  );
};

export default DashboardLayout;
