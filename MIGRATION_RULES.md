# Migration Rules (Non-Negotiable)

1. **UI must remain pixel-identical** to legacy. No CSS/HTML “cleanup” is allowed.
2. **Folder structure and public paths must remain the same** as legacy.
3. **HTML filenames and JS entry filenames referenced by those HTML pages must remain unchanged**.
4. **Backend endpoints must remain unchanged** (`/apix/*`), including credentials behavior.
5. **Legacy plugins must remain in use** (e.g., `select2`, `selectize`, `qcgrid`, `daterangepicker`, etc.).
6. **Build output must preserve `/web/**` paths and stable filenames** (no content hashes).
