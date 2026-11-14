# Private operation

Node 20 or newer. npm install, then npm run migrate. Without DATABASE_URL the adapter uses PGlite in .data/db. Set DATA_DIR for a separate local database. Never point tests or demo seed at production. npm test uses a disposable directory and clears inherited database settings. npm run seed requires --demo-database for a shared database and is for disposable demos only.

Set DATABASE_URL through your own secret store for PostgreSQL. Remote TLS certificates are verified. Use a private endpoint and a dedicated database owner. The CLI is an owner-operated tool, not a tenant service. RLS is enabled on records with no public policies or grants. Operator labels are supplied text. There is no login, identity proof, tamper-evident journal or per-user authorisation.

Make a database-native backup before changes. For PGlite, stop all processes before copying the data directory. For PostgreSQL, use the provider's backups and test restoring to a separate database. export writes a complete JSON archive for portability and inspection, but it is not a database restore utility. Keep both the archive and source CSVs private. Verify a restored backup with datasets, history and a known estimate before returning it to use.

All writes are transactional. Re-run view and docs after source changes. Old report files remain snapshots. Review retention for source exports, database backups, drafts and rendered reports as well as the database. No automated deletion or outbound transmission runs here. HTML loads a public font stylesheet; use local fonts if the operating environment requires no third-party requests.
