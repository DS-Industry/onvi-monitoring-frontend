import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import { Content } from 'antd/es/layout/layout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const isCreateOrganization = pathname === '/create-organization';

  return (
    <Layout
      style={{
        minHeight: '100vh',
        backgroundColor: isCreateOrganization ? '#000000' : 'white',
      }}
    >
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <Layout
        className={`mt-3 md:mt-0 transition-all duration-300 ${isOpen ? 'md:ms-[256px]' : 'md:ms-[80px]'}`}
      >
        <Content
          className={`min-h-screen ${isCreateOrganization ? 'bg-black' : 'bg-white'}`}
        >
          {isCreateOrganization ? (
            <div className="relative min-h-screen z-10">{children}</div>
          ) : (
            <div className="px-4 sm:px-6 relative min-h-screen z-10 mt-4">
              {children}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
