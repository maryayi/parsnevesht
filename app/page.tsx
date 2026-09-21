'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input,
  Layout,
  Modal,
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
  InfoCircleOutlined,
  ThunderboltOutlined,
  XOutlined,
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
const TWITTER_URL = 'https://x.com/maryayi'

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
  const [aboutOpen, setAboutOpen] = useState(false)

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
            <Image
              src="/icon.svg"
              alt=""
              width={32}
              height={32}
              className={styles.brandIcon}
              priority
            />
            پارس‌نوشت
          </span>
          <Space size="small">
            <Button
              type="text"
              className={styles.aboutButton}
              icon={<InfoCircleOutlined aria-hidden="true" />}
              onClick={() => setAboutOpen(true)}
            >
              <span className={styles.aboutButtonLabel}>درباره</span>
            </Button>
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
              icon={<XOutlined aria-hidden="true" />}
              href={TWITTER_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="ایکس سازنده"
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
                className={styles.convertButton}
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

          <section className={styles.infoSection} aria-labelledby="features-heading">
            <div className={styles.sectionHeader}>
              <h2 id="features-heading" className={styles.sectionTitle}>
                امکانات و کاربردهای پارس‌نوشت
              </h2>
              <p className={styles.sectionSubtitle}>
                استانداردسازی و بهبود خوانایی متون زبان فارسی با اصلاح خودکار خطاهای رایج نوشتاری
              </p>
            </div>

            <div className={styles.featureGrid}>
              <article className={styles.featureItem}>
                <div className={styles.featureIcon}>ک / ی</div>
                <h3 className={styles.featureTitle}>اصلاح «ک» و «ی» عربی به فارسی</h3>
                <p className={styles.featureDescription}>
                  جایگزینی حروف عربی «ك» (کد یونیکد U+0643) و «ي» (کد یونیکد U+064A) با نویسه‌های استاندارد فارسی «ک» (U+06A9) و «ی» (U+06CC). این تفاوت یونیکدی مهم‌ترین دلیل پیدا نشدن کلمات در جستجوی سایت‌ها و پایگاه‌های داده است.
                </p>
              </article>

              <article className={styles.featureItem}>
                <div className={styles.featureIcon}>٫</div>
                <h3 className={styles.featureTitle}>اصلاح ممیز اعشار فارسی</h3>
                <p className={styles.featureDescription}>
                  تبدیل نقطه یا ممیز انگلیسی به علامت استاندارد ممیز اعشار فارسی (٫) در میان اعداد، با تشخیص هوشمند تاریخ‌ها (مانند ۱۴۰۳/۰۶/۳۱) جهت جلوگیری از تغییر فرمت تاریخ.
                </p>
              </article>

              <article className={styles.featureItem}>
                <div className={styles.featureIcon}>۰۱۲</div>
                <h3 className={styles.featureTitle}>تبدیل اعداد انگلیسی و عربی به فارسی</h3>
                <p className={styles.featureDescription}>
                  یکپارچه‌سازی تمام ارقام در نوشته‌ها با تبدیل نویسه‌های عددی لاتین (0-9) و ارقام عربی-مشرقی (٠-٩) به ارقام استاندارد و خوانای فارسی (۰ تا ۹).
                </p>
              </article>

              <article className={styles.featureItem}>
                <div className={styles.featureIcon}>( )</div>
                <h3 className={styles.featureTitle}>تنظیم فاصله‌گذاری و علائم نگارشی</h3>
                <p className={styles.featureDescription}>
                  حذف فواصل زائد و چسباندن صحیح علائم پایانی جمله (نقطه، علامت سوال، علامت تعجب) به کلمه پیشین و تنظیم فواصل استاندارد در خارج و داخل پرانتز، کروشه و آکولاد.
                </p>
              </article>
            </div>
          </section>

          <section className={styles.seoArticleSection} aria-labelledby="seo-guide-heading">
            <Card className={styles.articleCard}>
              <h2 id="seo-guide-heading" className={styles.articleTitle}>
                چرا اصلاح حروف عربی برای سئو (SEO) و نمایه‌سازی سایت‌ها حیاتی است؟
              </h2>
              <p className={styles.articleParagraph}>
                یکی از رایج‌ترین اشکالات در وب‌سایت‌های فارسی، ورود متن‌ها با صفحه‌کلیدهای عربی یا کپی کردن از اسناد نامعتبر است. اگرچه در ظاهر فونت ممکن است تفاوتی به چشم نیاید، موتورهای جستجو مانند گوگل و پایگاه‌های داده کلمات حاوی <strong>«ك»</strong> و <strong>«ي»</strong> عربی را با کلمات دارای <strong>«ک»</strong> و <strong>«ی»</strong> فارسی یکسان تلقی نمی‌کنند.
              </p>
              <p className={styles.articleParagraph}>
                این ناهمگونی باعث می‌شود زمانی که کاربر عبارتی را به زبان فارسی جستجو می‌کند، مقالات یا محصولات شما به درستی در نتایج جستجو ظاهر نشوند یا رتبه‌بندی پایینی کسب کنند. پارس‌نوشت با تصحیح دقیق کدهای یونیکد، متن‌های شما را برای سئو بهینه‌سازی کرده و متنی کاملاً استاندارد و قابل نمایه شدن تحویل می‌دهد.
              </p>

              <div className={styles.privacyBanner}>
                <div className={styles.privacyBadge}>حفظ کامل حریم خصوصی</div>
                <p className={styles.privacyText}>
                  تمام پردازش‌های اصلاح متن پارس‌نوشت به صورت صددرصد در مرورگر شما انجام شده و هیچ کلمه‌ای به سرور ارسال یا ثبت نمی‌شود؛ بنابراین می‌توانید با خیال راحت نوشته‌های اداری، کاری و حساس خود را ویرایش کنید.
                </p>
              </div>
            </Card>
          </section>

          <section className={styles.faqSection} aria-labelledby="faq-heading">
            <div className={styles.sectionHeader}>
              <h2 id="faq-heading" className={styles.sectionTitle}>
                پرسش‌های متداول
              </h2>
              <p className={styles.sectionSubtitle}>
                پاسخ به سوالات رایج درباره کارکرد و تاثیر پارس‌نوشت
              </p>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem} open>
                <summary className={styles.faqQuestion}>
                  <span>چرا باید کاف و ی عربی در متن‌های فارسی اصلاح شوند؟</span>
                </summary>
                <p className={styles.faqAnswer}>
                  حروف «ك» و «ي» در الفبای عربی کد یونیکد متفاوتی با «ک» و «ی» در زبان فارسی دارند. اگر در متون وب یا پایگاه داده از حروف عربی استفاده شود، کاربران هنگام جستجوی کلمات فارسی به نتیجه نخواهند رسید که این موضوع تاثیر منفی مستقیمی بر سئو و رتبه‌بندی سایت‌ها دارد.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  <span>آیا تبدیل اعداد انگلیسی و عربی به فارسی در سئو اثر دارد؟</span>
                </summary>
                <p className={styles.faqAnswer}>
                  بله، یکدست بودن نویسه‌های اعداد در متن‌های فارسی موجب بهبود خوانایی، انطباق با معیارهای استاندارد نگارش فارسی و تجربه کاربری بهتر می‌شود.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  <span>آیا متن وارد شده در پارس‌نوشت به سرور ارسال می‌شود؟</span>
                </summary>
                <p className={styles.faqAnswer}>
                  خیر، کلیه مراحل تبدیل و اصلاح متن‌ها به طور کامل در مرورگر شما انجام می‌شود و هیچ متنی به هیچ سروری ارسال یا ذخیره نمی‌شود.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  <span>ممیز اعشار فارسی چه تفاوتی با نقطه یا اسلش دارد؟</span>
                </summary>
                <p className={styles.faqAnswer}>
                  در زبان فارسی نویسه استاندارد اعشار علامت ممیز فارسی (٫) است که با نقطه و اسلش انگلیسی تفاوت دارد. استفاده از ممیز استاندارد از خوانده شدن اشتباه اعداد و تاریخ‌ها جلوگیری می‌کند.
                </p>
              </details>
            </div>
          </section>
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

      <Modal
        title="درباره پارس‌نوشت"
        open={aboutOpen}
        onCancel={() => setAboutOpen(false)}
        footer={null}
        centered
      >
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
      </Modal>
    </Layout>
  )
}