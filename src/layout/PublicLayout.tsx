import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ContextProvider } from '@/components/context/Context.tsx';
import Spin from 'antd/es/spin';
import { setToastFunction } from '@/config/axiosConfig';
import { useToast } from '@/hooks/useToast';

const PublicLayoutContent: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  return (
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
  );
};

const PublicLayout: React.FC = () => {
  return (
    <ContextProvider>
      <PublicLayoutContent />
    </ContextProvider>
  );
};

export default PublicLayout;
