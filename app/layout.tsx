import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import Providers from './providers'
import { jsonLd } from '../lib/seo'
import 'antd/dist/reset.css'
import '../styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://parsnevesht.ir'),
  title: {
    default: 'پارس‌نوشت — ویرایشگر و اصلاح متن فارسی آنلاین',
    template: '%s | پارس‌نوشت',
  },
  description:
    'رفع سریع غلط‌های متداول نوشته‌های فارسی: تبدیل کاف و ی عربی به فارسی، اصلاح ممیز اعشار، تبدیل اعداد انگلیسی و عربی، و تنظیم فاصله‌گذاری.',
  applicationName: 'پارس‌نوشت',
  authors: [{ name: 'مهدی آریایی', url: 'https://x.com/maryayi' }],
  creator: 'مهدی آریایی',
  publisher: 'پارس‌نوشت',
  keywords: [
    'پارس‌نوشت',
    'پارس نوشت',
    'ویرایش متن فارسی',
    'اصلاح متن فارسی',
    'کاف و ی عربی',
    'تبدیل ی عربی به فارسی',
    'تبدیل کاف عربی به فارسی',
    'اعداد فارسی',
    'تبدیل اعداد انگلیسی به فارسی',
    'تبدیل اعداد عربی به فارسی',
    'ممیز اعشار فارسی',
    'فاصله‌گذاری فارسی',
    'ویراستار آنلاین فارسی',
    'سئو متن فارسی',
    'parsnevesht',
  ],
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'پارس‌نوشت — ویرایشگر و اصلاح متن فارسی آنلاین',
    description:
      'ابزار آنلاین و رایگان برای اصلاح سریع غلط‌های متداول متن‌های فارسی: تبدیل کاف و ی عربی، اصلاح ممیز و اعداد، و تنظیم فاصله‌گذاری.',
    url: 'https://parsnevesht.ir',
    siteName: 'پارس‌نوشت',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'پارس‌نوشت — ویرایشگر و اصلاح متن فارسی آنلاین',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'پارس‌نوشت — ویرایشگر و اصلاح متن فارسی آنلاین',
    description: 'رفع سریع غلط‌های متداول نوشته‌های فارسی: کاف و ی عربی، اعداد و فاصله‌گذاری.',
    creator: '@maryayi',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1720' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="preload"
          href="/fonts/Yekan.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <AntdRegistry layer>
          <Providers>{children}</Providers>
        </AntdRegistry>
        <Script
          src="https://analytics.aryayi.dev/script.js"
          data-website-id="f0d213e2-ae57-4a53-999b-43a73700c38c"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
