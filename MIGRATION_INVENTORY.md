# Migration Inventory (Phase 1)

## Legacy FE root path
- `/workspace/CAYR-FE/old-project/web`

## APP pages and page-entry script(s)
- `old-project/web/app/client.html`
  - `old-project/web/app/js/client.js`
  - `old-project/web/admin/js/manageFacilites.js`
- `old-project/web/app/cptService.html`
  - `old-project/web/app/js/cptService.js`
- `old-project/web/app/dashboard.html`
  - `old-project/web/app/js/dashboard.js`
- `old-project/web/app/facilityService.html`
  - `old-project/web/app/js/facilityService.js`
- `old-project/web/app/login.html`
  - `old-project/web/app/js/login.js`
- `old-project/web/app/manageFacilityPhysician.html`
  - `old-project/web/app/js/manageFacilityPhysician.js`
- `old-project/web/app/managePhysicians.html`
  - `old-project/web/app/js/managePhysicians.js`
- `old-project/web/app/orderEntry.html`
  - `old-project/web/app/js/orderEntry.js`
  - `old-project/web/app/orderjs/orderLab.js`
  - `old-project/web/app/orderjs/orderImaging.js`
  - `old-project/web/app/orderjs/orderNursing.js`
  - `old-project/web/app/orderjs/homeHealth.js`
  - `old-project/web/app/orderjs/OrderInformation.js`
- `old-project/web/app/orders.html`
  - `old-project/web/app/js/Orders.js`
  - `old-project/web/common/js/download.js`
- `old-project/web/app/patientDetails.html`
  - `old-project/web/app/js/patientDetails.js`
- `old-project/web/app/reporting.html`
  - No page-specific script file referenced.
- `old-project/web/app/service.html`
  - `old-project/web/app/js/service.js`
- `old-project/web/app/userDBList.html`
  - `old-project/web/app/js/userDBList.js`
- `old-project/web/app/workQueue.html`
  - `old-project/web/app/js/workQueue.js`

## ADMIN pages and page-entry script(s)
- `old-project/web/admin/admin.html`
  - `old-project/web/admin/js/admin.js`
- `old-project/web/admin/manageUser.html`
  - `old-project/web/admin/js/manageUser.js`
- `old-project/web/admin/manageUserGroup.html`
  - `old-project/web/admin/js/manageUserGroup.js`

## Common/layouts list
- `old-project/web/common/layouts/adminSubMenu.html`
- `old-project/web/common/layouts/leftMenu.html`
- `old-project/web/common/layouts/sideMenu.html`
- `old-project/web/common/layouts/topMenu.html`

## Plugin/library list observed in legacy page imports
- `select2` (`select2.min.css`, `select2.min.js`)
- `selectize` (`selectize.css`, `selectize.min.js`)
- `daterangepicker` (`daterangepicker.css`)
- `QCGrid` (`QCGrid.css`, `QCGrid.js`, `QCGridConfiguration.js`)
- `moment` (`moment.min.js`)
- `jQuery UI` (`jquery-ui.min.js`)
- `bootstrap-datepicker` (`bootstrap-datepicker.min.js`)
- `flatDatePicker` (`flatDatePicker.css`, `flatDatePicker.js`)
- `multiselect` (`multiselect.css`, `multiselect.js`)
- `Chart.js` (`chartjs.js`)

## Global CSS list from representative pages
Representative pages used: `app/login.html`, `app/workQueue.html`, `app/facilityService.html`, `admin/admin.html`.

Unique CSS imports across those representative pages:
- `../app/css/app.css`
- `../common/css/CustomTheme.css`
- `../common/css/daterangepicker.css`
- `../common/css/flatDatePicker.css`
- `../common/css/select2.min.css`
- `../common/modxCore/css/QCGrid.css`
- `../common/modxCore/fontawesome-free-6.7.2/css/all.min.css`
- `../common/theme/assets/css/styles.min.css`
- `../common/theme/assets/css/theme.css`
- `css/app.css`
- `css/multiselect.css`
- `css/selectize.css`
