# COPY_VENDOR_PLAN (Micro Phase 2.5.0)

Legacy FE root used for inspection: `old-project/web`

## Proposed vendor/plugin copy batches (planning only)

| Batch | Folder (legacy) | Est. files | Approx. size | Why it may be large / risky |
|---|---|---:|---:|---|
| 1 | `common/theme` | ~482 | ~10 MB | Includes built theme bundles and assets. Largest items include `theme.css` (~1.4 MB), `styles.min.css` (~448 KB), and font binaries (`.eot/.ttf/.woff`). |
| 2 | `common/modxCore` | ~2,160 | ~30 MB | Largest tree by count and size. Heavy on SVG icon assets (`~2,063 .svg` files), Font Awesome metadata JSON/YML, and minified JS bundles (`all.min.js`, `solid.min.js`). |
| 3 | `common/js` | ~13 | ~864 KB | Small file count but mostly vendor minified libraries (`jquery-ui.min.js`, `jquery-3.6.0.min.js`, `select2.min.js`, etc.). |
| 4 | `common/css` | ~6 | ~184 KB | Small and straightforward; contains vendor stylesheet bundles such as `all.min.css` and `select2.min.css`. |

## Suggested copy order

1. `common/js` and `common/css` first (smallest/lowest risk).
2. `common/theme` second (contains fonts and bundled theme output).
3. `common/modxCore` last in multiple sub-batches if needed (largest set due to many icon/font assets).

## High-volume or large-asset indicators

- **Images/icons:** `common/modxCore` has a very large SVG set (majority of files).
- **Fonts:** `common/theme/assets/css/fonts` contains large font files (`.eot`, `.ttf`, `.woff`).
- **Minified bundles:** present in all four folders, especially `common/theme` and `common/modxCore`.

> Note: This document is planning-only; no vendor/plugin files were copied in this phase.
