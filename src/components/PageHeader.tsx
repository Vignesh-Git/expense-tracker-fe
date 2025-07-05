import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-column gap-2 mb-4">
      <div className="flex align-items-center justify-content-between">
        <h1 className="m-0 font-bold text-2xl">{title}</h1>
        {children}
      </div>
      {subtitle && <p className="m-0 text-600 text-lg">{subtitle}</p>}
    </div>
  );
};

export default PageHeader; 