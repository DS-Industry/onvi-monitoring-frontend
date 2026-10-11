import React, { useEffect } from 'react';
import { ContextProvider } from '@/components/context/Context.tsx';
import ServiceUnavailable from '@/components/ServiceUnavailable';
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
      <main>
        <ServiceUnavailable />
      </main>
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
