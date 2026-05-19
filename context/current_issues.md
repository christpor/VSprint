# 🐞 Current Issues & Bug Logs

## Known Critical Issues
*No critical issues reported.*

## Resolved Issues
- **Issue:** AI parsing failures due to non-JSON preamble.
  - **Fix:** Implemented robust JSON extraction using regex-style index searches in `App.tsx`.
- **Issue:** Model Quota Exceeded errors.
  - **Fix:** Added automatic fallback to `gemini-1.5-pro` in the fetch loop.

## Active Warnings
- **Warning:** Supabase session refresh might fail in rare edge cases (refresh_token invalid).
  - **Status:** Mitigation added in `App.tsx` (force signout on error).
