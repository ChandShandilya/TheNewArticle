import { cookies } from 'next/headers';
import './globals.css';
import { Masthead } from '../components/Masthead';
import { SiteFooter } from '../components/SiteFooter';
import { PWARegister } from '../components/PWARegister';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'TheNewArticle';

export const metadata = {
  title: `${SITE_NAME} — India-first news, source-first`,
  description:
    'India-first, low-bandwidth news aggregator. Multiple sources per story, original links always one tap away.',
  manifest: '/manifest.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16181d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const textOnly = cookies().get('textOnly')?.value === '1';
  return (
    <html lang="en">
      <body className={textOnly ? 'text-only' : undefined}>
        <Masthead />
        <main className="wrap">{children}</main>
        <SiteFooter textOnly={textOnly} />
        <PWARegister />
      </body>
    </html>
  );
}
