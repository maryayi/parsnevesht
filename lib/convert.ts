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

// رقم انگلیسی، عربی یا فارسی
const DIGIT = /[0-9٠-٩۰-۹]/
// نویسهٔ واژهٔ لاتین (حرف، رقم یا _)
const LATIN_WORD_CHAR = /[A-Za-z0-9_]/

function convertPunctuationSpace(input: string): [string, number] {
  const beforePunctuation = /([\wا-ی۰-۹\)\]\}]+)[^\S\r\n]+([\.\؟\!\?])/g
  const afterPunctuation = /([\.\؟\!\?])([^\S\r\n]{0}|[^\S\r\n]{2,})([\wا-ی۰-۹]+)/g

  let stat = 0

  stat += countMatches(input, beforePunctuation)
  let output = input.replace(beforePunctuation, '$1$2')

  output = output.replace(
    afterPunctuation,
    (match: string, mark: string, space: string, word: string, offset: number, text: string): string => {
      // نقطهٔ چسبیده میان دو رقم (ممیز اعشار، مثل 12.5 وقتی تبدیل اعداد خاموش است) یا میان دو نویسهٔ
      // لاتین (دامنه، ایمیل یا نام فایل، مثل example.com، info@site.ir یا Node.js) پایان جمله نیست.
      const previous = text.charAt(offset - 1)
      const next = word.charAt(0)
      const isDotInsideToken =
        mark === '.' &&
        space === '' &&
        ((DIGIT.test(previous) && DIGIT.test(next)) ||
          (LATIN_WORD_CHAR.test(previous) && LATIN_WORD_CHAR.test(next)))

      if (isDotInsideToken) {
        return match
      }

      stat += 1
      return `${mark} ${word}`
    },
  )

  return [output, stat]
}

// نشانی وب (با http/https/ftp یا www) یا ایمیل
const URL_OR_EMAIL =
  /\b(?:(?:https?|ftp):\/\/|www\.)[^\s<>"«»]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/gi
const URL_TRAILING_PUNCTUATION = '.,:;!?؟،؛\'"'
const URL_CLOSING_BRACKETS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

// جانگهدار با «x» باز و بسته می‌شود تا قاعده‌های فاصله‌گذاری آن را یک واژهٔ لاتین ببینند؛ شماره‌اش
// با نویسه‌های «ناحیهٔ کاربرد خصوصی» یونیکد نوشته می‌شود که هیچ قاعده‌ای به آن‌ها دست نمی‌زند.
const PLACEHOLDER = /x\uE000([\uE010-\uE019]+)\uE001x/g
const PLACEHOLDER_DIGIT_BASE = 0xe010

function countChar(input: string, char: string): number {
  return input.split(char).length - 1
}

// علامت‌های پایانی (نقطه، ویرگول، پرانتز بسته‌ای که درون نشانی باز نشده و ...) جزو نشانی نیستند.
function trimUrl(url: string): string {
  let end = url.length

  while (end > 0) {
    const last = url[end - 1]
    const opening = URL_CLOSING_BRACKETS[last]
    const candidate = url.slice(0, end)

    if (
      URL_TRAILING_PUNCTUATION.includes(last) ||
      (opening !== undefined && countChar(candidate, opening) < countChar(candidate, last))
    ) {
      end -= 1
    } else {
      break
    }
  }

  return url.slice(0, end)
}

function encodePlaceholder(index: number): string {
  const digits = String(index)
    .split('')
    .map((digit) => String.fromCharCode(PLACEHOLDER_DIGIT_BASE + Number(digit)))
    .join('')

  return `x\uE000${digits}\uE001x`
}

function decodePlaceholder(digits: string): number {
  return Number(
    digits
      .split('')
      .map((digit) => digit.charCodeAt(0) - PLACEHOLDER_DIGIT_BASE)
      .join(''),
  )
}

// نشانی‌های وب و ایمیل پیش از اجرای قاعده‌ها کنار گذاشته می‌شوند تا هیچ قاعده‌ای (تبدیل اعداد،
// فاصله‌گذاری پرانتز و علامت‌ها و ...) آن‌ها را خراب نکند، و در پایان بی‌تغییر برمی‌گردند.
function protectUrls(input: string): [string, (text: string) => string] {
  const urls: string[] = []

  const output = input.replace(URL_OR_EMAIL, (match: string): string => {
    const url = trimUrl(match)
    urls.push(url)
    return encodePlaceholder(urls.length - 1) + match.slice(url.length)
  })

  const restore = (text: string): string =>
    text.replace(PLACEHOLDER, (match: string, digits: string): string => urls[decodePlaceholder(digits)] ?? match)

  return [output, restore]
}

export function convertText(input: string, options: ConvertOptions): ConvertResult {
  const [protectedInput, restoreUrls] = protectUrls(input)
  let text = protectedInput
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

  return { output: restoreUrls(text), stats, total }
}
