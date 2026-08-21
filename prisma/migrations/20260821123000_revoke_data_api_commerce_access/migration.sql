-- These tables are server-only. RLS already denies access because there are no
-- policies, and the explicit revokes keep them out of Supabase's Data API even
-- if a permissive policy is added later by mistake.
REVOKE ALL ON TABLE "discount_codes" FROM anon, authenticated;
REVOKE ALL ON TABLE "discount_code_tours" FROM anon, authenticated;
REVOKE ALL ON TABLE "global_blackout_dates" FROM anon, authenticated;
