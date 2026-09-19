'use client'

import type { ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import faIR from 'antd/es/locale/fa_IR'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={{
        token: {
          colorPrimary: '#2980b9',
          borderRadius: 12,
          fontFamily:
            'Yekan, Vazirmatn, Tahoma, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}