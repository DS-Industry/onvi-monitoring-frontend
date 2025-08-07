import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ContextProvider } from '@/components/context/Context.tsx';
import Spin from 'antd/es/spin';

const PublicLayout: React.FC = () => {
  return (
    <ContextProvider>
      <Suspense
        fallback={
          <div
            style={{
              height: '100vh',
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
    </ContextProvider>
  );
};

export default PublicLayout;
