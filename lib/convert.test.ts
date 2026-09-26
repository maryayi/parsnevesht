import {
  CONVERT_OPTIONS,
  DEFAULT_OPTIONS,
  convertText,
  type ConvertOptions,
  type ConvertResult,
  type OptionKey,
} from './convert'

/** Every option enabled. */
const ALL: ConvertOptions = { ...DEFAULT_OPTIONS }

/** Every option disabled. */
const NONE: ConvertOptions = {
  ka: false,
  ya: false,
  heh: false,
  momayez: false,
  arabicNumber: false,
  englishNumber: false,
  prantez: false,
  alamat: false,
}

/** Build an options object with only the listed rules enabled. */
function only(...keys: OptionKey[]): ConvertOptions {
  const options = {} as ConvertOptions
  for (const { key } of CONVERT_OPTIONS) {
    options[key] = keys.includes(key)
  }
  return options
}

function run(input: string, options: ConvertOptions = ALL): ConvertResult {
  return convertText(input, options)
}

/** Convenience: just the converted string. */
function out(input: string, options: ConvertOptions = ALL): string {
  return run(input, options).output
}

/** Convenience: just the reported total. */
function total(input: string, options: ConvertOptions = ALL): number {
  return run(input, options).total
}

function statFor(
  result: ConvertResult,
  key: OptionKey,
): number | undefined {
  return result.stats.find((stat) => stat.key === key)?.count
}

describe('convert module exports', () => {
  it('exposes the 8 options in a stable order', () => {
    expect(CONVERT_OPTIONS.map((option) => option.key)).toEqual([
      'ka',
      'ya',
      'heh',
      'momayez',
      'arabicNumber',
      'englishNumber',
      'prantez',
      'alamat',
    ])
  })

  it('has unique keys and non-empty Persian labels', () => {
    const keys = CONVERT_OPTIONS.map((option) => option.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const option of CONVERT_OPTIONS) {
      expect(typeof option.label).toBe('string')
      expect(option.label.length).toBeGreaterThan(0)
    }
  })

  it('enables every rule by default', () => {
    expect(Object.keys(DEFAULT_OPTIONS).sort()).toEqual(
      CONVERT_OPTIONS.map((option) => option.key).sort(),
    )
    expect(Object.values(DEFAULT_OPTIONS).every(Boolean)).toBe(true)
  })
})

describe('convertText — result shape and general behaviour', () => {
  it('returns an empty result for an empty string', () => {
    expect(run('', ALL)).toEqual({ output: '', stats: [], total: 0 })
  })

  it('leaves text untouched and reports zero when everything is disabled', () => {
    const input = 'كتاب ياقوت 12.5 ( خوب ) ؟'
    const result = run(input, NONE)
    expect(result.output).toBe(input)
    expect(result.stats).toEqual([])
    expect(result.total).toBe(0)
  })

  it('only enables the rules that are switched on', () => {
    // Only the "ka" family should change; digits/spacing stay as-is.
    expect(out('كتاب 12.5', only('ka'))).toBe('کتاب 12.5')
    // Only English digits should change.
    expect(out('كتاب 12.5', only('englishNumber'))).toBe('كتاب ۱۲٫۵')
  })

  it('does not report stats for rules that made no replacement', () => {
    const result = run('سلام دنیا', ALL)
    expect(result.stats).toEqual([])
    expect(result.total).toBe(0)
  })

  it('makes total the sum of every reported stat', () => {
    const result = run('كتاب ۱۲.۵ سلام .', ALL)
    const sum = result.stats.reduce((acc, stat) => acc + stat.count, 0)
    expect(result.total).toBe(sum)
    expect(sum).toBe(3)
  })

  it('reports stats in pipeline order and labels them in Persian', () => {
    const result = run('كتاب ۱۲.۵ سلام .', ALL)
    expect(result.stats).toEqual([
      { key: 'ka', label: 'عدد جایگزینی «کاف»', count: 1 },
      { key: 'momayez', label: 'عدد جایگزینی ممیز اعشار', count: 1 },
      { key: 'alamat', label: 'عدد اصلاح فاصله علامت آخر جمله', count: 1 },
    ])
  })

  it('is idempotent on already-canonical text', () => {
    for (const canonical of [
      'کتاب یاقوت',
      'شماره تماس: ۰۹۱۲۰۰۰۰۰۰۰',
      'رقم: ۱۲٫۵ و تاریخ: ۱۴۰۳/۰۶/۳۱',
      'پارس‌نوشت (ویرایشگر متن).',
      'سلام. خوبی',
    ]) {
      const second = run(canonical, ALL)
      expect(second.output).toBe(canonical)
      expect(second.total).toBe(0)
    }
  })
})

describe('ka family — Arabic/Urdu/Pashtu/Uyghur forms of «ک»', () => {
  const cases: Array<[string, string]> = [
    ['\u0643', 'ک'], // Arabic kaf
    ['\u06AA', 'ک'], // Urdu/Sindhi
    ['\uFED9', 'ک'], // Pashtu presentation form
    ['\uFEDA', 'ک'], // Uyghur presentation form
  ]

  it.each(cases)('converts %j to Persian «ک»', (from, to) => {
    expect(out(from, only('ka'))).toBe(to)
  })

  it('converts every variant in a single word and counts each', () => {
    const result = run('\u0643 \u06AA \uFED9 \uFEDA', only('ka'))
    expect(result.output).toBe('ک ک ک ک')
    expect(result.total).toBe(4)
    expect(statFor(result, 'ka')).toBe(4)
  })

  it('reports ka only, and not when disabled', () => {
    const result = run('\u0643', ALL)
    expect(statFor(result, 'ka')).toBe(1)
    expect(out('\u0643', NONE)).toBe('\u0643')
  })

  it('does not touch an already-Persian «ک»', () => {
    expect(out('کتاب', only('ka'))).toBe('کتاب')
    expect(total('کتاب', only('ka'))).toBe(0)
  })
})

describe('ya family — Arabic/Urdu/Pashtu/Uyghur forms of «ی»', () => {
  const cases: Array<[string, string]> = [
    ['\u064A', 'ی'], // Arabic yeh
    ['\u0649', 'ی'], // Arabic alef maksura / Urdu
    ['\u06D2', 'ی'], // Urdu yeh barree
    ['\u06CD', 'ی'], // Pashtu yeh
    ['\u06D0', 'ی'], // Uyghur yeh
  ]

  it.each(cases)('converts %j to Persian «ی»', (from, to) => {
    expect(out(from, only('ya'))).toBe(to)
  })

  it('converts every variant and counts each', () => {
    const result = run('\u064A \u0649 \u06D2 \u06CD \u06D0', only('ya'))
    expect(result.output).toBe('ی ی ی ی ی')
    expect(result.total).toBe(5)
    expect(statFor(result, 'ya')).toBe(5)
  })

  it('does not touch an already-Persian «ی»', () => {
    expect(total('ایران', only('ya'))).toBe(0)
  })
})

describe('heh family — Urdu/Kurdish forms of «ه»', () => {
  it('converts Urdu heh to Persian «ه»', () => {
    expect(out('\u06C1', only('heh'))).toBe('ه')
  })

  it('converts Kurdish «ھ» to Persian «ه»', () => {
    expect(out('\u06BE', only('heh'))).toBe('ه')
  })

  it('converts Kurdish «ە» to «ه» followed by a ZWNJ', () => {
    expect(out('\u06D5', only('heh'))).toBe('ه\u200C')
  })

  it('converts all three variants and counts each', () => {
    const result = run('\u06C1 \u06D5 \u06BE', only('heh'))
    expect(result.output).toBe('ه ه\u200C ه')
    expect(result.total).toBe(3)
    expect(statFor(result, 'heh')).toBe(3)
  })
})

describe('momayez — Persian decimal separator', () => {
  it('turns a dot between Persian digits into «٫»', () => {
    expect(out('۱۲.۵', only('momayez'))).toBe('۱۲٫۵')
    expect(total('۱۲.۵', only('momayez'))).toBe(1)
  })

  it('turns a slash between Persian digits into «٫»', () => {
    expect(out('۱۲/۵', only('momayez'))).toBe('۱۲٫۵')
  })

  it('preserves a three-part date (digits/digits/digits)', () => {
    expect(out('۱۴۰۳/۰۶/۳۱', only('momayez'))).toBe('۱۴۰۳/۰۶/۳۱')
    expect(total('۱۴۰۳/۰۶/۳۱', only('momayez'))).toBe(0)
  })

  it('preserves a dotted date-like triplet', () => {
    expect(out('۱۴۰۳.۰۶.۳۱', only('momayez'))).toBe('۱۴۰۳٫۰۶.۳۱')
  })

  it('converts the first pair of a four-part slash chain and restores the matched date', () => {
    // «۱/۲» -> «۱٫۲» and «۳/۴» -> «۳٫۴», then the date-fix rule
    // restores the «۱٫۲/۳» slice back to «۱/۲/۳».
    expect(out('۱/۲/۳/۴', only('momayez'))).toBe('۱/۲/۳٫۴')
    expect(total('۱/۲/۳/۴', only('momayez'))).toBe(1)
  })

  it('does not convert a leading or trailing dot with no digits on both sides', () => {
    expect(out('.۵', only('momayez'))).toBe('.۵')
    expect(out('۵.', only('momayez'))).toBe('۵.')
    expect(total('.۵', only('momayez'))).toBe(0)
    expect(total('۵.', only('momayez'))).toBe(0)
  })

  it('ignores a comma between digits', () => {
    expect(out('۵,۵', only('momayez'))).toBe('۵,۵')
    expect(total('۵,۵', only('momayez'))).toBe(0)
  })

  it('converts already-present momayez combined with a slash', () => {
    // «۱۲٫۵/۶»: the slash/۶ pair becomes another momayez.
    expect(out('۱۲٫۵/۶', only('momayez'))).toBe('۱۲٫۵٫۶')
  })

  it('converts multiple separate decimals in one string', () => {
    expect(out('۱.۲ و ۳.۴', only('momayez'))).toBe('۱٫۲ و ۳٫۴')
    expect(total('۱.۲ و ۳.۴', only('momayez'))).toBe(2)
  })
})

describe('arabicNumber — Eastern Arabic-Indic digits to Persian', () => {
  it('maps every Arabic-Indic digit to its Persian counterpart', () => {
    expect(out('٠١٢٣٤٥٦٧٨٩', only('arabicNumber'))).toBe('۰۱۲۳۴۵۶۷۸۹')
    expect(total('٠١٢٣٤٥٦٧٨٩', only('arabicNumber'))).toBe(10)
  })

  it('converts an Arabic-Indic decimal to momayez', () => {
    const result = run('٠.٥', only('arabicNumber'))
    expect(result.output).toBe('۰٫۵')
    // 2 digits + 1 decimal separator.
    expect(result.total).toBe(3)
  })

  it('preserves an Arabic-Indic date', () => {
    expect(out('١٤٠٣/٠٦/٣١', only('arabicNumber'))).toBe('۱۴۰۳/۰۶/۳۱')
    expect(total('١٤٠٣/٠٦/٣١', only('arabicNumber'))).toBe(8)
  })

  it('leaves Persian and English digits alone', () => {
    expect(out('۵ ۱۲ 5', only('arabicNumber'))).toBe('۵ ۱۲ 5')
    expect(total('۵ ۱۲ 5', only('arabicNumber'))).toBe(0)
  })
})

describe('englishNumber — ASCII digits to Persian', () => {
  it('maps every English digit to its Persian counterpart', () => {
    expect(out('0123456789', only('englishNumber'))).toBe('۰۱۲۳۴۵۶۷۸۹')
    expect(total('0123456789', only('englishNumber'))).toBe(10)
  })

  it('converts an English decimal to momayez', () => {
    const result = run('1.5', only('englishNumber'))
    expect(result.output).toBe('۱٫۵')
    expect(result.total).toBe(3) // 2 digits + separator
  })

  it('converts an English slash between digits to momayez', () => {
    expect(out('1/2', only('englishNumber'))).toBe('۱٫۲')
  })

  it('preserves an English three-part date', () => {
    expect(out('1403/06/31', only('englishNumber'))).toBe('۱۴۰۳/۰۶/۳۱')
    expect(total('1403/06/31', only('englishNumber'))).toBe(8)
  })

  it('converts a mixed Persian/English decimal in the full pipeline', () => {
    expect(out('۱۲.5', ALL)).toBe('۱۲٫۵')
  })

  it('converts a mixed Arabic-Indic/English digit pair', () => {
    const result = run('٠1', ALL)
    expect(result.output).toBe('۰۱')
    expect(statFor(result, 'arabicNumber')).toBe(1)
    expect(statFor(result, 'englishNumber')).toBe(1)
  })

  it('leaves already-Persian digits alone', () => {
    expect(out('۵', only('englishNumber'))).toBe('۵')
    expect(total('۵', only('englishNumber'))).toBe(0)
  })
})

describe('prantez — spacing around parentheses, brackets and braces', () => {
  it('removes spaces just inside opening and closing brackets', () => {
    expect(out('متن ( داخل )', only('prantez'))).toBe('متن (داخل)')
    expect(total('متن ( داخل )', only('prantez'))).toBe(2)
  })

  it('adds a space before an opening bracket when there is none', () => {
    expect(out('متن(داخل)', only('prantez'))).toBe('متن (داخل)')
  })

  it('collapses two or more spaces before an opening bracket to one', () => {
    expect(out('متن  (داخل)', only('prantez'))).toBe('متن (داخل)')
  })

  it('keeps a single space before an opening bracket unchanged', () => {
    expect(out('word [x] {y}', only('prantez'))).toBe('word [x] {y}')
    expect(total('word [x] {y}', only('prantez'))).toBe(0)
  })

  it('handles parentheses, brackets and braces together', () => {
    expect(out('a ( b [ c ] d ) e', only('prantez'))).toBe('a (b [c] d) e')
    expect(total('a ( b [ c ] d ) e', only('prantez'))).toBe(4)
  })

  it('handles an empty bracketed pair', () => {
    expect(out('( )', only('prantez'))).toBe('()')
  })

  it('leaves a lone opening/closing bracket untouched', () => {
    expect(out('(', only('prantez'))).toBe('(')
    expect(out(')', only('prantez'))).toBe(')')
    expect(total('(', only('prantez'))).toBe(0)
  })

  it('does not treat a newline as collapsible whitespace', () => {
    expect(out('سلام\n(خوب)', only('prantez'))).toBe('سلام\n(خوب)')
    expect(total('سلام\n(خوب)', only('prantez'))).toBe(0)
  })

  it('does not treat a tab as a word separator before a bracket', () => {
    expect(out('a\t(b)', only('prantez'))).toBe('a\t(b)')
    expect(total('a\t(b)', only('prantez'))).toBe(0)
  })

  it('does not consider Persian digits a word before a bracket', () => {
    // The word classes only cover \w + U+0627..U+06CC, which excludes
    // Persian digits (U+06F0..U+06F9).
    expect(out('متن (۵ داخل)', only('prantez'))).toBe('متن (۵ داخل)')
    expect(total('متن (۵ داخل)', only('prantez'))).toBe(0)
  })
})

describe('alamat — spacing around sentence-ending punctuation', () => {
  it('removes spaces before a period', () => {
    expect(out('سلام .', only('alamat'))).toBe('سلام.')
    expect(total('سلام .', only('alamat'))).toBe(1)
  })

  it('collapses multiple spaces before a period', () => {
    expect(out('سلام   .', only('alamat'))).toBe('سلام.')
  })

  it('keeps the sentence readable when text follows', () => {
    expect(out('سلام . خبر', only('alamat'))).toBe('سلام. خبر')
  })

  it('adds a space after punctuation adjacent to a word', () => {
    expect(out('سلام؟خوبی', only('alamat'))).toBe('سلام؟ خوبی')
    expect(out('Hi!Bye', only('alamat'))).toBe('Hi! Bye')
    expect(out('سلام.خوب', only('alamat'))).toBe('سلام. خوب')
  })

  it('handles the Arabic question mark and the ASCII question mark', () => {
    expect(out('جمله ؟', only('alamat'))).toBe('جمله؟')
    expect(out('سلام  ?  خوب', only('alamat'))).toBe('سلام? خوب')
    expect(total('سلام  ?  خوب', only('alamat'))).toBe(2)
  })

  it('does not add a trailing space after a sentence-ending mark', () => {
    expect(out('جمله؟', only('alamat'))).toBe('جمله؟')
    expect(out('سلام!', only('alamat'))).toBe('سلام!')
    expect(total('جمله؟', only('alamat'))).toBe(0)
    expect(total('سلام!', only('alamat'))).toBe(0)
  })

  it('leaves a newline-delimited punctuation line untouched', () => {
    expect(out('سلام\n.\nخوب', only('alamat'))).toBe('سلام\n.\nخوب')
    expect(total('سلام\n.\nخوب', only('alamat'))).toBe(0)
  })

  it('does not consider Persian digits a word before punctuation', () => {
    expect(out('۵ .', only('alamat'))).toBe('۵ .')
    expect(total('۵ .', only('alamat'))).toBe(0)
  })

  it('leaves a lone punctuation surrounded by spaces untouched', () => {
    expect(out(' . ', only('alamat'))).toBe(' . ')
    expect(total(' . ', only('alamat'))).toBe(0)
  })
})

describe('convertText — integration and README examples', () => {
  it('normalises Arabic kaf/yeh in a word', () => {
    expect(out('كتاب ياقوت', ALL)).toBe('کتاب یاقوت')
    expect(total('كتاب ياقوت', ALL)).toBe(2)
  })

  it('converts a phone number to Persian digits', () => {
    expect(out('شماره تماس: 09120000000', ALL)).toBe(
      'شماره تماس: ۰۹۱۲۰۰۰۰۰۰۰',
    )
    expect(total('شماره تماس: 09120000000', ALL)).toBe(11)
  })

  it('converts a decimal but preserves a date', () => {
    expect(out('رقم: 12.5 و تاریخ: 1403/06/31', ALL)).toBe(
      'رقم: ۱۲٫۵ و تاریخ: ۱۴۰۳/۰۶/۳۱',
    )
    expect(total('رقم: 12.5 و تاریخ: 1403/06/31', ALL)).toBe(12)
  })

  it('normalises spacing inside parentheses and before punctuation', () => {
    expect(out('پارس‌نوشت ( ویرایشگر متن ).', ALL)).toBe(
      'پارس‌نوشت (ویرایشگر متن).',
    )
  })

  it('applies the whole pipeline in order on mixed input', () => {
    const result = run('كتاب 12.5 ( خوب ) ؟', ALL)
    expect(result.output).toBe('کتاب ۱۲٫۵ (خوب) ؟')
    expect(statFor(result, 'ka')).toBe(1)
    expect(statFor(result, 'englishNumber')).toBe(4)
    expect(statFor(result, 'prantez')).toBe(2)
  })

  it('does not collapse a space between a closing bracket and punctuation', () => {
    // Known limitation: the alamat rule requires a word character before
    // whitespace, so «) .» is left as-is (see the note in the PR report).
    expect(out('پارس‌نوشت ( ویرایشگر متن ) .', ALL)).toBe(
      'پارس‌نوشت (ویرایشگر متن) .',
    )
  })

  it('preserves newlines and blank lines throughout the pipeline', () => {
    const input = 'كتاب\n\n1.5 سلام'
    expect(out(input, ALL)).toBe('کتاب\n\n۱٫۵ سلام')
  })

  it('leaves whitespace-only input unchanged', () => {
    expect(out('   ', ALL)).toBe('   ')
    expect(total('   ', ALL)).toBe(0)
  })

  it('handles a longer mixed paragraph without corrupting it', () => {
    const input = 'سلام(دنیا) 1200/05/01 و مبلغ 45.6 ریال . بعد!'
    expect(out(input, ALL)).toBe(
      'سلام (دنیا) ۱۲۰۰/۰۵/۰۱ و مبلغ ۴۵٫۶ ریال. بعد!',
    )
  })
})