# Vendor Copy Validation (Micro Phase 2.5.11)

Scope: Validate legacy HTML asset references for three representative pages and confirm whether each referenced vendor/static asset exists under `/web/**`.

## 1) `web/app/login.html`

| Asset reference in HTML | Resolved path under `/web/**` | Exists? |
|---|---|---|
| `../common/theme/assets/images/logos/favicon1.png` | `web/common/theme/assets/images/logos/favicon1.png` | ❌ No |
| `../common/modxCore/js/jquery-3.6.0.min.js` | `web/common/modxCore/js/jquery-3.6.0.min.js` | ✅ Yes |
| `../common/modxCore/js/bootstrap.bundle.min.js` | `web/common/modxCore/js/bootstrap.bundle.min.js` | ✅ Yes |
| `../common/modxCore/js/bootstrap.min.js` | `web/common/modxCore/js/bootstrap.min.js` | ✅ Yes |
| `../common/modxCore/js/AppAsyncCallBack.js` | `web/common/modxCore/js/AppAsyncCallBack.js` | ✅ Yes |
| `../common/modxCore/js/modxAppCore.js` | `web/common/modxCore/js/modxAppCore.js` | ✅ Yes |
| `../common/theme/assets/css/styles.min.css` | `web/common/theme/assets/css/styles.min.css` | ✅ Yes |
| `../common/theme/assets/css/theme.css` | `web/common/theme/assets/css/theme.css` | ✅ Yes |
| `../common/css/CustomTheme.css` | `web/common/css/CustomTheme.css` | ✅ Yes |
| `css/app.css` | `web/app/css/app.css` | ✅ Yes |
| `../common/theme/assets/libs/jquery/dist/jquery.min.js` | `web/common/theme/assets/libs/jquery/dist/jquery.min.js` | ❌ No |
| `../common/theme/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js` | `web/common/theme/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js` | ❌ No |
| `js/login.js` | `web/app/js/login.js` | ❌ No |

Summary for `login.html`: **9 present / 4 missing**.

## 2) `web/app/dashboard.html`

| Asset reference in HTML | Resolved path under `/web/**` | Exists? |
|---|---|---|
| `../common/modxCore/js/jquery-3.6.0.min.js` | `web/common/modxCore/js/jquery-3.6.0.min.js` | ✅ Yes |
| `../common/modxCore/js/bootstrap.bundle.min.js` | `web/common/modxCore/js/bootstrap.bundle.min.js` | ✅ Yes |
| `../common/modxCore/js/bootstrap.min.js` | `web/common/modxCore/js/bootstrap.min.js` | ✅ Yes |
| `../common/modxCore/js/AppAsyncCallBack.js` | `web/common/modxCore/js/AppAsyncCallBack.js` | ✅ Yes |
| `../common/modxCore/js/modxAppCore.js` | `web/common/modxCore/js/modxAppCore.js` | ✅ Yes |
| `../common/theme/assets/css/styles.min.css` | `web/common/theme/assets/css/styles.min.css` | ✅ Yes |
| `../common/theme/assets/css/theme.css` | `web/common/theme/assets/css/theme.css` | ✅ Yes |
| `../common/modxCore/fontawesome-free-6.7.2/css/all.min.css` | `web/common/modxCore/fontawesome-free-6.7.2/css/all.min.css` | ✅ Yes |
| `../common/modxCore/js/chartjs.js` | `web/common/modxCore/js/chartjs.js` | ✅ Yes |
| `../common/css/CustomTheme.css` | `web/common/css/CustomTheme.css` | ✅ Yes |
| `css/app.css` | `web/app/css/app.css` | ✅ Yes |
| `../common/js/core.js` | `web/common/js/core.js` | ✅ Yes |
| `../common/js/loadHtmlCtl.js` | `web/common/js/loadHtmlCtl.js` | ❌ No |
| `../common/theme/assets/libs/jquery/dist/jquery.min.js` | `web/common/theme/assets/libs/jquery/dist/jquery.min.js` | ❌ No |
| `../common/theme/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js` | `web/common/theme/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js` | ❌ No |
| `../common/theme/assets/js/theme.js` | `web/common/theme/assets/js/theme.js` | ✅ Yes |
| `js/dashboard.js` | `web/app/js/dashboard.js` | ❌ No |

Summary for `dashboard.html`: **13 present / 4 missing**.

## 3) `web/admin/admin.html`

| Asset reference in HTML | Resolved path under `/web/**` | Exists? |
|---|---|---|
| `../common/modxCore/js/jquery-3.6.0.min.js` | `web/common/modxCore/js/jquery-3.6.0.min.js` | ✅ Yes |
| `../common/modxCore/js/bootstrap.bundle.min.js` | `web/common/modxCore/js/bootstrap.bundle.min.js` | ✅ Yes |
| `../common/modxCore/js/bootstrap.min.js` | `web/common/modxCore/js/bootstrap.min.js` | ✅ Yes |
| `../common/modxCore/js/AppAsyncCallBack.js` | `web/common/modxCore/js/AppAsyncCallBack.js` | ✅ Yes |
| `../common/modxCore/js/modxAppCore.js` | `web/common/modxCore/js/modxAppCore.js` | ✅ Yes |
| `../common/modxCore/js/QCGrid.js` | `web/common/modxCore/js/QCGrid.js` | ✅ Yes |
| `../app/css/selectize.css` | `web/app/css/selectize.css` | ✅ Yes |
| `../common/modxCore/css/QCGrid.css` | `web/common/modxCore/css/QCGrid.css` | ✅ Yes |
| `../common/theme/assets/css/styles.min.css` | `web/common/theme/assets/css/styles.min.css` | ✅ Yes |
| `../common/theme/assets/css/theme.css` | `web/common/theme/assets/css/theme.css` | ✅ Yes |
| `../common/modxCore/fontawesome-free-6.7.2/css/all.min.css` | `web/common/modxCore/fontawesome-free-6.7.2/css/all.min.css` | ✅ Yes |
| `../common/css/daterangepicker.css` | `web/common/css/daterangepicker.css` | ✅ Yes |
| `../app/css/app.css` | `web/app/css/app.css` | ✅ Yes |
| `../common/css/CustomTheme.css` | `web/common/css/CustomTheme.css` | ✅ Yes |
| `../common/js/core.js` | `web/common/js/core.js` | ✅ Yes |
| `../common/js/loadHtmlCtl.js` | `web/common/js/loadHtmlCtl.js` | ❌ No |
| `../common/theme/assets/libs/jquery/dist/jquery.min.js` | `web/common/theme/assets/libs/jquery/dist/jquery.min.js` | ❌ No |
| `../common/theme/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js` | `web/common/theme/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js` | ❌ No |
| `../common/theme/assets/js/template.js` | `web/common/theme/assets/js/template.js` | ✅ Yes |
| `../common/theme/assets/js/theme.js` | `web/common/theme/assets/js/theme.js` | ✅ Yes |
| `../common/js/jquery-3.6.0.min.js` | `web/common/js/jquery-3.6.0.min.js` | ✅ Yes |
| `../common/js/multiselect.js` | `web/common/js/multiselect.js` | ✅ Yes |
| `../common/js/jquery-ui.min.js` | `web/common/js/jquery-ui.min.js` | ✅ Yes |
| `../common/js/selectize.min.js` | `web/common/js/selectize.min.js` | ✅ Yes |
| `../common/js/moment.min.js` | `web/common/js/moment.min.js` | ✅ Yes |
| `../common/js/bootstrap-datepicker.min.js` | `web/common/js/bootstrap-datepicker.min.js` | ✅ Yes |
| `js/admin.js` | `web/admin/js/admin.js` | ❌ No |

Summary for `admin.html`: **23 present / 4 missing**.

---

## Notes
- No HTML files were modified in this phase.
- Validation checks were performed against the current working tree paths under `/workspace/CAYR-FE/web/**`.
