# Migration TODO Checklist

## Inventory
- [ ] Catalog all legacy HTML pages, JS entry files, CSS, images, fonts, and plugin assets.
- [ ] Map legacy folder structure and `/web/**` public paths.
- [ ] Identify all `/apix/*` backend calls and credential requirements.

## Vite MPA config
- [ ] Configure Vite for multi-page app entries matching legacy HTML filenames.
- [ ] Ensure JS entry filenames used by HTML remain unchanged.
- [ ] Disable hashed filenames and enforce stable output names.

## Asset copy
- [ ] Copy/mirror static assets to preserve exact legacy public paths.
- [ ] Preserve plugin assets and initialization order.
- [ ] Verify `/web/**` output path parity with legacy.

## API wrapper
- [ ] Implement API layer preserving `/apix/*` endpoints exactly.
- [ ] Preserve credentials and request defaults to match legacy behavior.
- [ ] Validate responses/error handling compatibility with existing pages.

## Layouts
- [ ] Reproduce legacy layout templates with pixel-identical output.
- [ ] Keep legacy HTML structure/classes/IDs intact (no cleanup).
- [ ] Confirm plugin hooks/selectors continue to work unchanged.

## Page migrations (list pages)
- [ ] Page: ____________________
- [ ] Page: ____________________
- [ ] Page: ____________________
- [ ] Page: ____________________
- [ ] Page: ____________________

## Visual regression
- [ ] Capture baseline screenshots from legacy pages.
- [ ] Capture migrated screenshots at same viewport/states.
- [ ] Diff images and resolve any pixel-level deviations.
