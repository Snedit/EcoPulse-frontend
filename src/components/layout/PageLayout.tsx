import React from 'react';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  padding?: boolean;
}

export default function PageLayout({ 
  children, 
  title, 
  padding = true 
}: PageLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-navy-950">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 relative overflow-y-auto">
        <div className={`${padding ? 'p-4 md:p-6 lg:p-8' : ''}`}>
          {title && (
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                {title}
              </h1>
            </header>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
}