export type OptionKey =
  | 'ka'
  | 'ya'
  | 'heh'
  | 'momayez'
  | 'arabicNumber'
  | 'englishNumber'
  | 'prantez'
  | 'alamat'

export interface ConvertOption {
  key: OptionKey
  label: string
}

export type ConvertOptions = Record<OptionKey, boolean>

export interface ConvertStat {
  key: OptionKey
  label: string
  count: number
}

export interface ConvertResult {
  output: string
  stats: ConvertStat[]
  total: number
}

export const CONVERT_OPTIONS: ConvertOption[] = [
  {
    key: 'ka',
    label: 'تبدیل شکل‌های «کاف» (ك، ڪ، ﻙ، ﻚ) به «ک» فارسی',
  },
  {
    key: 'ya',
    label: 'تبدیل شکل‌های «ی» (ي، ى، ے، ۍ، ې) به «ی» فارسی',
  },
  {
    key: 'heh',
    label: 'تبدیل شکل‌های «ه» (ہ، ە، ھ) به «ه» فارسی',
  },
  { key: 'momayez', label: 'اصلاح ممیز اعشار فارسی' },
  { key: 'arabicNumber', label: 'تبدیل اعداد عربی به فارسی' },
  { key: 'englishNumber', label: 'تبدیل اعداد انگلیسی به فارسی' },
  { key: 'prantez', label: 'تنظیم میله‌فاصله اطراف پرانتز، آکولاد و کروشه' },
  { key: 'alamat', label: 'تنظیم میله‌فاصله اطراف علامت انتهای جمله (نقطه، سوال و تعجب)' },
]

export const DEFAULT_OPTIONS: ConvertOptions = {
  ka: true,
  ya: true,
  heh: true,
  momayez: true,
  arabicNumber: true,
  englishNumber: true,
  prantez: true,
  alamat: true,
}

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const ENGLISH_DIGITS = '0123456789'

const REPORT_LABELS: Record<OptionKey, string> = {
  ka: 'عدد جایگزینی «کاف»',
  ya: 'عدد جایگزینی «ی»',
  heh: 'عدد جایگزینی «ه»',
  momayez: 'عدد جایگزینی ممیز اعشار',
  arabicNumber: 'عدد جایگزینی اعداد عربی',
  englishNumber: 'عدد جایگزینی اعداد انگلیسی',
  prantez: 'عدد اصلاح فاصله پرانتز/کروشه/آکولاد',
  alamat: 'عدد اصلاح فاصله علامت آخر جمله',
}

function countMatches(input: string, regex: RegExp): number {
  const matches = input.match(regex)
  return matches ? matches.length : 0
}

function replaceDigits(input: string, from: string, to: string): [string, number] {
  let output = input
  let stat = 0

  for (let index = 0; index < from.length; index += 1) {
    const regex = new RegExp(from[index], 'g')
    stat += countMatches(output, regex)
    output = output.replace(regex, to[index])
  }

  return [output, stat]
}

function replaceVariants(input: string, variants: Record<string, string>): [string, number] {
  let output = input
  let stat = 0

  for (const [from, to] of Object.entries(variants)) {
    const regex = new RegExp(from, 'g')
    stat += countMatches(output, regex)
    output = output.replace(regex, to)
  }

  return [output, stat]
}

// هر گروه، تمام نویسه‌های هم‌خانواده (عربی، اردو، پشتو، اویغوری و کردی) را
// یک‌جا به نویسه استاندارد فارسی تبدیل می‌کند تا در تنظیمات یک گزینه واحد باشد.
const KA_VARIANTS: Record<string, string> = {
  'ك': 'ک', // عربی
  'ڪ': 'ک', // اردو / سندی
  'ﻙ': 'ک', // پشتو (شکل نمایشی)
  'ﻚ': 'ک', // اویغوری (شکل نمایشی)
}

const YA_VARIANTS: Record<string, string> = {
  'ي': 'ی', // عربی
  'ى': 'ی', // عربی (ألف مقصوره) / اردو
  'ے': 'ی', // اردو
  'ۍ': 'ی', // پشتو
  'ې': 'ی', // اویغوری
}

const HEH_VARIANTS: Record<string, string> = {
  'ہ': 'ه', // اردو
  'ە': 'ه\u200c', // کردی
  'ھ': 'ه', // کردی
}

function convertKa(input: string): [string, number] {
  return replaceVariants(input, KA_VARIANTS)
}

function convertYa(input: string): [string, number] {
  return replaceVariants(input, YA_VARIANTS)
}

function convertHeh(input: string): [string, number] {
  return replaceVariants(input, HEH_VARIANTS)
}

// الگوی واحد با اولویت «تاریخ» (سه گروه رقمی) بر «ممیز اعشار» (دو گروه رقمی)؛
// گروه اول هر تطبیق نشان می‌دهد کدام شاخهٔ الگو مطابقت کرده است.
const DATE_OR_DECIMAL =
  /([۰۱۲۳۴۵۶۷۸۹]+)([\.\/٫])([۰۱۲۳۴۵۶۷۸۹]+)([\.\/٫])([۰۱۲۳۴۵۶۷۸۹]+)|([۰۱۲۳۴۵۶۷۸۹]+)([\.\/])([۰۱۲۳۴۵۶۷۸۹]+)/g

function applyDecimalSeparator(input: string): [string, number] {
  let stat = 0

  const output = input.replace(
    DATE_OR_DECIMAL,
    (...groups: Array<string | undefined>): string => {
      const year = groups[1]
      const month = groups[3]
      const day = groups[5]

      if (year !== undefined) {
        return `${year}/${month}/${day}`
      }

      stat += 1
      return `${groups[6]}٫${groups[8]}`
    },
  )

  return [output, stat]
}

function convertArabicNumbers(input: string): [string, number] {
  const [converted, digitStat] = replaceDigits(input, ARABIC_INDIC_DIGITS, PERSIAN_DIGITS)
  const [output, decimalStat] = applyDecimalSeparator(converted)
  return [output, digitStat + decimalStat]
}

// یک توکن لاتین (حروف، رقم و _ که می‌توانند با «.» یا «-» به هم وصل شوند)؛
// اگر حرف لاتین داشته باشد (مثل html2، mp3، v1.2.3 یا COVID-19) ارقامش دست نمی‌خورد.
const LATIN_TOKEN = /[A-Za-z0-9_]+(?:[.\-][A-Za-z0-9_]+)*/g
const LATIN_LETTER = /[A-Za-z]/

function convertEnglishNumbers(input: string): [string, number] {
  let digitStat = 0

  const converted = input.replace(LATIN_TOKEN, (token: string): string => {
    if (LATIN_LETTER.test(token)) {
      return token
    }

    const [output, stat] = replaceDigits(token, ENGLISH_DIGITS, PERSIAN_DIGITS)
    digitStat += stat
    return output
  })

  const [output, decimalStat] = applyDecimalSeparator(converted)
  return [output, digitStat + decimalStat]
}

function convertParenthesisSpace(input: string): [string, number] {
  const beforeOpening = /([\wا-ی۰-۹]+)([^\S\r\n]{0}|[^\S\r\n]{2,})([\(\[\{])/g
  const afterOpening = /([\(\[\{])[^\S\r\n]+/g
  const beforeClosing = /[^\S\r\n]+([\)\]\}])/g
  const afterClosing = /([\)\]\}])([^\S\r\n]{0}|[^\S\r\n]{2,})([\wا-ی۰-۹]+)/g

  let stat = 0

  stat += countMatches(input, beforeOpening)
  let output = input.replace(beforeOpening, '$1 $3')

  stat += countMatches(output, afterOpening)
  output = output.replace(afterOpening, '$1')

  stat += countMatches(output, beforeClosing)
  output = output.replace(beforeClosing, '$1')

  stat += countMatches(output, afterClosing)
  output = output.replace(afterClosing, '$1 $3')

  return [output, stat]
}

function convertPunctuationSpace(input: string): [string, number] {
  const beforePunctuation = /([\wا-ی۰-۹\)\]\}]+)[^\S\r\n]+([\.\؟\!\?])/g
  const afterPunctuation = /([\.\؟\!\?])([^\S\r\n]{0}|[^\S\r\n]{2,})([\wا-ی۰-۹]+)/g

  let stat = 0

  stat += countMatches(input, beforePunctuation)
  let output = input.replace(beforePunctuation, '$1$2')

  stat += countMatches(output, afterPunctuation)
  output = output.replace(afterPunctuation, '$1 $3')

  return [output, stat]
}

export function convertText(input: string, options: ConvertOptions): ConvertResult {
  let text = input
  let total = 0
  const stats: ConvertStat[] = []

  const run = (key: OptionKey, convert: (value: string) => [string, number]) => {
    if (!options[key]) {
      return
    }

    const [output, count] = convert(text)
    text = output
    total += count

    if (count > 0) {
      stats.push({ key, label: REPORT_LABELS[key], count })
    }
  }

  run('ka', convertKa)
  run('ya', convertYa)
  run('heh', convertHeh)
  run('momayez', applyDecimalSeparator)
  run('arabicNumber', convertArabicNumbers)
  run('englishNumber', convertEnglishNumbers)
  run('prantez', convertParenthesisSpace)
  run('alamat', convertPunctuationSpace)

  return { output: text, stats, total }
}
