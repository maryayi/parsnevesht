<p align="center">
  <a href="https://parsnevesht.ir">
    <img src="public/icon.svg" width="96" height="96" alt="Parsnevesht Logo" />
  </a>
</p>

<h1 align="center">پارس‌نوشت | Parsnevesht</h1>

<p align="center">
  <strong>A modern, fast, and privacy-first web tool for correcting common Persian typography and orthography errors.</strong><br>
  ابزار مدرن، سریع و امن برای استانداردسازی و اصلاح غلط‌های متداول نگارشی در خط و زبان فارسی
</p>

<p align="center">
  <a href="https://parsnevesht.ir"><img src="https://img.shields.io/badge/Website-parsnevesht.ir-0070f3?style=flat&logo=googlechrome&logoColor=white" alt="Website" /></a>
  <a href="https://github.com/maryayi/parsnevesht/actions/workflows/deploy.yml"><img src="https://img.shields.io/badge/Deploy-GitHub%20Pages-24292e?style=flat&logo=githubactions&logoColor=white" alt="Deployment" /></a>
  <img src="https://img.shields.io/badge/version-0.3.3-blue.svg" alt="Version 0.3.3" />
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-GPLv3-green.svg" alt="License GPL-3.0" />
</p>

---

## 🌐 Live Application

- **Primary Domain:** [https://parsnevesht.ir](https://parsnevesht.ir)
- **GitHub Pages Mirror:** [https://maryayi.github.io/parsnevesht](https://maryayi.github.io/parsnevesht)

---

## ✨ Features

- **Arabic to Persian Character Normalization**
  - Converts Arabic «ك» (`U+0643`) to Persian «ک» (`U+06A9`).
  - Converts Arabic «ي» (`U+064A`) to Persian «ی» (`U+06CC`).
  - *Crucial for search engines (SEO) and database lookups, ensuring words are discoverable by Persian queries.*

- **Comprehensive Digits Conversion**
  - Converts ASCII Latin digits (`0-9`) to Persian digits (`۰-۹`).
  - Converts Eastern Arabic-Indic digits (`٠-٩`) to Persian digits (`۰-۹`).

- **Smart Persian Decimal Separator**
  - Transforms decimal dots and slashes between digits to the standard Persian decimal separator Momayez («٫» `U+066B`).
  - **Date Preservation:** Intelligently preserves date formatting (e.g. `۱۴۰۳/۰۶/۳۱`) to prevent unintended alteration of dates.

- **Punctuation & Spacing Correction**
  - Cleans up spaces inside parentheses, brackets, and braces (`( )`, `[ ]`, `{ }`) while ensuring a space exists outside.
  - Fixes spaces around end-of-sentence punctuation (`.`, `؟`, `!`, `?`), eliminating gaps before the symbol and adding a space after it.

- **User Experience & Performance**
  - **Collapsible Settings:** Customize which conversion rules to apply.
  - **Live Replacement Metrics:** Displays an itemized breakdown of replacements made.
  - **Instant One-Click Copy & Reset:** Quick copy with visual feedback and confirmation prompts.
  - **100% Client-Side & Private:** All text processing happens strictly within your browser. No text is ever stored or transmitted to external servers.
  - **PWA & SEO Ready:** Responsive layout, Web App Manifest, OpenGraph & Twitter Cards, JSON-LD Schema (`WebApplication`, `FAQPage`), and accessibility landmarks.

---

## 🔍 Examples

| Original Input | Corrected Output | Correction Rule |
| :--- | :--- | :--- |
| `كتاب ياقوت` | `کتاب یاقوت` | Arabic ك/ي → Persian ک/ی |
| `شماره تماس: 09120000000` | `شماره تماس: ۰۹۱۲۰۰۰۰۰۰۰` | English digits → Persian digits |
| `رقم: 12.5 و تاریخ: 1403/06/31` | `رقم: ۱۲٫۵ و تاریخ: ۱۴۰۳/۰۶/۳۱` | Persian decimal Momayez (preserving dates) |
| `پارس‌نوشت ( ویرایشگر متن ) .` | `پارس‌نوشت (ویرایشگر متن).` | Parentheses and punctuation spacing |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, fully static export via `output: 'export'`)
- **UI Library:** [React 19](https://react.dev/) & [Ant Design 6](https://ant.design/)
- **Icons & Theme:** [@ant-design/icons](https://ant.design/components/icon) & [@ant-design/nextjs-registry](https://github.com/ant-design/ant-design-nextjs-registry)
- **Languages & Styles:** TypeScript 5.9, Sass, CSS Modules
- **CI / CD:** GitHub Actions with automated deployment to GitHub Pages

---

## 📂 Project Structure

```text
parsnevesht/
├── app/
│   ├── layout.tsx         # Root layout with SEO meta, OpenGraph, and JSON-LD schema
│   ├── not-found.tsx      # Custom 404 page
│   ├── page.tsx           # Interactive editor, collapsible options, metrics, and FAQs
│   └── providers.tsx      # Ant Design config provider with Persian locale / theme
├── lib/
│   ├── convert.ts         # Core regex conversion rules and text normalization engine
│   └── seo.ts             # Schema.org JSON-LD data (WebApplication, WebSite, FAQPage)
├── public/
│   ├── apple-icon.png     # Apple Touch icon
│   ├── icon.svg           # Vector application logo
│   ├── manifest.webmanifest
│   ├── robots.txt
│   └── sitemap.xml
├── styles/
│   ├── globals.css        # Global CSS variables, fonts, and reset rules
│   └── Home.module.css    # Scoped styles for the editor and landing page
└── next.config.js         # Next.js static export & build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `20.x` or later
- pnpm `12.x`

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/maryayi/parsnevesht.git
cd parsnevesht
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Build

Generate the static export files into the `out/` directory:

```bash
pnpm build
```

To preview the production build locally:

```bash
pnpm start
```

### Linting

Run ESLint to check for code quality and style compliance:

```bash
pnpm lint
```

---

## 👤 Author

**Mahdi Aryayi**
- Website: [https://aryayi.dev](https://aryayi.dev)
- X / Twitter: [@maryayi](https://x.com/maryayi)
- GitHub: [@maryayi](https://github.com/maryayi)

---

## 📄 License

This project is open-source software licensed under the [GNU General Public License v3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl-3.0.html).
