import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import Providers from './providers'
import 'antd/dist/reset.css'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'پارس‌نوشت',
  description: 'رفع اشکال سریع غلط‌های متداول نوشته‌های فارسی',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body suppressHydrationWarning>
        <AntdRegistry>
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
