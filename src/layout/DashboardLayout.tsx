import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import SideNavbar from '@/layout/SideNavbar.tsx';
import { ContextProvider } from '@/components/context/Context.tsx';
import Spin from 'antd/es/spin';

const DashboardLayout: React.FC = () => {
  return (
    <ContextProvider>
      <SideNavbar>
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
      </SideNavbar>
    </ContextProvider>
  );
};

export default DashboardLayout;
