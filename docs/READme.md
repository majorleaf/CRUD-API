# Learning Docs — How This API Was Built, Stage by Stage

This project didn't start as a Postgres-backed, Dockerized, authenticated API. It started as a list in memory that forgot everything on restart. Each stage below solves one real, specific problem the previous stage had — that's the order to read them in if you're trying to actually understand backend development, not just copy the final code.

If you're new to backend development, read these in order. If you already know some of this, jump to whichever stage is new to you.

1. [In-Memory Storage — and why it's not enough](./01-in-memory-storage.md)
2. [SQLite — real, persistent storage in a single file](./02-sqlite.md)
3. [PostgreSQL & Docker — a real database server, anywhere](./03-postgres-and-docker.md)
4. [Authentication — securing an API with Supabase](./04-authentication.md)
5. [Glossary — every term used across these docs](./05-glossary.md)

## The one-sentence version of the whole journey

An API describes **what** your application does. Everything else — where data lives, how it survives restarts, who's allowed to touch it — is a separate decision that can change underneath the API without the API itself changing. That single idea is what every stage below actually demonstrates.