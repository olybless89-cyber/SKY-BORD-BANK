# Auto-Deploy Active
Every push to `main` automatically:
1. Runs SQL migrations in `SQL/supabase/` against the Supabase project named by
   the `SUPABASE_PROJECT_REF` secret. The site embeds project
   `bqlhzfmtrbrbldkoyyri`, so the secret must point at that project (it was
   incorrectly set to `pvpoedxkoyatenqayzyt`, so fixes never reached the site).
2. Frontend is deployed by Vercel's own Git integration (the CI `vercel deploy`
   job was removed — it duplicated the integration and failed on every run).

Last updated: 2026-08-19

