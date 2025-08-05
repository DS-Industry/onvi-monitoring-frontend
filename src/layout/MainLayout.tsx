import { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import { Content } from 'antd/es/layout/layout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <Layout
        className={`mt-3 md:mt-0 ${isOpen ? 'md:ms-[256px]' : 'md:ms-[80px]'}`}
        style={{ transition: 'all 0.3s' }}
      >
        <Content className="min-h-screen bg-white">
          <div className="px-4 sm:px-6 relative min-h-screen z-10">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
