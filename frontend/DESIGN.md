# DESIGN.md: "Antimetal" theme

This is the design contract for the Antimetal-inspired frontend. It is based on https://antimetal.com. The values come from the live site's CSS:
- the `:root` block, and the `.dark` block the site ships alongside it
- the `--ink / --cream / --orange / --success / --rule / --mute` palette
- `@font-face` rules
- computed styles on rendered elements

Both the light and dark columns are Antimetal's own values. Where the site doesn't define something, such as an error/pending pair for dark, the value is derived here and marked *(derived)*.

If a value isn't in this file, derive it from a token here. Don't introduce new colours, radii or fonts.

## Scope & simplicity

This is a personal AWS learning and portfolio project, not a marketing site. **The original UI's layout, copy and density are the baseline; Antimetal is the skin.** Where this rule conflicts with §5, §6 or §9 below, this rule wins.

- **Icons:** Phosphor (`@phosphor-icons/react`). Keep every icon's line at about 1–1.5px to match the hairlines. Phosphor weights are fixed outlines on a 256 grid (Thin 8, Light 12, Regular 16, Bold 24 units), so line width = units × size ÷ 256. Regular is the app-wide default in `main.jsx` (1–1.4px at 16–22px); icons 32px and up use Thin (36px → 1.1px, 48px → 1.5px). Import the `…Icon` names (`ImageIcon`, not `Image`). MUI Alert icons are mapped to Phosphor in `theme.js`. Don't mix in another icon set. Exception: brand logos use the official mark (GitHub: `components/GitHubMark.jsx`, from Primer Octicons).
- **Keep:** paper/ink tokens, Geist for headlines and UI (no serif) with Geist Mono for labels, pill buttons, dashed hairlines and bracket corners, mono eyebrow chips, the earthy status colours, and light/dark with the toggle.
- **Structure:** each page keeps the original's sections, copy and amount of content. Don't add sections, extra copy or marketing flourishes.
- **Nav:** three translucent capsules. Left: Upload, How it works, GitHub and sujaya.dev (both open in a new tab). Centre: the logo (385px wide from `lg`, content width below). Right: the theme toggle, the email (from `lg`) and Sign out, or Sign in when signed out. Labels shorten so the capsules never overlap: GitHub shows its text from `lg` (and on phones, where the links get their own row), sujaya.dev only from 1360px, and the logo reads "Media Upload Pipeline" from `lg` (just "Pipeline" below).
- **Sign-in:** the original split layout. The left side has the logo, the headline, three short paragraphs (hidden below `md`), a "How it works →" link (shown at every size) and the AWS footer line (hidden below `md`). The right side mirrors it: the GitHub link and theme toggle (small round buttons) top right, level with the logo; the plain form centred, in a card framed like the upload page's cards (corner ticks, no visible outline); and "Built by sujaya.dev" bottom right, level with the AWS line. Below `md` it stacks with no empty space: the logo row (with the two buttons on its right) and headline, a dashed rule, the form, then "Built by" at the bottom, with 16px side gutters.
- **Upload:** title plus a one-line subtitle, a full-width progress card with a horizontal stepper (an icon per step in a circle coloured by status, joined by a rail, with just the step title below, like the original `main` layout), then input and output side by side from `md` up (stacked below): the dropzone on the left (corner ticks only, never an outline for mouse or touch; dragging tints the fill, and a focus outline shows only for keyboard focus), and the result card on the right, framed the same way (corner ticks, no outline): the preview on top (same padding and 16:10 frame as the dropzone preview, so the two line up), then the title "Result" (never the status as a word) with the coloured status chip on the line below it, and the key facts (type, size, media ID) one per line. Before a result exists the result card holds a one-line placeholder, so the layout doesn't jump. While uploading, the "Upload to storage" circle's outline becomes a progress ring (faint track, 2px amber arc filling clockwise from the top); there is no separate progress bar. Below `md` the stepper collapses to the icons alone with only the current step named underneath (showing the upload percentage while uploading). Technical details go in a plain collapsible under both columns.
- **How it works:** public, so it can be read before signing in; signed out, the top bar shows a "Sign in" pill where "Sign out" would be. It has the original sections and the AWS architecture diagram (`src/assets/aws-architecture.svg`, a copy of `docs/aws-architecture.svg` with a sans-serif font fallback added), shown on a light panel in both schemes because it has dark text on its own light background. Clicking it opens a full-screen in-page viewer (`components/DiagramViewer.jsx`): actual size first so the text is readable, click to toggle fit-to-screen, close with the X button or Esc.
- **Not used:** hero burst illustrations, annotation chips with leader lines, window-frame chrome, inverse cards, horizontal pipeline strips and redrawn diagrams.

## 1. Character

Editorial, warm and quiet: a research paper crossed with an instrument panel. The page is a neutral light-grey "paper" (`#f1f1f1`) with near-black ink. Big headlines use a sharp editorial **serif**, UI text uses a neutral grotesk, and small **uppercase mono** labels annotate everything.

Structure comes from **dashed and dotted hairlines** and **corner-bracket ticks** (the ⌜ ⌝ ⌞ ⌟ corners on cards; the secondary button is a plain dashed pill with no ticks), not from filled boxes. Primary actions are solid ink **pills**. Colour is rare, and each status has exactly one colour: amber = in progress, burnt orange = failed/rejected, teal (`#3d8378`) = approved. It only appears in data (charts, status) and in eyebrow labels.

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
| `--success` (teal) | `#3d8378` | **this app's choice, not from antimetal.com.** Everything approved/success: the approved result step fill, the APPROVED chip dot and text, the success alert icon. Same value in light and dark, except the chip **text** in dark mode, which uses the lighter tint `--success-text` `#81aea7` (4.6:1 on the dark chip; `#3d8378` would be 2.5:1) |
| `--color-accent` (lime) | `#e2e67d` | highlight only: text-selection background, a marker underline behind one key word, the focus ring on dark ink. Never body text |
| `--error` | `#bd4a28` | failed/rejected **fills, dots and icons** in both schemes: the failed step, the REJECTED chip dot, the error alert icon (3.0:1 on the dark card, enough for non-text). Text uses `--orange` |
| chart amber | `#e5a700` | everything in progress: the active step, its pulse, the upload progress ring, the dropzone scan line, the warning alert icon |
| chart ink | `#1a1614` (light) / `#f4f4e7` (dark) | data dots |

### 2.3 Status mapping (pipeline states)

Status is shown as an eyebrow chip plus a small filled dot, like the "● 47 EBS VOLUMES DETACHED" annotation in the hero.

| state | dot | chip text | chip fill |
|---|---|---|---|
| **PENDING** | `#e5a700` amber (pulsing) | ink 70% / cream 70% | `--color-cream` (light) · `#f4f4e71a` (dark) |
| **APPROVED** | `--success` `#3d8378` | `--success-text`: `#3d8378` / dark `#81aea7` | `--color-cream` · `#f4f4e71a` |
| **REJECTED** | `--error` `#bd4a28` | `--orange` `#bd4a28` / dark `#e0714f` | `--color-cream` · `#f4f4e71a` |
| error text (form validation) | none | `--orange` | none |

## 3. Typography

**Override for this app: no serif.** Headlines and ledes use Geist at weight 400 (Newsreader was removed). Where the rest of this document says "serif", read "Geist 400". Antimetal itself uses these fonts:

| role | Antimetal font | licence | substitute to self-host via Fontsource |
|---|---|---|---|
| display serif | **Signifier** (Klim; served as "Test Signifier") | commercial | not used in this app; headlines use Geist 400 |
| UI sans | **Geist** 400/500 | OFL | `@fontsource-variable/geist`. Stack: `"Geist Variable", Geist, ui-sans-serif, system-ui, sans-serif` |
| mono | **Geist Mono** | OFL | `@fontsource-variable/geist-mono`. Stack: `"Geist Mono Variable", "Geist Mono", ui-monospace, Menlo, monospace` |

- Signifier is commercial and is not used here. Geist and Geist Mono are open-source, so they're the actual fonts.
- The CSP only allows self-hosted fonts.
- Remove Bricolage Grotesque, IBM Plex Sans and IBM Plex Mono.
- If the Fontsource package names differ, check them on npm.

| role | font | size / line-height | tracking | weight | colour |
|---|---|---|---|---|---|
| display (h1) | Geist | 40px max (1.15); `clamp(30px, 3.5vw, 40px)` | -0.03em | 400 | ink |
| h2 | Geist | 32px max (1.15); `clamp(26px, 3vw, 32px)` | -0.02em | 400 | ink |
| h3 / card title | Geist | 26px max (1.2); `clamp(22px, 2.2vw, 26px)` | -0.01em | 400 | ink (cream on inverse panel) |
| h4 / panel title | Geist | 20 / 26px | 0 | 400 | ink |
| lede / subheadline | Geist | 18px max (1.5); `clamp(16px, 1.4vw, 18px)` | 0 | 400 | ink 70% |
| body | sans | 16 / 24px | 0 | 400 | ink (card body copy: ink 60–70%) |
| small / UI | sans | 14 / 21px | 0 | 500 | ink 60% (nav), ink (buttons) |
| eyebrow | mono | 10px, line-height normal | 0.1em (1px) | 400 | UPPERCASE; ink 60% or accent (orange/success) |
| meta label | mono | 11 / 16.5px | 0.06em (0.66px) | 400 | UPPERCASE; ink 42% |

Geist 400 at large sizes carries the voice: headlines and ledes. Sans is for UI and explanations. Mono is for labels, values and IDs only.

These sizes are scaled down from antimetal.com (54 / 48 / 36 / 24px) to suit a small app rather than a marketing site.

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
| secondary | transparent, 1px dashed `--rule` border, radius ~24px, no corner ticks, ink text; hover fills with ink 6% |
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
- The text colour is orange, success teal or ink 60%.
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
