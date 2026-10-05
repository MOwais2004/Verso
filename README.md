# Verso

A free editorial landing page template, part of our free template series. The demo is a marketing page for Verso, a fictional product that writes a sentence onto every photo in a photographer's archive. Swap in your own copy and pictures and it's yours.

Plain HTML, CSS and JavaScript. No framework, no build step, no package manager.

## What's in it

- **A hero that folds into a card.** It starts full-bleed, then scales down and rounds its corners as you scroll away.
- **A pinned "How it works" section.** The section holds for three screens of scroll while the steps cross-fade. Every scroll animation follows the scroll position instead of toggling a class.
- **A search box that types its own query.** Only the photos that match the query come out of greyscale.
- **"What it wrote."** Raw filenames like `_DSC4471.NEF` sit next to the sentences Verso wrote for them, and each sentence wipes in as its row arrives.
- **A closing drop box that runs a demo.** Hover over it, tap it or drop a folder on it, and it describes a photo on the spot. No files are uploaded or read.
- **The rest of the page:** a client name strip, a 96% counter with photos drifting past it, a full-bleed quote, an FAQ that animates open, and the footer.

It works at phone, laptop and wide-screen sizes. With reduced motion turned on, smooth scrolling and all scroll animations switch off.

## Run it

```bash
npx http-server . -p 8140 -c-1 -s
```

Then open http://localhost:8140. Opening `index.html` directly in a browser also works.

## Files

```
index.html   the markup, 9 sections
style.css    the design tokens and every section's styles
script.js    scroll animations, both typing demos, reveals, FAQ
assets/      WebP photos and the favicon set, all local
```

## Make it yours

- **Colors and spacing.** The tokens are at the top of `style.css`: `--paper`, `--ink`, `--clay` (the one accent color), and `--sp`, which sets the spacing for every section.
- **Photos.** Drop a WebP into `assets/` and update the `src`. In "What it wrote" and Search, each line of copy describes the photo next to it, so change the line along with the photo.
- **Search queries.** In `script.js`, `Q` pairs each typed query with the result cards it lights up.
- **How it works steps.** Add a `.step` and a matching `#media img`. The section's scroll length adjusts automatically.
- **Counters.** Set `data-count` and `data-suffix` on an element and it counts up once when it scrolls into view.

## Built with

- [Fraunces](https://fonts.google.com/specimen/Fraunces) and [DM Mono](https://fonts.google.com/specimen/DM+Mono) from Google Fonts
- [Switzer](https://www.fontshare.com/fonts/switzer) from Fontshare
- [Lenis](https://github.com/darkroomengineering/lenis) 1.1.13 for smooth scrolling. The page still works without it.
- Photos from [Unsplash](https://unsplash.com)

[PROJECT.md](PROJECT.md) covers the design decisions and how the scroll animations work.

---

More free templates: [github.com/MOwais2004](https://github.com/MOwais2004)
