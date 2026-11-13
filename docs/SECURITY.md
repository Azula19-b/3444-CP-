# Security notes

## Current safeguards

- New passwords are hashed with bcrypt (cost factor 12) and are never returned by the API.
- Signup and login inputs are normalized and validated.
- Login failures do not reveal whether an email address exists.
- SQLite search and write values use parameterized statements.
- Multi-row food inserts use a transaction and roll back on failure.
- CORS allows a configured client origin instead of accepting every origin.
- Express request bodies are limited to 100 KB and its identifying response header is disabled.
- Runtime databases, environment files, account data, logs, dependencies, and archives are ignored by Git.

## Historical data remediation

The repository previously tracked `database.db` and `server/data/users.json`. The user file contained one account-like record, and its password field was not consistently recognizable as a bcrypt hash. The current tree no longer tracks either runtime file and does not expose their values.

Removing a file in a new commit does not remove it from earlier Git objects. Repository administrators should treat historical account data as exposed, invalidate any reused password, and use a coordinated history-cleaning process only after notifying every collaborator. This change intentionally does not rewrite history or authorship.

An unused authentication module also contained a hard-coded JWT secret. That module and dependency were removed because the active application did not issue or verify tokens. Any future token implementation must load a high-entropy secret from the deployment environment and include expiration and verification tests.

## Production gaps

This academic prototype is not production-ready authentication. Before public deployment, add rate limiting, secure server-side sessions or a vetted identity provider, CSRF protection where applicable, account recovery, audit logging that excludes secrets, HTTPS, dependency monitoring, and a managed database with backups.

Report repository security concerns privately to the repository owner rather than opening an issue containing credentials or personal data.
