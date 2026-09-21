export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://parsnevesht.ir/#webapp',
      name: 'پارس‌نوشت',
      alternateName: ['Parsnevesht', 'پارس نوشت'],
      url: 'https://parsnevesht.ir',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      inLanguage: 'fa',
      description:
        'ابزار آنلاین و رایگان برای اصلاح سریع غلط‌های متداول متن‌های فارسی: تبدیل کاف و ی عربی به فارسی، تبدیل اعداد انگلیسی و عربی به فارسی، اصلاح ممیز اعشار و تنظیم فاصله‌گذاری.',
      image: 'https://parsnevesht.ir/og-image.png',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IRR',
      },
      author: {
        '@type': 'Person',
        name: 'مهدی آریایی',
        url: 'https://x.com/maryayi',
      },
      featureList: [
        'تبدیل کاف عربی (ك) به فارسی (ک)',
        'تبدیل ی عربی (ي) به فارسی (ی)',
        'اصلاح ممیز اعشار فارسی (٫)',
        'تبدیل اعداد عربی به فارسی',
        'تبدیل اعداد انگلیسی به فارسی',
        'تنظیم فاصله اطراف پرانتز، آکولاد و کروشه',
        'تنظیم فاصله اطراف علامت انتهای جمله',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://parsnevesht.ir/#website',
      url: 'https://parsnevesht.ir',
      name: 'پارس‌نوشت',
      description: 'رفع سریع غلط‌های متداول نوشته‌های فارسی',
      inLanguage: 'fa',
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://parsnevesht.ir/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'چرا باید کاف و ی عربی در متن‌های فارسی اصلاح شوند؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'حروف «ك» و «ي» در الفبای عربی کد یونیکد متفاوتی با «ک» و «ی» در زبان فارسی دارند. اگر در متون وب یا پایگاه داده از حروف عربی استفاده شود، کاربران هنگام جستجوی کلمات فارسی به نتیجه نخواهند رسید که این موضوع تاثیر منفی مستقیمی بر سئو و رتبه‌بندی سایت‌ها دارد.',
          },
        },
        {
          '@type': 'Question',
          name: 'آیا تبدیل اعداد انگلیسی و عربی به فارسی در سئو اثر دارد؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'بله، یکدست بودن نویسه‌های اعداد در متن‌های فارسی موجب بهبود خوانایی، انطباق با معیارهای استاندارد نگارش فارسی و تجربه کاربری بهتر می‌شود.',
          },
        },
        {
          '@type': 'Question',
          name: 'آیا متن وارد شده در پارس‌نوشت به سرور ارسال می‌شود؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'خیر، کلیه مراحل تبدیل و اصلاح متن‌ها به طور کامل در مرورگر شما انجام می‌شود و هیچ متنی به هیچ سروری ارسال یا ذخیره نمی‌شود.',
          },
        },
        {
          '@type': 'Question',
          name: 'ممیز اعشار فارسی چه تفاوتی با نقطه یا اسلش دارد؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'در زبان فارسی نویسه استاندارد اعشار علامت ممیز فارسی (٫) است که با نقطه و اسلش انگلیسی تفاوت دارد. استفاده از ممیز استاندارد از خوانده شدن اشتباه اعداد و تاریخ‌ها جلوگیری می‌کند.',
          },
        },
      ],
    },
  ],
}
