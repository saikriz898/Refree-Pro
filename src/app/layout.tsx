import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Bebas_Neue, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { AutoMigrate } from '@/components/AutoMigrate';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { FetchInterceptor } from '@/components/FetchInterceptor';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'Referee Pro',
  description: 'Professional Match & Tournament Management',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F8A5F" />
        <script dangerouslySetInnerHTML={{ __html: `
          if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.add('light');
          }
        `}} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        <ToastProvider>
          <FetchInterceptor />
          <AutoMigrate />
          <OfflineIndicator />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
