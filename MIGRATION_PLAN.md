# Migration plan

## Current status

- ✅ Login page migrated to React (`/login`)
- ⏳ Dashboard is placeholder
- ⏳ User DB List is placeholder

## Next tasks

1. Port legacy login session/token handling to React context.
2. Migrate dashboard UI and data calls from `old-project/web/app/js/dashboard.js`.
3. Migrate user DB list and routing flow after login command `ShowDBList`.
4. Add shared components for table, loading, and error states.
