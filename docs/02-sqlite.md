# 2. SQLite — Real, Persistent Storage in a Single File

## The problem this solves

Stage 1 proved that memory disappears. SQLite is the simplest possible fix: a real database that lives as one file on disk (`tasks.db`), instead of inside a running process's memory. Stop the server, restart your whole computer even — the file is still there, and everything in it is still there.

## The core building blocks

**A table** is where rows of structured data live. This project defines one:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done  INTEGER NOT NULL DEFAULT 0
);
```

`IF NOT EXISTS` matters more than it looks — it means this line is safe to run on *every single server startup*. The first time, it creates the table. Every time after that, it's a no-op. That's what lets the app "just work" on restart without wiping or duplicating anything.

**Prepared statements** are how this project actually talks to the database, using `?` as a placeholder for real values:

```javascript
db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
```

This isn't just style — it's a security requirement. Never build a SQL query by gluing a variable directly into a string (e.g. `` `WHERE id = ${id}` ``). If `id` ever comes from a user's request, a malicious value like `1; DROP TABLE tasks;` could execute as real SQL. The `?` placeholder tells the database driver "this is data, never code," and it gets escaped automatically.

## A real limitation worth knowing

SQLite has no native boolean type. The `done` column is actually stored as an integer — `0` for false, `1` for true. This project converts that back to a real `true`/`false` at the point where data leaves the database, so API clients never have to know or care about this quirk.

## Why this stage wasn't the final answer

SQLite is a single file, which means it's a single point of failure and doesn't scale to multiple servers reading/writing at once the way a real production system eventually needs. It was the right tool for learning real SQL and real persistence — but the next stage, PostgreSQL, is what production backends actually run.