# Verso — AI that runs the picture desk

A one-page marketing site for a fictional product: software that reads a
photographer's archive and writes a sentence onto every frame, so the work
answers to a description instead of a folder name.

Static. No build step, no framework, no package manager.

```bash
npx http-server . -p 8140 -c-1 -s
```

Or pick **wren** in the preview panel.

---

## 1. Files

```
wren/
├── index.html      markup only — 9 sections
├── style.css       the design system + every section
├── script.js       one IIFE: scroll engine, demos, reveals, FAQ
├── assets/         28 WebP photo renditions + favicon set, nothing remote
└── PROJECT.md      this file
```

Four external dependencies, all CDN:

| What | Where | Why |
|---|---|---|
| Fraunces | Google Fonts | display serif, variable optical size |
| DM Mono | Google Fonts | the small uppercase labels |
| Switzer | Fontshare | UI sans |
| Lenis 1.1.13 | unpkg | smooth scroll |

> `cdnjs` does **not** host Lenis 1.1.13 — that path 404s. Use unpkg.

---

## 2. Where the design came from

The brief was to build against **lassie.ai**. Everything below was measured
off the live site at 1440x900, not eyeballed from screenshots.

**Type.** Their H1 is 86.5px / 82.2 line-height / weight 350 / -0.02em, set in
ABC Marist. Every section H2 is the *same* 58.3px. H3 is 24.9px. Body is DM
Sans, labels DM Mono. Ours matches those sizes with Fraunces standing in for
ABC Marist — it has a real optical-size axis, so the display cut is drawn for
display and doesn't go spindly the way a static serif does.

**Ground.** `#F9F8F5`. Sections run 160–270px of padding. The page is long
(16,277px at 1440) with media in most sections.

**Hero.** Measures `1440x900, left:0, border-radius:0, no transform` at every
scroll position — dead full bleed, edge to edge. It does *not* inset.

**Motion — the important one.** Sampling their layers mid-scroll returns:

```
translateY(-30)   opacity 1      <- outgoing
translateY(-2.4)  opacity 1
translateY(27.6)  opacity 0.08   <- incoming
```

Every scroll-driven layer is **continuously scrubbed**: it rides translateY
from +30 to -30 across its slice while opacity ramps, so at any scroll position
two layers are mid-handover. Nothing toggles a class and lets a CSS transition
play — that is the difference between motion tied to your scroll and motion
that feels canned.

**Scroll setup.** They run Lenis with `scroll-behavior: auto` and
`overflow-x: clip` on html *and* body.

---

## 3. Design system

### Ground and colour

| Token | Value | Job |
|---|---|---|
| `--paper` | `#F7F5F0` | the page |
| `--sand` | `#EBE5D8` | the two sections that step out of the page |
| `--card` | `#FFFFFF` | drifting cards |
| `--ink` | `#191712` | all type |
| `--deep` | `#20231C` | the one dark section (Search) |
| `--clay` | `#A9542F` | the only accent — carets, step numbers, live state |
| `--soft` / `--faint` / `--hair` | ink at 60 / 38 / 12% | secondary text, labels, rules |

One accent, used only for *state*: the typing caret, the step number, the
filename of the row currently being written. It is never decoration.

### Type

| Role | Face | Size |
|---|---|---|
| H1 | Fraunces 300, opsz 120 | `clamp(2.9rem, 6vw, 5.4rem)` / .96 / -.025em |
| H2 | Fraunces 300 | `clamp(2.2rem, 4.05vw, 3.65rem)` / 1.04 |
| H3 | Fraunces 400 | `clamp(1.35rem, 1.74vw, 1.56rem)` |
| Body | Switzer 400 | 17px / 1.5 |
| Labels | DM Mono 400 | .72rem / .12em / uppercase |

### Spacing and shape

One knob: `--sp: clamp(96px, 11vw, 210px)` drives every section's rhythm.
`--gut: clamp(18px, 2.6vw, 46px)` is the page gutter. `--r: 22px` is the only
radius. Container is 1440px.

---

## 4. The page, section by section

**01 · Hero** — Full bleed, `border-radius: 0`, no transform at rest, exactly
as Lassie's measures. As you scroll away it *draws itself in*: scales to .95
and rounds to 30px, driven by a `--p` custom property written from JS. The
photograph inside drifts and scales at a different rate, so the image lags the
card it sits in.

**02 · Marks** — Client names on a rail that creeps sideways with the scroll
and wraps. The list is duplicated so the wrap is seamless.

**03 · What it does** — Three editorial rows, alternating sides, each with a
mono index, a serif statement and one image that drifts inside its own frame.
*This replaced a six-card grid, which was the most generic thing on the page.*

**04 · How it works** — The pinned scene. A sticky full-height stage holds for
three screens of scroll while the copy advances 01 → 02 → 03 and the media
cross-dissolves. Scrubbed, not switched (see §5).

**05 · Search** — The one dark section. A query types itself into a large
serif field and only the frames that answer it come up out of grey. The
queries honestly describe the images they return.

**06 · What it wrote** — *The section only this product could have.* A file
called `_DSC4471.NEF` next to the sentence Verso wrote for it. Each sentence
**writes itself in** left-to-right via `clip-path` as its row arrives, and the
last row is still being typed live, its filename in clay.

**07 · The figure** — A full-screen `96%` with photo cards and live chips
drifting past it on both axes with rotation and an edge fade.

**08 · The quote** — Full-bleed photograph, quote bottom-left.

**09 · Questions / The close** — Centred FAQ that animates its own height,
then a close that is **the product doing its job one last time** rather than a
pitch. Verso's first step is "point it at the work", so the CTA is a real drop
target: hover it, tap it, press Enter on it, or drag a folder onto it, and it
describes a frame on the spot — thumbnail, filename in clay, and the sentence
typing itself out. A real drop fires `preventDefault` and reports the file
count ("3 frames · reading"); nothing is uploaded and no file is read.

Two earlier versions were wrong and are worth recording: a flat sand block
with a decorative aperture watermark (the only major section with no
photograph, it repeated the sand of *What it wrote*, and the watermark broke
the page's own rule that nothing is decorative), then a full-bleed photo
bookend (better, but still only a pitch). The brief was to take the pattern
from the sites Mobbin catalogues — Mobbin's own library is login-walled and
returns 403, so the reference was taken from those sites directly. The move
the good ones share is that the last section demonstrates rather than asks.

---

## 5. Motion architecture

Everything scroll-driven lives in **one** `update(y)` in `script.js`.

**Scrubbed, not switched.** Each step in the pinned scene computes its own
position in the scroll:

```js
var p  = prog * n - k;                  // 0 -> 1 while slot k is live
var op = clamp(min((p+OVER)/FADE, (1+OVER-p)/FADE), 0, 1);
var ty = clamp(.5 - p, -.5, .5) * 60;   // +30 -> -30, as Lassie does
```

`OVER = .18` makes the windows overlap so the outgoing layer is still at ~.6
as the incoming one reaches ~.6 — a cross-dissolve with no dip to nothing
between steps. First and last slots never fade at the ends.

**No layout reads in the loop.** Positions are measured once in `measure()`
and re-measured on resize. Reading `getBoundingClientRect()` every frame while
writing styles forces a layout per frame, and that is what makes a scroll feel
like it catches.

**Driven twice.** `update()` runs from both the rAF loop *and* a passive
`scroll` listener. rAF alone is enough when the tab is painting, but a
throttled tab would otherwise freeze the pinned scene on step 01.

**CSS transitions are for state, never for scrub.** A transition on a property
JS also writes every frame fights it. The scene's steps and media deliberately
have *no* transition; the FAQ, hover states and `.up` reveals do.

---

## 6. Pictures

**One register, the whole way down:** intentional camera movement over nature
— muted, painterly, nearly abstract — which is the language Lassie uses in
`lassie-pg-1/2/3`. The hero is the exception and is the only sharp frame: a
photographer in warm window light.

Images were not picked by eye. Each was sampled to a 40x40 bitmap and scored
on mean RGB, saturation and luminance. The set holds **0.20–0.40 saturation
with none blue-dominant**, so the page carries one light. One image (blue
streaks, 0.46 saturation, mean 97/134/167) was dropped for being outside the
family.

**Favicon.** The mark is the aperture used in the nav and footer — an ink
rounded square with a paper ring and centre dot, which still reads at 16px.
`assets/favicon.svg` is primary; `favicon-32.png` and `apple-touch-icon.png`
(180px) are fallbacks for older browsers and iOS. The PNGs are generated
procedurally by a dependency-free Node script (4x supersampled, hand-written
PNG chunks) rather than rasterised by hand, so they can be regenerated at any
size. `theme-color` is set to the paper ground.

**Local, not hot-linked.** All 26 renditions live in `assets/` as WebP —
Unsplash serves WebP directly with `fm=webp`, so there is no conversion step.
Blurred frames are encoded at q58–66 because blur hides artefacts; the hero at
q66–74. The hero ships three widths behind `srcset` (1200 / 1800 / 2400) and
the browser picks: 1200 on a phone, 1800 at 1440, 2400 at 2560.

> The hero is a **portrait** photograph in a full-bleed landscape frame, so a
> wide screen necessarily shows a band of it — about 42% of its height at
> 1440, 28% at 2560. This is a deliberate, accepted trade: the alternative was
> capping the hero's width, which left margins down the sides.
> `object-position: 50% 31%` picks the band holding the face and window light.

---

## 7. Editing

- **Spacing** — one knob, `--sp` on `:root`.
- **Swap a photograph** — drop a WebP in `assets/`, update the `src`, and
  change the sentence with it. In *What it wrote* and *Search* the copy
  describes the specific frame beside it; a sentence that no longer matches its
  picture is the one thing that breaks this page.
- **Search demo** — `Q` in `script.js` pairs each typed query with the indices
  of the `.hit` cards it lights.
- **Pinned scene** — add a `.step` and a matching `#media img`; the track
  height (`steps.length * 100svh`) and the rail follow automatically.
- **Numbers** — `data-count` + `data-suffix`, counts up once on scroll.

---

## 8. Traps worth knowing

These each cost a round of rework, and are why the audit in §9 exists.

**Class-name collisions.** Three separate bugs, all the same shape:

- `.q` was both the FAQ row and the search field's query span — a TypeError on
  every load, plus a stray border under the typed query.
- `.d1` was both a reveal delay and a drifting card — the headline got squeezed
  into a 138px column.
- `.live` was both the hero status pill and the live row — white text on sand,
  a giant pill, `inline-flex` that destroyed the grid, and a green dot over the
  caret.

**`ch` resolves against the element's own font-size.** `max-width: 26ch` on a
wrapper that inherits 17px gives a ~208px line box, not 26 characters of the
48px serif inside it. The quote broke one word per line.

**`overflow-x: hidden` on body breaks `position: sticky`** — it makes body a
scroll container. Use `clip`; it clips without creating one.

**`scroll-behavior: smooth` fights Lenis.** Two smooth scrollers arguing over
one scroll position. Lenis needs `auto`.

**`.up` sets `transform` on reveal**, so it overwrites any transform the
element needs for layout. The hero email bar was centred with
`translateX(-50%)` and jumped off-centre the moment it animated in. Centre with
flex and let the reveal own `transform`.

---

## 9. Audit scripts

Paste into the console:

```js
// 1. classes shared across page blocks — catches collisions before they ship
const used = new Set();
for (const sh of document.styleSheets) {
  let rs; try { rs = sh.cssRules } catch (e) { continue }
  for (const r of rs) (r.selectorText?.match(/\.[A-Za-z][-\w]*/g) || [])
    .forEach(c => used.add(c.slice(1)));
}
const blockOf = el => {
  const b = el.closest('section,header,footer,.navrow,.marks');
  return b ? (b.id || b.className.toString().split(' ')[0]) : 'root';
};
[...used].forEach(c => {
  const els = [...document.querySelectorAll('.' + CSS.escape(c))];
  const blocks = [...new Set(els.map(blockOf))];
  if (els.length && blocks.length > 1) console.log(c, '->', blocks.join(', '));
});

// 2. horizontal overflow
console.log(document.documentElement.scrollWidth, 'vs',
            document.documentElement.clientWidth);

// 3. broken images
console.log([...document.images].filter(i => i.complete && !i.naturalWidth)
            .map(i => i.src));
```

Known-good result for (1): only `caret` is shared, and that is deliberate —
one component, identical styling, legible on both the dark and sand grounds.

---

## 10. Verified

At 375 / 1440 / 2560: no horizontal overflow, 24 images, 0 broken, correct
`srcset` rendition at each width, hero full-bleed at `left: 0`. Hero scrub
`0px -> 29.8px` radius. Scene scrub `1.0/0/0 -> 0/1.0/0 -> 0/0/1.0`. Counter
reaches 96%. FAQ, marquee, row parallax, drift, both typing demos and the
clip-path reveals all confirmed firing. Text on tinted grounds measures 14:1.

---

## 11. Ceilings

- The pinned scene and the figure drift are desktop-only (>=901px); both have
  static fallbacks below that.
- `prefers-reduced-motion` disables Lenis, the scrub, the parallax and the
  drift, and unstacks the pinned scene.
- Lenis is the only runtime dependency. Without it the page still scrolls —
  `update()` runs from the scroll listener regardless.
- The two heaviest assets are `hero-2400.webp` (701kB, only served above
  1800px) and `row-red-1300.webp` (547kB); both are grainy frames that resist
  WebP. Re-shooting or denoising them is the next win.
