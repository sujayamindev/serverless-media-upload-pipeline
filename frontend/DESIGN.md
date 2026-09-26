# DESIGN.md: "Antimetal" theme

This is the design contract for the Antimetal-inspired frontend. It is based on https://antimetal.com. The values come from the live site's CSS:
- the `:root` block, and the `.dark` block the site ships alongside it
- the `--ink / --cream / --orange / --green / --rule / --mute` palette
- `@font-face` rules
- computed styles on rendered elements

Both the light and dark columns are Antimetal's own values. Where the site doesn't define something, such as an error/pending pair for dark, the value is derived here and marked *(derived)*.

If a value isn't in this file, derive it from a token here. Don't introduce new colours, radii or fonts.

## Scope & simplicity

This is a personal AWS learning and portfolio project, not a marketing site. **The original UI's layout, copy and density are the baseline; Antimetal is the skin.** Where this rule conflicts with §5, §6 or §9 below, this rule wins.

- **Keep:** paper/ink tokens, a serif for headlines with Geist and Geist Mono for everything else, pill buttons, dashed hairlines and bracket corners, mono eyebrow chips, the earthy status colours, and light/dark with the toggle.
- **Structure:** each page keeps the original's sections, copy and amount of content. Don't add sections, extra copy or marketing flourishes.
- **Nav:** one simple top bar in translucent paper with a hairline under it. The logo goes on the left; how-it-works, the email, GitHub, an icon-only theme toggle and sign out go on the right. No floating capsules.
- **Sign-in:** the original split layout. The left side has the logo, headline, three short paragraphs and a footer line; the right side has the plain form in a bracket frame.
- **Upload:** title plus a one-line subtitle, the dropzone (bracket frame) on the left, and the vertical progress stepper with status dots on the right. The result is one simple card holding a status chip, two or three key facts and the preview. Technical details go in a plain collapsible.
- **How it works:** the original sections and the original architecture diagram, shown on a light panel in both schemes because it has black strokes.
- **Not used:** hero burst illustrations, annotation chips with leader lines, window-frame chrome, inverse cards, horizontal pipeline strips and redrawn diagrams.

## 1. Character

Editorial, warm and quiet: a research paper crossed with an instrument panel. The page is a neutral light-grey "paper" (`#f1f1f1`) with near-black ink. Big headlines use a sharp editorial **serif**, UI text uses a neutral grotesk, and small **uppercase mono** labels annotate everything.

Structure comes from **dashed and dotted hairlines** and **corner-bracket ticks** (the ⌜ ⌝ ⌞ ⌟ corners on cards and the secondary button), not from filled boxes. Primary actions are solid ink **pills**. Colour is rare and earthy: burnt orange, olive and amber. It only appears in data (charts, status) and in eyebrow labels.

**Avoid:**
- Pure white or pure black page backgrounds.
- Saturated blue or purple.
- Gradients on UI.
- Heavy shadows.
- Bold serif (the serif is always 400).
- Rounded cards. Cards are square-cornered with bracket ticks; only buttons and nav capsules are pills.

## 2. Colour tokens

Keep Antimetal's token names as CSS variables through MUI `cssVariables`.

### 2.1 Surfaces and ink (from `:root` / `.dark`)

| token | light | dark | use |
|---|---|---|---|
| `--color-bg` | `#f1f1f1` | `#1f1f1f` | page background (neutral override of the original Antimetal `#d7d7d0` / `#1a1614`) |
| `--color-fg` / `--ink` | `#1a1614` | `#f4f4e7` | primary text, primary button fill (light) |
| `--color-cream` | `#f4f4e7` | `#1a1614` | inverted text on ink surfaces; eyebrow-chip fill (light) |
| `--color-card` | `#fdfcfa` | `#262626` | raised surfaces: form panel, preview window, menus (MUI `paper`) |
| `--color-border` | `#1a16141a` (ink 10%) | `#f4f4e71f` (cream 12%) | solid hairlines, dividers |
| `--rule` | `#1a161457` (ink 34%) | `#f4f4e757` *(derived)* | dashed card borders, corner ticks |
| `--mute` | `#1a16148c` (ink 55%) | `#f4f4e78c` *(derived)* | muted text |
| `--nav-capsule` | `rgba(232,232,232,.67)` | `#1a1614bd` | translucent nav capsules (use with `backdrop-filter: blur(12px)`) |
| `--nav-rim` | `#fdfcfa8c` | `#f4f4e71f` | 1px capsule border |
| inverse panel | `#1a1614` bg / `#f4f4e7` text | `#f4f4e7` bg / `#1a1614` text *(derived)* | the one emphasised "vision" card per page |

**Text opacity ladder.** Antimetal tints the ink with alpha instead of using separate greys. In dark mode apply the same alphas to cream (`#f4f4e7`).

| alpha | use |
|---|---|
| 100% | headlines, body |
| 92% | accordion / question text |
| 70% | serif lede / subheadline, input text |
| 60% | nav links, secondary buttons |
| 42% | mono meta labels (`ANTIMETAL · PRODUCTION`) |
| 20% | disabled fills |
| 10% | subtle fills and hover backgrounds |
| 6% | subtle fills and hover backgrounds |

### 2.2 Accents

| token | value | use |
|---|---|---|
| `--orange` | `#bd4a28` | primary accent **text**: eyebrow labels, links on hover, the REJECTED state. In dark mode use `#e0714f` *(derived; lifted for contrast)* |
| `--green` (olive) | `#6e7a34` | secondary accent text: eyebrows, the APPROVED state. In dark mode use `#a8b560` *(derived)* |
| `--color-accent` (lime) | `#e2e67d` | highlight only: text-selection background, a marker underline behind one key word, the focus ring on dark ink. Never body text |
| chart orange | `#ff7733` | data dots / progress fill |
| chart amber | `#e5a700` | data dots, the PENDING state marker |
| chart olive | `#a89a1a` | data dots |
| chart ink | `#1a1614` (light) / `#f4f4e7` (dark) | data dots |

### 2.3 Status mapping (pipeline states)

Status is shown as an eyebrow chip plus a small filled dot, like the "● 47 EBS VOLUMES DETACHED" annotation in the hero.

| state | dot | chip text | chip fill |
|---|---|---|---|
| **PENDING** | `#e5a700` amber (pulsing) | ink 70% / cream 70% | `--color-cream` (light) · `#f4f4e71a` (dark) |
| **APPROVED** | `#a89a1a` olive | `--green` `#6e7a34` / dark `#a8b560` | `--color-cream` · `#f4f4e71a` |
| **REJECTED** | `#ff7733` orange | `--orange` `#bd4a28` / dark `#e0714f` | `--color-cream` · `#f4f4e71a` |
| error text (form validation) | none | `--orange` | none |

## 3. Typography

Antimetal uses these fonts:

| role | Antimetal font | licence | substitute to self-host via Fontsource |
|---|---|---|---|
| display serif | **Signifier** (Klim; served as "Test Signifier") | commercial | `Newsreader Variable` (`@fontsource-variable/newsreader`). Stack: `"Newsreader Variable", "Signifier", "Noto Serif", Georgia, serif` |
| UI sans | **Geist** 400/500 | OFL | `@fontsource-variable/geist`. Stack: `"Geist Variable", Geist, ui-sans-serif, system-ui, sans-serif` |
| mono | **Geist Mono** | OFL | `@fontsource-variable/geist-mono`. Stack: `"Geist Mono Variable", "Geist Mono", ui-monospace, Menlo, monospace` |

- Signifier is commercial, so use Newsreader. Geist and Geist Mono are open-source, so they're the actual fonts.
- The CSP only allows self-hosted fonts.
- Remove Bricolage Grotesque, IBM Plex Sans and IBM Plex Mono.
- If the Fontsource package names differ, check them on npm.

| role | font | size / line-height | tracking | weight | colour |
|---|---|---|---|---|---|
| display (h1) | serif | 54 / 59.4px (1.1); `clamp(38px, 5vw, 54px)` | -0.037em (-2px) | 400 | ink |
| h2 | serif | 48 / 52.8px | -0.021em (-1px) | 400 | ink |
| h3 / card title | serif | 36 / 39.6px | -0.01em | 400 | ink (cream on inverse panel) |
| lede / subheadline | serif | 24 / 28.8px | 0 | 400 | ink 70% |
| body | sans | 16 / 24px | 0 | 400 | ink (card body copy: ink 60–70%) |
| small / UI | sans | 14 / 21px | 0 | 500 | ink 60% (nav), ink (buttons) |
| eyebrow | mono | 10px, line-height normal | 0.1em (1px) | 400 | UPPERCASE; ink 60% or accent (orange/olive) |
| meta label | mono | 11 / 16.5px | 0.06em (0.66px) | 400 | UPPERCASE; ink 42% |

The serif carries the voice: headlines, ledes and questions. Sans is for UI and explanations. Mono is for labels, values and IDs only.

## 4. Shape, lines and elevation

- **Radius:**
  - Buttons and nav capsules are pills (`9999px`).
  - Floating chips/tooltips use 4px.
  - Cards, panels, inputs and tables use **0**.
  - Set MUI `shape.borderRadius = 0` and override buttons to `9999px`.
- **Card border:** 1px **dashed** `--rule`, plus **corner ticks**: 8px L-shaped marks in solid ink (1.5px) at all four corners, sitting on top of the dashed border. Implement them as absolutely positioned pseudo-elements or 4 small spans, as a reusable `<BracketFrame>` component.
- **Section rules:** a full-width 1px **dotted** line in `--color-border` / `--rule`, such as the line under the hero.
- **Solid hairline:** 1px `--color-border` for list/accordion row dividers.
- **Elevation:** almost none.
  - Floating chip: `0 10px 24px rgba(0,0,0,.18)`.
  - Nav capsule: `inset 0 0 10px rgba(0,0,0,.08)`, a translucent fill (`--nav-capsule`) and a backdrop blur.
  - Preview "window": `--color-card`, 1px `--color-border` and a soft `0 20px 40px -20px rgba(26,22,20,.25)`.

## 5. Layout and spacing

- The base unit is 4px. Generous whitespace: sections have 120–160px of vertical padding on desktop and 64px on mobile.
- **Page gutter:** 30px at the top/sides for the floating nav, and 120px content inset on desktop (16px on mobile).
- **Nav:** three floating capsules on the page background (not a full-width bar), 44px tall and 30px from the top:
  - left capsule: text links (`Upload`, `How it works`), sans 14px/500 at ink 60% with `6px 14px` padding; the active link goes to ink 100%
  - centre capsule, wide: a small dotted logo mark plus the app name in sans 16px ink
  - right capsule: the user email / `Sign out` as a text link, plus the primary pill (ink fill) for the key action and the theme toggle
- **Hero:** a two-column layout with a serif headline and lede on the left. The right side holds a generative/data illustration: a radial "burst" of thin grey lines ending in coloured dots (the chart palette). This can be a static SVG.

## 6. Components

### Buttons

| variant | spec |
|---|---|
| primary | pill, `--ink` fill, `--color-cream` text, sans 14px/500, height 46px, padding 0 24px; hover lifts to `#2a2724`. Dark mode inverts: cream fill, ink text |
| secondary ("bracket") | transparent, 1px dashed `--rule` border, **corner ticks** as on cards, radius ~24px (the dashed outline is rounded but the ticks are square), ink text; hover fills with ink 6% |
| nav pill (small) | height 32px, padding 0 14px, pill; the active item is ink fill with cream text (`Book a demo` style, `#2a2724` fill in light) |
| text | sans 14px/500 ink 60% → ink on hover |
| icon (round) | 28px circle, translucent capsule style (the ↓ ↑ 🔍 controls, bottom-right) |

Focus: a 2px `--color-accent` (lime) ring with a 2px offset on ink buttons, and a 1px ink ring on others.

### Inputs

- Transparent fill on paper (`--color-card` fill inside a card), with a 1px `--color-border` bottom border only (editorial underline style) or a full 1px border at radius 0.
- Text is sans 16px ink. The placeholder is ink 42%.
- The label above is a mono 10px uppercase eyebrow at ink 60%.
- Focus: the bottom border becomes 1px solid ink.
- Error: the bottom border is `--orange`, with the helper text below in sans 13px `--orange`.

### Eyebrow chip

- Mono 10px uppercase with 1px tracking and `5px 9px` padding, filled with `--color-cream` (light) or `#f4f4e71a` (dark), and no radius.
- The text colour is orange, olive or ink 60%.
- It sits above card titles: "THE AUTONOMOUS LAYER", "THE VISION".

### Card (bracket frame)

- Transparent on paper, with the dashed `--rule` border and corner ticks, and 32px padding.
- Contents, top to bottom:
  - the eyebrow
  - the serif h3 (36px)
  - sans body (16/24, ink 60–70%) with a 24px gap
- **Inverse card:** use this once per page for the key message. It has an `--ink` fill, cream text, a mono eyebrow at cream 60%, and no border.

### Accordion / list rows

- Full-width rows with 24px padding, divided by 1px `--color-border`.
- The question is serif 24px at ink 92%, with a `+` / `−` in sans at the right.
- The answer is sans 16/24 at ink 70%.

### Window frame (for previews)

- A `--color-card` panel with a 28px title bar showing 3 tiny grey dots on the left and a mono 11px uppercase centred title at ink 42% (e.g. `PIPELINE · PREVIEW`).
- The body is `#f7f6f3` in light and `#262626` in dark.

### Data annotation

- A small white/card chip (4px radius, float shadow) containing a coloured dot and mono 10px uppercase text.
- It's connected to a point by a 1px **dashed orange** leader line.
- Use it to annotate the pipeline diagram and upload progress.

## 7. Motion

- The easing is `cubic-bezier(.22, 1, .36, 1)` at 200–400ms. Motion is slow and calm.
- Hover on pills changes colour only. Cards don't move.
- **PENDING:** the amber dot pulses (opacity plus a 1px ring expanding outward, like the hollow orange rings in the hero chart).
- The hero illustration may drift slowly.
- Respect `prefers-reduced-motion`.

## 8. Theme switching

- Default to the OS setting (`prefers-color-scheme`).
- Add a manual override: a round icon button in the right nav capsule that switches between light and dark. The first visit follows the OS; the choice is then remembered.
- Use MUI `colorSchemeSelector: 'data-mui-color-scheme'` with `useColorScheme()`.
- The CloudFront CSP is `script-src 'self'`, so **no inline scripts**.
  - To avoid a flash of the wrong theme, set the attribute early from a static file, `public/color-scheme-init.js`, loaded with `<script src="/color-scheme-init.js"></script>` in `<head>` before the app bundle.
  - It reads the same localStorage key MUI uses (`mui-mode`) and sets `data-mui-color-scheme` on `<html>`.
- Put `<meta name="color-scheme" content="light dark">` in `index.html`. Also set `::selection { background: #e2e67d; color: #1a1614 }`.

## 9. Applying it to this app

- **Nav:** the three floating capsules from §5.
- **Sign-in page:**
  - The left side has a serif display headline (e.g. "Uploads that check themselves."), a serif lede at 70% and a meta line in mono.
  - The right side has a `--color-card` form panel inside a bracket frame. `Sign in` / `Create account` is a two-pill segmented control. Inputs use the underline style. Submit is a full-width primary ink pill.
- **Upload page:**
  - The dropzone is a large bracket frame with a dashed border and corner ticks, a serif prompt ("Drop a photo or video") and a mono meta line (`JPG · PNG · MP4 — MAX 50 MB`) at ink 42%.
  - Drag-over switches the dashed border to solid ink and the fill to ink 6%.
  - Pipeline progress is a horizontal line of stages joined by a dotted rule. Each stage is a dot plus a mono label, and the current stage is an annotation chip.
  - The result is a window frame preview with an eyebrow chip for status plus a mono key/value list.
- **How-it-works page:**
  - An editorial, long-form page.
  - Numbered sections are mono `01`–`04` eyebrows in orange, with serif h2s.
  - The diagram is drawn with thin grey lines, coloured dots and dashed-orange annotation leaders.
  - Use one inverse card for the key idea: "The backend never touches your file bytes."
  - An accordion covers the technical details.

## Reference captures

Reference captures (in `reference/` next to this file):
- Hero: `reference/antimetal-light-top.png`
- Card: `reference/am-card.png`
- Inverse card: `reference/am-darkcard.png`
