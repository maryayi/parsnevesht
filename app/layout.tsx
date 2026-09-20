import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import Providers from './providers'
import 'antd/dist/reset.css'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'پارس‌نوشت — رفع اشکال نوشته‌های فارسی',
  description: 'رفع سریع غلط‌های متداول نوشته‌های فارسی: کاف و ی عربی، اعداد و فاصله‌گذاری.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
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
      <body suppressHydrationWarning>
        <link
          rel="preload"
          href="/fonts/Yekan.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
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
