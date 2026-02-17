import type { Metadata } from 'next';
import '@/design-system/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'BrainBolt – Adaptive Quiz',
  description: 'Infinite adaptive quiz with live leaderboards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          <main className="min-h-[calc(100vh-56px)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
