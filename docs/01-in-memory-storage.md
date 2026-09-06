# 1. In-Memory Storage — and why it's not enough

## What this stage looked like

The very first version of this API stored tasks in a plain JavaScript array, sitting in memory:

```javascript
let tasks = [
  { id: 1, title: 'read a book', done: false },
];
```

Every route — `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id` — just read from and wrote to that array directly, using normal array methods like `.find()`, `.push()`, and `.splice()`.

## Why it worked, and why it broke

It worked perfectly well *while the server was running*. You could create tasks, list them, update them, delete them — all correctly.

The moment the server restarted, every task vanished. Not a bug — a direct consequence of how memory works. A running program's memory only exists while that program is alive. Stop the process, and the operating system reclaims that memory instantly. There was never anywhere else the data could have gone.

## The lesson

This is the first and most important distinction in backend development: **your application's logic and your application's data are two separate things, and they don't have to live in the same place.**

An API is a set of promises about behavior — "send me a POST request with a title, and I'll create a task." Nothing in that promise says *where* the task actually gets kept. That's a separate decision, called the storage layer, and it's exactly what the next two stages change — without touching a single API route.

## What actually changed going into the next stage

Nothing about `GET /tasks`, `POST /tasks`, or any other route's *behavior* changed. Only *what happens inside* those routes, underneath the surface, changed — from `tasks.push(newTask)` to a real database write.