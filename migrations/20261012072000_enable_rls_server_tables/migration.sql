-- SNITINAV accesses application tables through the server-side Prisma connection.
-- Enable RLS so the public Supabase Data API cannot read or mutate these tables.
-- No policies are added intentionally: the server connection is the only table access path.
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."contents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."faculty" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."menu_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."navigation_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."page_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."admin_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."system_alerts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."admin_sessions" ENABLE ROW LEVEL SECURITY;
