# Verification

2026-11-14: npm install completed with no audit findings. npm test passed 64 checks across 27 CLI commands using a disposable PGlite database on Linux. The suite covers weighted arithmetic, missing responses, small bases, exclusion and policy invalidation, evidence holds, malformed imports, idempotency, private archives, branded renderers and the spawned JSON CLI.

npm run demo, npm run view and npm run docs exercise the synthetic workflow. GitHub Actions runs npm ci, npm test, demo and both renderers on Ubuntu and Windows with Node 22. See the repository Actions tab for the actual matrix result. The migration uses PostgreSQL syntax executed by PGlite. A hosted PostgreSQL instance was not connected during authoring.

The source fixture is synthetic and follows Q's documented CSV export path. No actual customer export was available. The import mapping and selected estimates must be reconciled against a real study before switching.
