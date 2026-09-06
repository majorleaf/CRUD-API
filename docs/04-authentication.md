# 4. Authentication — Securing an API with Supabase

## The problem this solves

Every stage up to this point had one big, quiet gap: the API was wide open. Anyone who knew the URL could read, create, or delete any task. Real applications restrict actions to specific, verified users — a shop only shows you your own cart, a social app only lets you edit your own posts.

## The trust triangle

Three parties are involved in every authenticated request:

1. **The client** sends a login request directly to Supabase (never to this server) with an email and password.
2. **Supabase**, acting as an **Identity Provider (IdP)**, checks those credentials and — if correct — issues a signed **JWT (JSON Web Token)**, a compact string proving "this really is user X."
3. **This server** never sees the password at all. On every request that needs protecting, the client attaches that JWT, and this server asks Supabase "is this token real and unexpired?" before doing anything else.

This is deliberate: writing password hashing and token signing from scratch is easy to get subtly, dangerously wrong. Handing that responsibility to a dedicated identity provider is the standard, safer approach in real production systems.

## Bearer tokens and the Authorization header

The client sends its token in a specific, standard format:

```
Authorization: Bearer eyJhbGciOiJI...
```

`Bearer` here just means "whoever presents this token gets access" — like a physical bearer bond. This project's middleware extracts and checks that header on every protected request:

```javascript
if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] === '') {
    return res.status(401).json({ error: 'Access token required' });
}
```

Checking `startsWith('Bearer ')` explicitly — not just splitting on a space and hoping — matters. Without that check, a header using a completely different, wrong scheme could still slip through as if it were valid.

## Why the auth check became middleware

Early on, that token-check logic lived directly inside `/protected/profile`. The moment a second protected route was needed (`/protected/dashboard`), copy-pasting that same check into every new route would have gotten messy and error-prone fast.

**Middleware** is a function that runs *before* a route's real logic, and can either let the request continue (`next()`) or stop it early (returning a response itself). Pulling the check out once, into `authMiddleware.js`, and applying it to any route that needs protection means the actual route handlers stay focused purely on their real job:

```javascript
app.get('/protected/profile', requireAuth, async (req, res) => {
    res.status(200).json({ id: req.user.id, email: req.user.email });
});
```

By the time this function body runs, `requireAuth` has already verified the token and attached the real user to `req.user` — the route doesn't re-check anything.

## Authentication vs. Authorization — a distinction worth keeping straight

**Authentication** answers "who is this?" (logging in, verifying a token). **Authorization** answers "what is this specific, known person allowed to do?" (e.g., can this user edit *this* task, or only their own?). This project implements authentication fully; authorization — fine-grained permissions per user — is a natural next step beyond it.