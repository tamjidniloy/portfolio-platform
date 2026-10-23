-- Execute manually after a DBA has provisioned login roles and secrets.
-- Replace the example role names with your deployment's actual runtime role names.
-- DO NOT GRANT private tables to the public reader. No default superuser.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
-- public reader: snapshots and redirects only, no draft/session/contact access.
GRANT USAGE ON SCHEMA public TO devfolio_public_reader;
GRANT SELECT ON public.published_snapshots,public.slug_redirects TO devfolio_public_reader;
-- CMS service: narrow table access still needed for atomic versioned publishing;
-- use a separate non-owner login role; review table-by-table permissions.
GRANT USAGE ON SCHEMA public TO devfolio_cms_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO devfolio_cms_runtime;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO devfolio_cms_runtime;
-- App runtime DB roles must NEVER have CREATE, ALTER, DROP or migration privileges.
