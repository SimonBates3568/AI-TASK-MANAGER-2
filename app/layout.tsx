import './globals.css';
import React from 'react';
import Header from '../components/Header';

export const metadata = {
  title: 'AI Task Manager',
  description: 'Task manager with AI priority classification',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-4xl mx-auto p-4">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
