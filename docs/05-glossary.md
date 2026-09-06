# 5. Glossary

Every term used across these docs, in one place.

**API** — a set of rules describing how a client can ask a server to do something (create a task, log in, etc.), independent of how that server actually stores data or does its work underneath.

**Prepared statement** — a SQL query written with placeholders (`?` in SQLite, `$1` in Postgres) instead of raw values glued into the string. Prevents SQL injection by keeping data and code strictly separate.

**SQL injection** — an attack where untrusted input is interpreted as executable SQL because it was inserted directly into a query string instead of passed as a parameter.

**Image (Docker)** — a frozen, reusable package containing software and everything it needs to run.

**Container (Docker)** — a running instance created from an image.

**Volume (Docker)** — persistent storage that lives outside a container and survives that container being deleted and recreated.

**Docker Compose** — a tool for defining and running a multi-container application (e.g. an API and its database together) from a single YAML file.

**Healthcheck** — a command Docker runs periodically inside a container to determine if the software inside is actually ready to use, not just "started."

**Identity Provider (IdP)** — an external service (Supabase, Auth0, Firebase, etc.) that manages user accounts, passwords, and tokens, so an application's own server never has to.

**JWT (JSON Web Token)** — a compact, signed string used to prove identity between two parties without the receiving server needing to look anything up in a database — the token itself carries the proof.

**Bearer token** — a token where whoever "bears" (presents) it is granted access, typically sent as `Authorization: Bearer <token>`.

**Authentication (AuthN)** — verifying *who* someone is.

**Authorization (AuthZ)** — verifying *what* an already-identified person is allowed to do.

**Middleware** — a function that runs before a route's main logic, able to inspect, modify, block, or allow a request to continue.

**Environment variable** — a configuration value (like a database password or API key) supplied to a running program from outside its code, typically via a `.env` file, kept out of version control.