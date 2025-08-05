import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ContextProvider } from '@/components/context/Context.tsx';
import Spin from 'antd/es/spin';
import MainLayout from './MainLayout';

const DashboardLayout: React.FC = () => {
  return (
    <ContextProvider>
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
    </ContextProvider>
  );
};

export default DashboardLayout;
