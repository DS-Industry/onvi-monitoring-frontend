import React, { useEffect } from 'react';
import { ContextProvider } from '@/components/context/Context.tsx';
import ServiceUnavailable from '@/components/ServiceUnavailable';
import { setToastFunction } from '@/config/axiosConfig';
import { useToast } from '@/hooks/useToast';

const PublicLayoutContent: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  return (
    <main className="min-h-screen bg-white">
      <ServiceUnavailable />
    </main>
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
