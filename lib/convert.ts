export type OptionKey =
  | 'ka'
  | 'ya'
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
  { key: 'ka', label: 'تبدیل «کاف» عربی (ك) به فارسی (ک)' },
  { key: 'ya', label: 'تبدیل «ی» عربی (ي) به فارسی (ی)' },
  { key: 'momayez', label: 'اصلاح ممیز اعشار فارسی' },
  { key: 'arabicNumber', label: 'تبدیل اعداد عربی به فارسی' },
  { key: 'englishNumber', label: 'تبدیل اعداد انگلیسی به فارسی' },
  { key: 'prantez', label: 'تنظیم میله‌فاصله اطراف پرانتز، آکولاد و کروشه' },
  { key: 'alamat', label: 'تنظیم میله‌فاصله اطراف علامت انتهای جمله (نقطه، سوال و تعجب)' },
]

export const DEFAULT_OPTIONS: ConvertOptions = {
  ka: true,
  ya: true,
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

function convertKa(input: string): [string, number] {
  const regex = /ك/g
  return [input.replace(regex, 'ک'), countMatches(input, regex)]
}

function convertYa(input: string): [string, number] {
  const regex = /ي/g
  return [input.replace(regex, 'ی'), countMatches(input, regex)]
}

function applyDecimalSeparator(input: string): [string, number] {
  const decimalRegex = /([۰۱۲۳۴۵۶۷۸۹]+)([\.\/])([۰۱۲۳۴۵۶۷۸۹]+)/g
  const dateFixRegex = /([۰۱۲۳۴۵۶۷۸۹]+)٫([۰۱۲۳۴۵۶۷۸۹]+)\/([۰۱۲۳۴۵۶۷۸۹]+)/g

  let stat = countMatches(input, decimalRegex)
  let output = input.replace(decimalRegex, '$1٫$3')

  stat -= countMatches(output, dateFixRegex)
  output = output.replace(dateFixRegex, '$1/$2/$3')

  return [output, stat]
}

function convertArabicNumbers(input: string): [string, number] {
  const [converted, digitStat] = replaceDigits(input, ARABIC_INDIC_DIGITS, PERSIAN_DIGITS)
  const [output, decimalStat] = applyDecimalSeparator(converted)
  return [output, digitStat + decimalStat]
}

function convertEnglishNumbers(input: string): [string, number] {
  const [converted, digitStat] = replaceDigits(input, ENGLISH_DIGITS, PERSIAN_DIGITS)
  const [output, decimalStat] = applyDecimalSeparator(converted)
  return [output, digitStat + decimalStat]
}

function convertParenthesisSpace(input: string): [string, number] {
  const beforeOpening = /([\wا-ی]+)(\s{0}|\s{2,})([\(\[\{])/g
  const afterOpening = /([\(\[\{])\s+/g
  const beforeClosing = /\s+([\)\]\}])/g
  const afterClosing = /([\)\]\}])(\s{0}|\s{2,})([\wا-ی]+)/g

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
  const beforePunctuation = /([\wا-ی]+)\s+([\.\؟\!\?])/g
  const afterPunctuation = /([\.\؟\!\?])(\s{0}|\s{2,})([\wا-ی]+)/g

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
  run('momayez', applyDecimalSeparator)
  run('arabicNumber', convertArabicNumbers)
  run('englishNumber', convertEnglishNumbers)
  run('prantez', convertParenthesisSpace)
  run('alamat', convertPunctuationSpace)

  return { output: text, stats, total }
}
