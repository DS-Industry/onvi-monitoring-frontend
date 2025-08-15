import React from 'react';

interface HeaderProps {
  title: string;
  icon?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, icon }) => {
  return (
    <div className="ml-12 md:ml-0 mb-5">
      <div className="flex items-center space-x-2">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {title}
        </span>
        {icon}
      </div>
    </div>
  );
};

export default Header;