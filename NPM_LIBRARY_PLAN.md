# Plan: Extract the core logic into the `parsnevesht` npm library

> Tracks [#20 — Create a new NPM library and move the logic of this app to that library](https://github.com/maryayi/parsnevesht/issues/20).
>
> **Goal:** publish the text-correction engine that powers [parsnevesht.ir](https://parsnevesht.ir) as a standalone, dependency-free, MIT-licensed TypeScript library on npm under the name **`parsnevesht`**, then make the web app consume it instead of its own copy in `lib/convert.ts`.

---

## 1. Current state (what we are extracting)

All of the app's core logic lives in two files:

| File | Contents |
| --- | --- |
| `lib/convert.ts` (~270 lines) | Types (`OptionKey`, `ConvertOption`, `ConvertOptions`, `ConvertStat`, `ConvertResult`), constants (`CONVERT_OPTIONS`, `DEFAULT_OPTIONS`, Persian report labels, digit tables, character-variant maps), 8 private rule functions and the public `convertText()` pipeline. |
| `lib/convert.test.ts` (~550 lines, Jest) | Tests for exports, the result shape and statistics, each of the 8 rules, and integration/README examples. |

The UI (`app/page.tsx`) only uses `CONVERT_OPTIONS`, `DEFAULT_OPTIONS`, `convertText` and the `ConvertOptions` / `ConvertStat` types. `lib/seo.ts` is app-specific and **stays in the app**.

### The 8 rules (pipeline order matters)

| # | Key | What it does | How `count` is computed |
| --- | --- | --- | --- |
| 1 | `ka` | `ك ڪ ﻙ ﻚ` → `ک` | 1 per replaced character |
| 2 | `ya` | `ي ى ے ۍ ې` → `ی` | 1 per replaced character |
| 3 | `heh` | `ہ ھ` → `ه`, `ە` → `ه` + ZWNJ | 1 per replaced character |
| 4 | `momayez` | `.` or `/` between Persian digits → `٫`, but preserves/normalises 3-part dates (`۱۴۰۳/۰۶/۳۱`) | 1 per decimal separator (date normalisation is not counted) |
| 5 | `arabicNumber` | `٠-٩` → `۰-۹`, then runs the momayez step | digits converted + decimal separators fixed |
| 6 | `englishNumber` | `0-9` → `۰-۹`, **skipping Latin tokens** (`html2`, `mp3`, `v1.2.3`, `COVID-19`; see #3), then runs the momayez step | digits converted + decimal separators fixed |
| 7 | `prantez` | Removes spaces inside `() [] {}`, puts exactly one space outside them (newlines and tabs are not touched) | 1 per spacing fix |
| 8 | `alamat` | Removes spaces before `. ؟ ! ?` and puts one space after them when a word follows. A `.` glued between two digits or two Latin characters (`12.5`, `example.com`) is left alone | 1 per spacing fix |

URLs and emails are protected from every rule (see §3.5).

`convertText()` returns `{ output, stats, total }`. `stats` lists, in pipeline order, only the rules that made at least one change, each with its `key`, a Persian `label` and a `count`. `total` is the sum of all counts. **The library must keep exactly this behaviour and these statistics.**

---

## 2. Decisions

| Topic | Decision | Rationale |
| --- | --- | --- |
| Package name | `parsnevesht` (checked: **not yet taken** on npm) | Matches the brand. Reserve it early by publishing `0.1.0` (see §9). |
| Location | **A new repository**, e.g. `github.com/maryayi/parsnevesht-js` (the exact repo name is up to you) | The app is GPLv3, deploys to GitHub Pages from `master`→`gh-pages`, and its `package.json` is already named `parsnevesht`. A separate repo keeps licences, CI, issues and release tags clean. *(Alternative: a pnpm workspace `packages/parsnevesht` inside this repo. Possible, but it mixes GPL and MIT code and makes the deploy workflow more complicated.)* |
| License | **MIT**, © 2026 Mahdi Aryayi | Requested. `git shortlog -- lib/` shows Mahdi Aryayi is the only author of the core logic, so it can be relicensed. The web app itself stays GPLv3. |
| Language / types | TypeScript 5.9, `strict`, types shipped with the package | Same as the app. |
| Runtime dependencies | **None** | Pure string processing. |
| Output formats | ESM + CommonJS + `.d.ts`/`.d.cts`. Optional: an IIFE bundle for `<script>`/CDN use | Works in Node, bundlers, Next.js, Deno/Bun and plain browsers. |
| Build tool | **tsdown** (the successor of tsup, which is in maintenance mode). Fallback: tsup | Zero-config dual build with declaration files. |
| Test runner | **Vitest** | Native TS/ESM without a Babel setup. Its API matches Jest (`describe`, `it.each`, `expect`), so moving the tests over is mostly changing imports. |
| Package manager | pnpm (same as the app) | Consistency. |
| Node support | `>=18` (CI matrix: 18, 20, 22, 24) | Covers current LTS versions. The code needs only ES2018 features. |
| Browser support | No regex lookbehind, no `u`/`v`-only features beyond what the code uses today | Keeps older Safari working. |
| Versioning | SemVer. `0.1.0` first (API parity with app v0.4.1), then `1.0.0` once the web app runs on it in production | The app migration validates the API before we freeze it. |

---

## 3. Public API design

The library keeps **exactly** the current `convertText` contract, so the app can switch without changes, and adds three things:

1. every rule exported as its **own utility function**;
2. `options` becomes **optional/partial** and is merged over `DEFAULT_OPTIONS`;
3. exported constants are **read-only** (`readonly` types + `Object.freeze`), so a consumer cannot change the defaults for everyone else by accident.

### 3.1 Types (`src/types.ts`)

```ts
export type RuleKey =
  | 'ka' | 'ya' | 'heh' | 'momayez'
  | 'arabicNumber' | 'englishNumber' | 'prantez' | 'alamat'

/** @deprecated alias kept for parity with the app; prefer `RuleKey`. */
export type OptionKey = RuleKey

export interface ConvertOption { readonly key: RuleKey; readonly label: string }
export type ConvertOptions = Record<RuleKey, boolean>

/** Result of a single rule. */
export interface RuleResult { output: string; count: number }

/** One line of the correction statistics. */
export interface ConvertStat { key: RuleKey; label: string; count: number }

/** Result of the full pipeline. */
export interface ConvertResult {
  output: string        // corrected text
  stats: ConvertStat[]  // per-rule statistics, pipeline order, count > 0 only
  total: number         // sum of all counts
}
```

### 3.2 Main entry point

```ts
export function convertText(
  input: string,
  options?: Partial<ConvertOptions>, // missing keys fall back to DEFAULT_OPTIONS
): ConvertResult
```

- Throws a `TypeError` when `input` is not a string. Silently producing `"undefined"` would be worse.
- Passing a full `ConvertOptions` object gives the same result as today.

### 3.3 Per-rule utility functions

Each function is pure, takes a string and returns `RuleResult` (`{ output, count }`). Each one is **exactly** the step `convertText` runs for that key.

| Rule key | Function | Notes |
| --- | --- | --- |
| `ka` | `normalizeKaf(text)` | |
| `ya` | `normalizeYeh(text)` | |
| `heh` | `normalizeHeh(text)` | `ە` becomes `ه` + ZWNJ (`‌`) |
| `momayez` | `fixDecimalSeparator(text)` | Persian digits only; preserves dates |
| `arabicNumber` | `convertArabicDigits(text)` | Also fixes decimal separators afterwards |
| `englishNumber` | `convertEnglishDigits(text)` | Skips Latin tokens; also fixes decimal separators |
| `prantez` | `fixBracketSpacing(text)` | |
| `alamat` | `fixPunctuationSpacing(text)` | |

Also exported:

```ts
/** Rule key → rule function, in pipeline order. Useful for building custom pipelines. */
export const RULES: Readonly<Record<RuleKey, (text: string) => RuleResult>>
export const RULE_KEYS: readonly RuleKey[]              // pipeline order
export const CONVERT_OPTIONS: readonly ConvertOption[]  // Persian option labels (same as today)
export const DEFAULT_OPTIONS: Readonly<ConvertOptions>  // all true (same as today)
export const REPORT_LABELS: Readonly<Record<RuleKey, string>> // Persian stat labels (now public)
```

Internal helpers (`countMatches`, `replaceDigits`, `replaceVariants`, digit tables, variant maps, regexes) are **not** exported.

### 3.4 Usage preview (goes into the README)

```ts
import { convertText } from 'parsnevesht'

const { output, stats, total } = convertText('كتاب 12.5 ( خوب ) ؟')

output // 'کتاب ۱۲٫۵ (خوب)؟'
total  // 8
stats
// [
//   { key: 'ka',            label: 'عدد جایگزینی «کاف»',                  count: 1 },
//   { key: 'englishNumber', label: 'عدد جایگزینی اعداد انگلیسی',          count: 4 },
//   { key: 'prantez',       label: 'عدد اصلاح فاصله پرانتز/کروشه/آکولاد', count: 2 },
//   { key: 'alamat',        label: 'عدد اصلاح فاصله علامت آخر جمله',      count: 1 },
// ]

convertText('كتاب ياقوت', { ya: false }).output // 'کتاب ياقوت'

import { convertEnglishDigits } from 'parsnevesht'
convertEnglishDigits('نسخه Python 3.12') // { output: 'نسخه Python ۳٫۱۲', count: 4 }  (3 digits + 1 separator)
```

> Every example in the README must be copied from a passing test (see §5.3).

### 3.5 Out of scope for v0.x/v1.0 (possible later issues)

- A CLI (`npx parsnevesht file.txt`).
- English/i18n stat labels (an `en` label map could be added without breaking anything).
- Returning rules with `count: 0` in `stats` (an `includeEmpty` option).
- New rules (ZWNJ/half-space fixes, quotation marks, etc.) and changes to current behaviour, such as `\w` in the spacing regexes being ASCII-only. **v0.1.0 ports the logic exactly as it is.** Behaviour changes go through their own issues and tests.

**Bug fixed in the app before extraction:** `alamat` used to split decimals whose digits were not converted, for example `convertText('كتاب 12.5', { englishNumber: false })` → `'کتاب 12. 5'`. The app's `lib/convert.ts` now leaves a `.` alone when it sits directly between two digits (ASCII, Arabic-Indic or Persian). For the same reason, it also leaves a `.` alone between two Latin word characters, so domains, emails and file names are not broken (`example.com`, `info@site.ir`, `Node.js`). As a side effect, a glued English sentence like `end.Next` is no longer split.

**URL and email protection (also added in the app before extraction):** `convertText` now swaps every URL (`http(s)://`, `ftp://`, `www.`) and email for a placeholder before running the rules, and puts it back afterwards, so **no rule changes a URL or email**. Before this, `?q=1` became `? q=۱` and `Foo_(bar)` became `Foo_ (bar)`. Trailing sentence punctuation (`. , ؟ ،` …) and an unbalanced closing bracket are not treated as part of the URL. The placeholder looks like a Latin word to the spacing rules, so spacing around a URL is still fixed. Library requirements:
- Put the protection in `src/internal/protect.ts`.
- Apply it inside **each exported rule function** as well as in `convertText`, so the parity tests in §5.2 still hold. Nested protection is harmless, because a placeholder never matches the URL pattern.
- Port the `URLs and emails` test block, and add each rule function to it. Regression tests are in `lib/convert.test.ts` (the `alamat` block and the integration block). The library ports this fixed version, so the port and parity rules above still hold.

---

## 4. Repository layout

```
parsnevesht-js/
├── src/
│   ├── index.ts                 # public exports only
│   ├── types.ts                 # RuleKey, ConvertOptions, RuleResult, ConvertStat, ConvertResult…
│   ├── constants.ts             # CONVERT_OPTIONS, DEFAULT_OPTIONS, REPORT_LABELS, RULE_KEYS (frozen)
│   ├── convert.ts               # convertText() pipeline + RULES map
│   ├── internal/
│   │   ├── chars.ts             # digit tables + KA/YA/HEH variant maps (with the existing Persian comments)
│   │   ├── replace.ts           # countMatches, replaceDigits, replaceVariants
│   │   └── protect.ts           # URL/email protection (placeholders + restore)
│   └── rules/
│       ├── letters.ts           # normalizeKaf, normalizeYeh, normalizeHeh
│       ├── decimal.ts           # fixDecimalSeparator (DATE_OR_DECIMAL regex)
│       ├── digits.ts            # convertArabicDigits, convertEnglishDigits (LATIN_TOKEN logic)
│       └── spacing.ts           # fixBracketSpacing, fixPunctuationSpacing
├── test/
│   ├── helpers.ts               # ALL, NONE, only(), run(), out(), total(), statFor()
│   ├── exports.test.ts
│   ├── convert.test.ts          # result shape, stats, options merging, idempotency, integration
│   ├── rules/
│   │   ├── letters.test.ts
│   │   ├── decimal.test.ts
│   │   ├── digits.test.ts
│   │   └── spacing.test.ts
│   ├── parity.test.ts           # per-rule function ≡ convertText(only(key))
│   └── dist.test.ts             # smoke-test the built ESM + CJS bundles
├── .github/workflows/
│   ├── ci.yml
│   └── release.yml
├── package.json
├── tsconfig.json
├── tsdown.config.ts
├── vitest.config.ts
├── eslint.config.mjs
├── .gitignore / .npmignore (not needed if "files" is set)
├── CHANGELOG.md
├── LICENSE                      # MIT
└── README.md
```

---

## 5. Tests

### 5.1 Port the existing suite (no behaviour changes)

Every test in `lib/convert.test.ts` moves over **unchanged in its assertions**:

| Current `describe` block | New file |
| --- | --- |
| `convert module exports` | `exports.test.ts` |
| `convertText — result shape and general behaviour` | `convert.test.ts` |
| `ka family`, `ya family`, `heh family` | `rules/letters.test.ts` |
| `momayez` | `rules/decimal.test.ts` |
| `arabicNumber`, `englishNumber` (incl. the #3 Latin-token cases) | `rules/digits.test.ts` |
| `prantez`, `alamat` | `rules/spacing.test.ts` |
| `convertText — integration and README examples` | `convert.test.ts` |

What changes mechanically: add `import { describe, it, expect } from 'vitest'` (or turn on `globals: true`), change imports from `'./convert'` to `'../src'`, and move the helpers into `test/helpers.ts`.

**Acceptance check:** the number of test cases after porting ≥ the number reported by `pnpm test` in the app today.

### 5.2 New tests for the library's API

- **Per-rule utilities:** for every rule function, assert `output` and `count` on the same cases the pipeline tests use (e.g. `normalizeKaf('ك ڪ ﻙ ﻚ')` → `{ output: 'ک ک ک ک', count: 4 }`).
- **Parity (`parity.test.ts`):** for each `key` in `RULE_KEYS` and every input in a shared corpus (all inputs used elsewhere in the suite), `RULES[key](x)` deep-equals `{ output, count }` of `convertText(x, only(key))`. This guarantees the utilities and the pipeline never drift apart.
- **Statistics contract:**
  - `total === stats.reduce((s, x) => s + x.count, 0)` across the corpus;
  - `stats` is in `RULE_KEYS` order, has no duplicate keys and never contains `count: 0`;
  - every `stat.label === REPORT_LABELS[stat.key]`;
  - disabled rules never appear in `stats`.
- **Options handling:**
  - `convertText(x)` ≡ `convertText(x, DEFAULT_OPTIONS)`;
  - `convertText(x, {})` ≡ `convertText(x, DEFAULT_OPTIONS)`;
  - `convertText(x, { ka: false })` turns off only `ka`;
  - the caller's options object is not mutated.
- **Immutability:** `DEFAULT_OPTIONS`, `CONVERT_OPTIONS`, `REPORT_LABELS`, `RULE_KEYS`, `RULES` are frozen (`Object.isFrozen`), and assigning to them throws in strict mode.
- **Input validation:** `convertText(undefined as any)`, `convertText(42 as any)` throw `TypeError`.
- **Purity / global regex state:** calling any function twice in a row on the same input gives the same result. This catches `lastIndex` bugs with the module-level `/g` regexes (`DATE_OR_DECIMAL`, `LATIN_TOKEN`).
- **Idempotency:** `convertText(convertText(x).output)` has `total === 0` for the whole corpus, with an allow-list for any case already known to be non-idempotent (to be found while porting and documented).
- **Built package smoke test (`dist.test.ts`, run after `build`):** `import('../dist/index.js')` and `createRequire(...)('../dist/index.cjs')` both expose `convertText` and give the README example's output.

### 5.3 README examples are tested

Each code sample in the README has a matching `it('README: …')` test in `convert.test.ts`, so the docs cannot fall out of date.

### 5.4 Coverage

`vitest --coverage` (v8 provider) with thresholds **100 % lines/functions and ≥ 95 % branches** on `src/**`. The code is small and already well tested, so this is realistic.

---

## 6. Configuration drafts

### 6.1 `package.json`

```jsonc
{
  "name": "parsnevesht",
  "version": "0.1.0",
  "description": "Correct common Persian (Farsi) typography and orthography errors — Arabic/Urdu letter forms, Persian digits, decimal separator, and spacing around brackets and punctuation — with per-rule correction statistics.",
  "license": "MIT",
  "author": "Mahdi Aryayi <mahdiaryayi@gmail.com>",
  "homepage": "https://github.com/maryayi/parsnevesht-js#readme",
  "repository": { "type": "git", "url": "git+https://github.com/maryayi/parsnevesht-js.git" },
  "bugs": { "url": "https://github.com/maryayi/parsnevesht-js/issues" },
  "keywords": ["persian", "farsi", "typography", "orthography", "normalize", "text", "digits", "arabic", "rtl", "parsnevesht"],
  "type": "module",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts",  "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"],
  "sideEffects": false,
  "engines": { "node": ">=18" },
  "packageManager": "pnpm@12.5.1",
  "scripts": {
    "build": "tsdown",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:dist": "pnpm build && vitest run test/dist.test.ts",
    "check:package": "publint && attw --pack .",
    "prepublishOnly": "pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm check:package"
  },
  "publishConfig": { "access": "public", "provenance": true },
  "devDependencies": {
    "typescript": "^5.9",
    "tsdown": "latest",
    "vitest": "latest",
    "@vitest/coverage-v8": "latest",
    "eslint": "^9",
    "typescript-eslint": "latest",
    "publint": "latest",
    "@arethetypeswrong/cli": "latest"
  }
}
```

> After the first build, check the actual file names tsdown writes (`index.js` / `index.cjs` / `index.d.ts` / `index.d.cts`) and make `exports` match them. `publint` and `attw` will fail CI if they do not.

### 6.2 `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "target": "ES2018",
    "lib": ["ES2018"],               // no DOM: the library must not depend on it
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "skipLibCheck": true,
    "noEmit": true                   // emitting is tsdown's job
  },
  "include": ["src", "test", "*.config.ts"]
}
```

`noUncheckedIndexedAccess` will flag the `from[index]` / `groups[n]` accesses in the current code. Fix them with explicit checks, **without changing behaviour**.

### 6.3 `tsdown.config.ts`

```ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],   // optionally add 'iife' with globalName: 'Parsnevesht' for CDN use
  dts: true,
  target: 'es2018',
  clean: true,
  sourcemap: true,
})
```

### 6.4 `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['test/dist.test.ts'], // run only via `test:dist`, after a build
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      thresholds: { lines: 100, functions: 100, statements: 100, branches: 95 },
    },
  },
})
```

---

## 7. README (library)

Written in English, with Persian where it helps (same style as the app's README). Sections:

1. **Header:** logo (reuse `public/icon.svg`), `پارس‌نوشت | parsnevesht`, a one-line English + Persian tagline.
2. **Badges:** npm version, npm downloads, CI status, bundle size (bundlephobia/pkg-size), types included, License MIT.
3. **Why:** what goes wrong in Persian text (Arabic `ي/ك`, mixed digits, `.` vs `٫`, spacing) and why it matters (search, databases, readability). Link to the web app parsnevesht.ir.
4. **Install:** `npm i parsnevesht` / `pnpm add parsnevesht` / `yarn add parsnevesht` / CDN (`https://cdn.jsdelivr.net/npm/parsnevesht`) if the IIFE build ships.
5. **Quick start:** the `convertText` example from §3.4, including the **statistics** output.
6. **Options:** a table with rule key, default, description, and a before → after example for each of the 8 rules.
7. **Correction statistics:** how `stats` / `total` work, what each rule's `count` means (the table from §1), that zero-count rules are left out, and pipeline order. Include a small snippet that renders a report (for example, the way the web app lists replacement counts).
8. **Utility functions:** one sub-section per function with its signature, description and an example.
9. **Constants:** `RULES`, `RULE_KEYS`, `CONVERT_OPTIONS`, `DEFAULT_OPTIONS`, `REPORT_LABELS`, including how to build a custom pipeline from `RULES`.
10. **TypeScript:** exported types.
11. **Behaviour notes:** dates are kept (`۱۴۰۳/۰۶/۳۱`), Latin tokens are never changed (`html2`, `v1.2.3`, `COVID-19`), newlines and tabs are kept, `ە` → `ه` + ZWNJ, why order matters (`momayez` runs before the digit rules and they re-apply it).
12. **Compatibility:** Node ≥ 18, modern browsers, ESM & CJS, zero dependencies, works fully client-side.
13. **Contributing:** `pnpm i`, `pnpm test`, the rule that every behaviour change needs a test, and the commit style (conventional commits, as used in this repo).
14. **Used by:** parsnevesht.ir.
15. **License:** MIT © Mahdi Aryayi.

---

## 8. CI / CD

### `ci.yml` (push + PR)

- Matrix: Node 18, 20, 22, 24 on `ubuntu-latest`.
- Steps: checkout → `pnpm/action-setup` → `actions/setup-node` (pnpm cache) → `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm test:coverage` → `pnpm test:dist` → `pnpm check:package`.

### `release.yml` (on tag `v*.*.*`)

- Same checks, then `npm publish --provenance --access public`.
- Prefer **npm Trusted Publishing (OIDC)**: configure the GitHub repo/workflow as a trusted publisher on npmjs.com and add `permissions: id-token: write`. No long-lived `NPM_TOKEN` is needed. Fallback: an `NPM_TOKEN` repo secret.
- Create a GitHub Release from the matching `CHANGELOG.md` section.

### Release flow

`pnpm version <patch|minor|major>` → update `CHANGELOG.md` → `git push --follow-tags` → the workflow publishes.

---

## 9. Implementation phases & checklist

### Phase 0: Preparation
- [ ] Create the new GitHub repo (e.g. `maryayi/parsnevesht-js`), MIT, default branch `main`.
- [ ] Log in to npm (`npm login`) and turn on 2FA. Optionally reserve the name early by publishing a placeholder `0.0.0`, or go straight to Phase 3.

### Phase 1: Library scaffold
- [ ] `package.json`, `tsconfig.json`, `tsdown.config.ts`, `vitest.config.ts`, `eslint.config.mjs`, `.gitignore`.
- [ ] `LICENSE` (MIT, 2026, Mahdi Aryayi).
- [ ] Empty `src/index.ts`. Make sure `pnpm build`, `pnpm test` and `pnpm lint` run.

### Phase 2: Port the core logic
- [ ] Copy `lib/convert.ts` into the `src/` modules from §4, keeping behaviour and the Persian comments.
- [ ] Rename the private rule functions to the public names in §3.3 and export them.
- [ ] Add `RULES`, `RULE_KEYS` and a public `REPORT_LABELS`. Freeze all exported constants.
- [ ] `convertText`: accept `Partial<ConvertOptions>` and default it, validate the input type, and iterate `RULE_KEYS` instead of 8 hard-coded `run(...)` calls.
- [ ] Deal with `noUncheckedIndexedAccess` findings without changing behaviour.

### Phase 3: Tests
- [ ] Port the whole existing suite (§5.1). All tests green **without editing any expected value**.
- [ ] Add the new tests (§5.2) and README tests (§5.3).
- [ ] Meet the coverage thresholds (§5.4).

### Phase 4: Docs & packaging
- [ ] Write `README.md` (§7) and `CHANGELOG.md` (`0.1.0 — Initial release, extracted from parsnevesht.ir v0.4.1`).
- [ ] `pnpm pack` and inspect the tarball (only `dist`, README, LICENSE, CHANGELOG, package.json).
- [ ] `publint` and `attw --pack` pass (no "masquerading as ESM/CJS" or missing-types warnings).
- [ ] Manual smoke test from a scratch folder: `npm i ../parsnevesht-0.1.0.tgz`, then `import` and `require` both work, and so does a TS project with `moduleResolution: node16` and `bundler`.

### Phase 5: CI/CD & first release
- [ ] Add `ci.yml` and `release.yml`, and set up trusted publishing on npm.
- [ ] Tag `v0.1.0` and confirm the package shows on npmjs.com with provenance.

### Phase 6: Migrate this web app (a separate PR in **this** repo)
- [ ] Rename the app package in `package.json` from `parsnevesht` to e.g. `parsnevesht-web`. **Required:** npm/pnpm refuse to install a dependency with the same name as the package that depends on it.
- [ ] `pnpm add parsnevesht`.
- [ ] **Temporary parity check:** before deleting `lib/convert.ts`, add a test that runs the app's `convertText` and the library's `convertText` on the whole test corpus and asserts deep equality. Remove it with the file.
- [ ] Change the import in `app/page.tsx` from `'../lib/convert'` to `'parsnevesht'`.
- [ ] Delete `lib/convert.ts` and `lib/convert.test.ts`, keeping `lib/seo.ts`.
- [ ] Jest: with no tests left in the app, either remove Jest and its Babel/Testing Library dev-dependencies plus `jest.config.js` and the `test*` scripts, or keep them for future UI tests. **Decide during the PR.**
- [ ] `pnpm build` (static export) works and the deployed site behaves the same (spot-check the README examples and the statistics panel).
- [ ] App README: add a "Powered by the [`parsnevesht`](https://www.npmjs.com/package/parsnevesht) library" section, and point the feature list to the library's docs for rule details.
- [ ] Close #20 with links to the new repo, the npm package and the migration PR.

### Phase 7: 1.0.0
- [ ] After the app has run on the library in production without regressions, release `1.0.0` to freeze the API from §3.
- [ ] Open follow-up issues for the §3.5 items as needed.

---

## 10. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| A behaviour change slips in during the refactor | Assertions ported unchanged, the parity test (§5.2), the temporary app-vs-library parity test (Phase 6), coverage thresholds. |
| Module-level `/g` regexes keep `lastIndex` between calls | Only use them with `String.prototype.replace`/`match`, which reset it. Add the repeated-call test (§5.2). Never use them with `.test()`/`.exec()` (`LATIN_LETTER` has no `g` flag and must stay that way). |
| ESM/CJS/types packaging mistakes | `publint`, `attw`, the `dist.test.ts` smoke test, manual tarball install. |
| Name clash between the app's `package.json` and the library | Rename the app package (Phase 6, first step). |
| Licence confusion (GPL app vs MIT library) | Separate repos. The library code is written only by its MIT licensor. The app README states that the app is GPLv3 and uses the MIT library. |
| npm token leak | Trusted Publishing (OIDC) with provenance, 2FA on the npm account. |
