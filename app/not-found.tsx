import { Button, Result } from 'antd'

export default function NotFound() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '80vh',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        direction: 'rtl',
      }}
    >
      <Result
        status="404"
        title="۴۰۴"
        subTitle="صفحه مورد نظر شما یافت نشد."
        extra={
          <Button type="primary" href="/">
            بازگشت به صفحه اصلی
          </Button>
        }
      />
    </main>
  )
}
