import './globals.css';
import React from 'react';
import Header from '../components/Header';
import Providers from '../components/Providers';

export const metadata = {
  title: 'AI Task Manager',
  description: 'Task manager with AI priority classification',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          <div className="container py-6">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
