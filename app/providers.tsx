'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfigProvider, theme } from 'antd'
import type { ThemeConfig } from 'antd'
import faIR from 'antd/es/locale/fa_IR'

export default function Providers({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setIsDark(query.matches)

    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const themeConfig = useMemo<ThemeConfig>(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#2980b9',
        borderRadius: 12,
        fontFamily:
          'Yekan, Vazirmatn, Tahoma, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    }),
    [isDark],
  )

  return (
    <ConfigProvider direction="rtl" locale={faIR} theme={themeConfig}>
      {children}
    </ConfigProvider>
  )
}