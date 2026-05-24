import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TravelFlow AI',
  description: 'Multi-tenant travel agency management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="klvoyager" className="h-full">
      <body className="min-h-full antialiased bg-background text-foreground">{children}</body>
    </html>
  );
}
