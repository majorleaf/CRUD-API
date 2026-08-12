const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
const Database = require('better-sqlite3');
const db = require('./db.js');
const app = express();
const port = 8000;

app.use(express.json());






app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));


app.get('/', (req, res) => {
    res.json({ 
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    })
});

app.get('/health', (req, res) => {
    res.json({
        "status": "okay"
    });
});

app.get('/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks').all();
    res.json({tasks})
});

app.get('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
        return res.status(404).json({ error: `Task ${id} not found`})
    }
    res.json(task);
});

// create 
app.post('/tasks', (req, res) => {
    const { title } = req.body;

    if (title === undefined || title === null || String(title).trim() === '') {
        return res.status(400).json({ error: 'title is required and cannot be empty'});
    }
    const task = { id, title: String(title).trim(), done: false };
    db.prepare('INSERT INTO tasks ( id, title, done) VALUES ( ?, ?, ?)').run(task.id, task.title, task.done);
    res.status(201).json(task);
});

// update and delete
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(
    req.body.title ? String(req.body.title).trim() : undefined,
    req.body.done !== undefined ? !!req.body.done : undefined,
    id
  );

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body ?? {};
  const hasTitle = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'title');
  const hasDone = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'done');

  if (!hasTitle && !hasDone) {
    return res.status(400).json({ error: 'request body must include title and/or done' });
  }

  if (hasTitle) {
    if (title === null || String(title).trim() === '') {
      return res.status(400).json({ error: 'title cannot be empty' });
    }
    task.title = String(title).trim();
  }

  if (hasDone) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'done must be a boolean' });
    }
    task.done = done;
  }

  res.json(task);
});



app.listen(port, () => {
    console.log(`server running on port ${port}`);
});