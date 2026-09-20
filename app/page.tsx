'use client'

import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input,
  Layout,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ClearOutlined,
  CopyOutlined,
  DownOutlined,
  GithubOutlined,
  ThunderboltOutlined,
  TwitterOutlined,
} from '@ant-design/icons'
import {
  CONVERT_OPTIONS,
  DEFAULT_OPTIONS,
  convertText,
  type ConvertOptions,
  type ConvertStat,
  type OptionKey,
} from '../lib/convert'
import packageJson from '../package.json'
import styles from '../styles/Home.module.css'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text, Link } = Typography
const { TextArea } = Input

const GITHUB_URL = 'https://github.com/maryayi/parsnevesht'
const TWITTER_URL = 'https://twitter.com/maryayi'

const faNumber = new Intl.NumberFormat('fa-IR', { useGrouping: false })
const formatNumber = (value: number) => faNumber.format(value)

export default function Home() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [options, setOptions] = useState<ConvertOptions>(DEFAULT_OPTIONS)
  const [stats, setStats] = useState<ConvertStat[]>([])
  const [total, setTotal] = useState(0)
  const [ran, setRan] = useState(false)
  const [copied, setCopied] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleToggle = (key: OptionKey, checked: boolean) => {
    setOptions((previous) => ({ ...previous, [key]: checked }))
  }

  const handleConvert = () => {
    const result = convertText(input, options)
    setOutput(result.output)
    setStats(result.stats)
    setTotal(result.total)
    setRan(true)
    setCopied(false)
  }

  const handleReset = () => {
    setInput('')
    setOutput('')
    setStats([])
    setTotal(0)
    setRan(false)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!output) {
      return
    }

    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Layout className={styles.layout}>
      <a className={styles.skipLink} href="#main">
        رفتن به محتوای اصلی
      </a>

      <Header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand} translate="no">
            پارس‌نوشت
          </span>
          <Space size="small">
            <Button
              type="text"
              shape="circle"
              className={styles.socialButton}
              icon={<GithubOutlined aria-hidden="true" />}
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="صفحه پروژه در گیت‌هاب"
            />
            <Button
              type="text"
              shape="circle"
              className={styles.socialButton}
              icon={<TwitterOutlined aria-hidden="true" />}
              href={TWITTER_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="توییتر سازنده"
            />
          </Space>
        </div>
      </Header>

      <Content id="main" tabIndex={-1} className={styles.content}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <Title level={1} className={styles.title}>
              پارس‌نوشت
              <Tag color="red" className={styles.beta}>
                بتا
              </Tag>
            </Title>
            <Paragraph className={styles.subtitle}>
              رفع اشکال سریع غلط‌های متداول نوشته‌های فارسی
            </Paragraph>
          </div>

          <Card className={styles.card}>
            <Paragraph className={styles.intro}>
              پارس‌نوشت ابتدا به عنوان یک سرگرمی یا بهتر بگویم یک خارش فکری شروع شد! اول قرار
              بود فقط وسیله‌ای باشد برای جایگزینی حروف «کاف» و «ی» فارسی به جای همتاهای
              عربی‌شان تا هم ظاهر نوشته‌ها بهبود یابد هم اختلالی در نمایه کردن نوشته‌های
              فارسی در وب ایجاد نشود. بعد از آن بود که تشویق‌های دوستان باعث شد امکانات
              بیشتری به آن اضافه کنم تا وسیله‌ای باشد برای رفع سریع مشکلات رایج در نگارش
              فارسی. پارس‌نوشت را فعلا در وضعیت بتا نگه داشته‌ام زیرا مطمئنا بدون باگ و خطا
              نیست. خوشحال می‌شوم اشکالاتی را که در آن می‌یابید از طریق{' '}
              <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
                صفحه این پروژه در Github
              </Link>{' '}
              به من گزارش کنید. همچنین همیشه پذیرای پیشنهادات شما برای بهبود آن هستم.
              پارس‌نوشت تحت لایسنس آزاد GPL (نسخه سوم) ارائه شده است و هرگونه استفاده تحت
              اجازه این گواهی از آن آزاد است. :)
            </Paragraph>
          </Card>

          <Card
            title={
              <button
                type="button"
                className={styles.cardToggle}
                onClick={() => setSettingsOpen((open) => !open)}
                aria-expanded={settingsOpen}
              >
                <h2 className={styles.cardTitle}>تنظیمات</h2>
                <DownOutlined
                  className={`${styles.cardToggleIcon} ${
                    settingsOpen ? styles.cardToggleIconOpen : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            }
            className={styles.card}
          >
            {settingsOpen && (
              <div className={styles.settingsGrid}>
                {CONVERT_OPTIONS.map((option) => (
                  <Checkbox
                    key={option.key}
                    name={option.key}
                    className={styles.settingItem}
                    checked={options[option.key]}
                    onChange={(event) => handleToggle(option.key, event.target.checked)}
                  >
                    {option.label}
                  </Checkbox>
                ))}
              </div>
            )}
          </Card>

          <Card className={styles.card}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={11}>
                <label className={styles.fieldLabel} htmlFor="input-text">
                  متن ورودی
                </label>
                <TextArea
                  id="input-text"
                  name="input-text"
                  className={styles.textarea}
                  rows={12}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="متن مورد نظر خود را اینجا وارد کنید و روی «تبدیل» بزنید…"
                />
              </Col>

              <Col xs={24} md={2} className={styles.arrowCol}>
                <ArrowLeftOutlined className={styles.arrow} aria-hidden="true" />
              </Col>

              <Col xs={24} md={11}>
                <div className={styles.outputHeader}>
                  <label className={styles.fieldLabel} htmlFor="output-text">
                    متن اصلاح‌شده
                  </label>
                  <Button
                    size="small"
                    icon={
                      copied ? (
                        <CheckOutlined aria-hidden="true" />
                      ) : (
                        <CopyOutlined aria-hidden="true" />
                      )
                    }
                    onClick={handleCopy}
                    disabled={!output}
                  >
                    {copied ? 'کپی شد' : 'کپی متن'}
                  </Button>
                </div>
                <TextArea
                  id="output-text"
                  name="output-text"
                  className={styles.textarea}
                  rows={12}
                  value={output}
                  readOnly
                  placeholder="نتیجه اصلاح متن در این کادر نمایش داده می‌شود…"
                />
              </Col>
            </Row>

            <Divider />

            <Space className={styles.actions} size="middle">
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined aria-hidden="true" />}
                onClick={handleConvert}
              >
                تبدیل
              </Button>
              <Popconfirm
                title="پاک کردن متن؟"
                description="متن ورودی و نتیجه اصلاح حذف می‌شوند."
                okText="پاک کن"
                cancelText="انصراف"
                okButtonProps={{ danger: true }}
                onConfirm={handleReset}
                disabled={!input && !output}
              >
                <Button
                  size="large"
                  danger={Boolean(input || output)}
                  icon={<ClearOutlined aria-hidden="true" />}
                >
                  پاک کردن
                </Button>
              </Popconfirm>
            </Space>

            <span className={styles.srOnly} role="status" aria-live="polite">
              {copied ? 'متن اصلاح‌شده در حافظه کپی شد' : ''}
            </span>

            {ran &&
              (total > 0 ? (
                <Alert
                  className={styles.report}
                  type="success"
                  showIcon
                  title="گزارش عملکرد"
                  description={
                    <>
                      <ul className={styles.reportList}>
                        {stats.map((stat) => (
                          <li key={stat.key}>
                            {formatNumber(stat.count)} {stat.label}
                          </li>
                        ))}
                      </ul>
                      اکنون می‌توانید نوشته اصلاح‌شده را از کادر متن اصلاح‌شده کپی کرده و در
                      محل مورد نظر جای‌گذاری کنید.
                    </>
                  }
                />
              ) : (
                <Alert
                  className={styles.report}
                  type="info"
                  showIcon
                  title="هیچ موردی برای تغییر یافت نشد"
                />
              ))}
          </Card>
        </div>
      </Content>

      <Footer className={styles.footer}>
        <Text>
          ساخته شده به دست{' '}
          <Link href={TWITTER_URL} target="_blank" rel="noreferrer" className={styles.footerLink}>
            مهدی آریایی
          </Link>{' '}
          — منتشر شده تحت لایسنس GPL
        </Text>
        <br />
        <Text type="secondary">
          Copyright © {formatNumber(Number(process.env.NEXT_PUBLIC_BUILD_YEAR))} — نسخه{' '}
          <span translate="no">{packageJson.version}</span>
        </Text>
      </Footer>
    </Layout>
  )
}