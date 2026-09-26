# DESIGN.md: "Oxide" theme

This is the design contract for the Oxide-inspired frontend. It is based on https://oxide.computer. The values come from the live site's CSS and from Oxide's published design system (`@oxide/design-system@6.7.2`: `styles/main.css`, `dark.css` and `light.css`). The marketing site only renders in dark. The light column below comes from Oxide's own `[data-theme='light']` tokens, so it is theirs and not invented.

If a value isn't in this file, derive it from a token here. Don't introduce new colours, radii or fonts.

## 1. Character

It should feel like an operator console: dense, calm and exact. The page is near-black (or near-white in light mode) with hairline 1px borders. There is one phosphor-green accent. Labels are uppercase monospace. Headlines are big, light-weight sans with negative tracking.

Chrome is never decorative. Structure comes from borders, not shadows or fills. Diagrams and screenshots get `FIG. N` captions. Status is shown with small uppercase monospace badges (`RUNNING`, `STOPPED`), in the style of Oxide's web console instance table.

**Avoid:**
- Gradients, glows, blurred blobs and glassmorphism.
- Rounded corners above 2px.
- Bold headlines (the display weight is 400).
- Colourful icons.
- More than one accent colour on screen, apart from the status colours in §2.3.

## 2. Colour tokens

These are Oxide's semantic token names. Implement them as CSS variables through MUI `cssVariables`, keeping the names so the code can be traced back to this file.

### 2.1 Neutrals

| token | dark | light | use |
|---|---|---|---|
| `surface-default` | `#0b0e12` oklch(16.2% .01 260) | `#fdfdfd` | page background |
| `surface-raise` | `#131519` oklch(19.5% .009 260) | `#f7f7f7` | cards, panels, menus (MUI `paper`) |
| `surface-secondary` | `#181a1d` oklch(21.6% .008 260) | `#eeeeee` | table header row, inset wells, disabled |
| `surface-tertiary` | `#303235` | `#e6e6e6` | pressed/selected fills |
| `surface-hover` | `#1f2124` | `#eeeeee` | row/button hover |
| `surface-scrim` | `#0b0e12` @40% | `#0b0e12` @10% | modal backdrop |
| `content-raise` | `#dedede` oklch(90% 0 260) | `#0b0e12` | headlines, emphasised values |
| `content-default` | `#bababb` oklch(79% .0011 260) | `#303235` | body text |
| `content-secondary` | `#a3a4a5` | `#5d5e61` | secondary copy, nav links |
| `content-tertiary` | `#818284` | `#818284` | muted labels, table meta, units ("GiB") |
| `content-quaternary` | `#5d5e61` | `#bababb` | placeholders, disabled |
| `stroke-default` | `#303235` | `#dedede` | **the** border: cards, inputs, table outer border |
| `stroke-secondary` | `#1f2124` | `#e6e6e6` | table row dividers, header bottom border |
| `stroke-tertiary` | `#181a1d` | `#eeeeee` | faint grid lines, background grid |
| `stroke-raise` | `#434547` | `#bababb` | hovered/focused borders on neutral controls |

### 2.2 Accent (green)

| token | dark | light | use |
|---|---|---|---|
| `content-accent` | `#00d892` oklch(77% .1919 163.7) | `#007455` | primary text accent: links, active tab, brand wordmark, page title |
| `content-accent-secondary` | `#00b77d` | `#009366` | accent hover |
| `content-accent-tertiary` | `#009366` | `#00b77d` | muted accent text, badge text on dim fill |
| `surface-accent` | `#002923` oklch(24% .0722 183.7) | `#c2f2db` | primary button fill, selected nav item, success badge fill |
| `surface-accent-secondary` | `#005441` | `#70eab7` | primary button hover fill |
| `stroke-accent` | `#00d892` | `#00d892` | focus ring, active tab underline, focused input border |
| `stroke-accent-secondary` | `#009366` | `#37e6a8` | primary button border |
| `stroke-accent-tertiary` | `#005441` | `#70eab7` | accent hairlines inside accent surfaces |

A primary button is a **dim green fill with bright green text**, not a solid bright-green block. In dark mode that is `surface-accent` + `content-accent` + a 1px `stroke-accent-tertiary` border. This matches "CONTACT SALES" in Oxide's header and "NEW INSTANCE" / "CREATE" in the console.

### 2.3 Status colours

These map directly to the pipeline states.

| state | text | fill | border (inset 1px) |
|---|---|---|---|
| **APPROVED** / success | `content-accent` `#00d892` / light `#007455` | `surface-accent` `#002923` / light `#c2f2db` | `content-accent` @15% |
| **PENDING** / notice | `content-notice` `#febb55` / light `#785600` | `surface-notice` `#271f00` / light `#f7e2c6` | `content-notice` @15% |
| **REJECTED** / error | `content-error` `#ff6785` / light `#97373b` | `surface-error` `#38110b` / light `#ffd8dd` | `content-error` @15% |
| neutral / idle (e.g. `STOPPED`) | `content-secondary` | `surface-secondary` | `stroke-default` |
| info (rare) | `content-info` `#8199fe` / light `#545491` | n/a | n/a |

## 3. Typography

Oxide uses **Suisse Intl** (sans) and **GT America Mono**. Both are commercial, and the CSP only allows self-hosted fonts (`font-src` falls back to `default-src 'self'`). Use these self-hosted substitutes through Fontsource:

- **Sans:** `Inter Variable` (`@fontsource-variable/inter`). Stack: `"Inter Variable", "Suisse Intl", -apple-system, Helvetica, Arial, sans-serif`
- **Mono:** `IBM Plex Mono` 400 (already a dependency). Stack: `"IBM Plex Mono", "GT America Mono", ui-monospace, monospace`
- Remove Bricolage Grotesque and IBM Plex Sans.

Everything is **weight 400**. Use 500 only sparingly, for table cell values and button text in the sans font. Never use 600 or above.

| role | font | size / line-height | tracking | case | colour |
|---|---|---|---|---|---|
| display (hero h1) | sans | 65 / 65px (use `clamp(40px, 5vw, 65px)`) | -0.025em (-1.625px) | sentence | content-raise |
| h2 | sans | 50 / 55px | -0.02em (-1px) | sentence | content-raise |
| h3 / section title | sans | 36 / 42px | -0.013em | sentence | content-raise; a trailing clause may use content-tertiary (Oxide's two-tone headline: "One integrated platform. *Compute, storage…*") |
| page title (console-style) | sans | 25 / 32px | 0 | sentence | content-accent, preceded by a small square accent icon (console "■ Instances") |
| lede | sans | 20 / 26px | 0.017em (0.336px) | sentence | content-secondary |
| body | sans | 16 / 22px | 0.021em (0.336px) | sentence | content-default |
| small body | sans | 14 / 18px | 0.03em (0.42px) | sentence | content-secondary |
| label / nav / button | mono | 12 / 16px | 0.053em (0.64px) | UPPERCASE | content-secondary (nav), per-variant (buttons) |
| micro label / table header / eyebrow | mono | 11 / 14px | 0.044em (0.48–0.64px) | UPPERCASE | content-tertiary |
| badge | mono | 10 / 14px | 0.064em (0.64px) | UPPERCASE | per status |
| code / terminal | mono | 13 / 20px | 0 | as-is | content-default; prompt `~>` in content-quaternary |

## 4. Shape, borders and elevation

- **Radius:** buttons 2px, inputs/badges/cards/tables 1px, and 0 for layout panels. Set MUI `shape.borderRadius = 2`.
- **Borders:** always 1px, `stroke-default` by default. Oxide draws borders as box-shadows so they don't shift layout, and `--shadow-border-base` is `0 0 0 1px #ffffff0d`. Plain CSS borders are fine.
- **Elevation:** almost flat. Floating things (menus, popovers, dialogs, toasts) use `surface-raise`, a 1px `stroke-default` border and a soft shadow:
  - `menu`: `0 1px 1px #00000005, 0 4px 8px -4px #0000000a, 0 16px 24px -8px #0000000f`
  - `modal`: `0 1px 1px #00000005, 0 8px 16px -4px #0000000a, 0 24px 32px -8px #0000000f`
  - Dark mode also adds `0 0 0 1px #ffffff0d` as an inner hairline.
- **Background grid (optional, hero areas only):** 1px lines in `stroke-tertiary` on a 20–40px grid, fading out with a mask. Keep it subtle.

## 5. Layout and spacing

- The base unit is 4px. Common steps are 4, 8, 12, 16, 20, 24, 40 and 60.
- **Container:** 12 columns with a 20px gap (`--container-gap: 1.25rem`), 40px page gutter (`--gutter-width: 2.5rem`, 16px on mobile), and a max width of about 1440px.
- **Header:** 60px tall (`--header-height: 3.75rem`) with a 1px `stroke-secondary` bottom border and a `surface-default` background:
  - left: the wordmark in `content-accent`
  - centre or right: nav in mono uppercase 12px `content-secondary`
  - far right: secondary + primary buttons, each 32px tall
- Sections are separated by 1px horizontal rules that run the full width. A section header can be an uppercase mono label sitting on the rule, like Oxide's "POWERING THE BEST TEAMS" (label, then a line that continues across).
- **Density:** controls are 32px tall (buttons, inputs, icon buttons), with 12px horizontal padding.

## 6. Components

### Buttons (mono, uppercase, 11–12px, 0.64px tracking, height 32px, padding 0 12px, radius 2px)

| variant | fill | text | border | hover |
|---|---|---|---|---|
| primary | `surface-accent` | `content-accent` | `stroke-accent-tertiary` | fill → `surface-accent-secondary` (dark) |
| secondary | transparent | `content-default` | `stroke-default` | fill → `surface-hover`, border → `stroke-raise` |
| ghost | transparent | `content-secondary` | none | text → `content-raise` |
| danger | `surface-error` | `content-error` | `content-error` @15% | fill → `surface-error-hover` oklch(30.8% .0814 28) |

- **Focus:** 1px `stroke-accent` outline with a 2px offset (or an inset ring).
- **Disabled:** `surface-disabled` fill and `content-disabled` text.
- **Icons:** the icon sits before the label, 12–14px, and uses the same colour as the text. Example: "⊕ NEW INSTANCE".

### Inputs

- Height 32–36px, `surface-default` fill, 1px `stroke-default` border, radius 1px, 14px sans text in `content-raise`, placeholder in `content-quaternary`.
- Focus: border `stroke-accent`, with no glow.
- The label sits above the input: mono 11px uppercase `content-tertiary`, with a 6–8px gap.
- Error: border `stroke-error`, and helper text below in 12px sans `content-error`.

### Tabs (terminal card, console dialog)

- Mono 11–12px uppercase.
- Inactive tabs are `content-secondary`. The active tab is `content-accent` with a 1px `stroke-accent` underline, and the underline is only as wide as the label plus its padding.

### Badges / status chips

- Mono 10px/14px uppercase with 0.64px tracking, padding `1px 4px`, radius 1px, and a status fill with an inset 1px ring (§2.3).
- They sit inline next to plain text meta. For example, the console shows `RUNNING` then `3w`, with the meta in `content-tertiary`.

### Tables (instance-table style)

- **Outer frame:** 1px `stroke-default` border.
- **Header row:** `surface-secondary` fill with 11px uppercase mono `content-tertiary` headers. It has a 1px `stroke-default` bottom border and vertical 1px `stroke-secondary` separators between header cells.
- **Rows:** 40px tall with 1px `stroke-secondary` separators. Cells use 14px sans `content-default`.
  - Units are dimmed: "8 GiB" is `8` in content-default and `GiB` in content-tertiary.
  - Primary identifiers are underlined links (`content-raise`, 1px underline in `stroke-raise`).
- The trailing actions column holds a `⋮` icon button.

### Cards / panels

- `surface-raise` fill (or transparent), 1px `stroke-default` border, radius 1px, 16–24px padding.
- A card may have a title bar: a 40px strip with a bottom border, containing mono uppercase labels or tabs.
- The "window chrome" variant has 3 small `surface-tertiary` dots at the top-left. Use it for the dropzone and preview frames.

### Figure captions

- `FIG. 1` is mono 12px uppercase `content-secondary` inside a 1px `stroke-default` box with a 2px 5px padding.
- It's followed by the caption title in mono uppercase `content-secondary`.
- Use it on diagrams, previews and the how-it-works illustration.

### Terminal block

- `surface-raise` fill, a 1px border and a tab strip.
- Lines are mono 13px: a prompt `~>` in `content-quaternary`, commands in `content-raise`, and output in `content-tertiary`.

### Connector lines

- Thin 1px `stroke-default` polylines with 45° elbows join an annotation to its subject, like the one from the hero terminal to the rack.
- Use them in the how-it-works diagram between pipeline stages.

## 7. Motion

- Standard easing is `cubic-bezier(.23, 1, .32, 1)` (ease-out-quint) at 150–250ms.
- Hover changes colour only: no scale and no lift.
- **Pending pulse:** a blinking block cursor (`▍`) or a 1s opacity pulse on the PENDING badge.
- Respect `prefers-reduced-motion`.

## 8. Theme switching

- Default to the OS setting (`prefers-color-scheme`).
- Add a manual override in the header: a mono ghost icon button that cycles SYSTEM → LIGHT → DARK.
- Use MUI `colorSchemeSelector: 'data-mui-color-scheme'` with `useColorScheme()`.
- The CloudFront CSP is `script-src 'self'`, so **no inline scripts**.
  - To avoid a flash of the wrong theme, set the attribute early from a static file, `public/color-scheme-init.js`, loaded with `<script src="/color-scheme-init.js"></script>` in `<head>` before the app bundle.
  - It reads the same localStorage key MUI uses (`mui-mode`) and sets `data-mui-color-scheme` on `<html>`.
- Put `<meta name="color-scheme" content="dark light">` in `index.html`.

## 9. Applying it to this app

- **Top bar:** as in §5. The wordmark is the app name in mono or sans, using `content-accent`. Nav shows `UPLOAD` and `HOW IT WORKS`, then the user's email in mono `content-tertiary`, then `SIGN OUT` as a secondary button, then the theme toggle.
- **Sign-in page:**
  - A split layout. The left side is a big two-tone display headline over a terminal block that shows the flow (`~> upload photo.jpg` / `presigned POST … 201` / `validating… APPROVED`).
  - The right side is a bordered form panel with a tab strip (`SIGN IN` / `CREATE ACCOUNT`), mono labels and a primary button.
- **Upload page:**
  - The dropzone is a bordered panel with window-chrome dots. Drag-over switches the border to `stroke-accent` and the fill to `surface-accent`.
  - Keep the viewfinder corner ticks, drawn in `stroke-raise`, and switch them to `stroke-accent` on drag-over.
  - Pipeline progress shows the stages as a console-style table or a stepper with status badges: `REQUEST URL` → `UPLOAD` → `VALIDATE` → `APPROVED`/`REJECTED`.
  - The result panel is a card with a `FIG.` caption over the preview, plus a key/value table: media_id, type, size and status badge.
- **How-it-works page:**
  - An annotated diagram with `FIG. 1` and thin connector lines.
  - Numbered stages are mono `01`–`04` labels in `content-accent`.
  - Technical details go in the console table style.

## Reference captures

Reference captures (in `reference/` next to this file):
- Hero: `reference/oxide-dark-top.png`
- Console table: `reference/ox-table.png`
