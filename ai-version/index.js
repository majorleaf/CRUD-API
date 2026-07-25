const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// ---------------------------------------------------------------------------
// In-Memory Data Store
// ---------------------------------------------------------------------------
const SEED_TASKS = [
  { id: 1, title: 'Read a book', done: false },
  { id: 2, title: 'Trim flowers', done: false },
  { id: 3, title: 'Walk the dog', done: true }
];

// Create a working copy of the data
const tasks = SEED_TASKS.map((task) => ({ ...task }));

// ---------------------------------------------------------------------------
// Swagger UI Setup
// ---------------------------------------------------------------------------
// Mount the Swagger UI at the /docs route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

// 1. GET / - General API Info
app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    description: 'A simple in-memory CRUD API for tasks',
    docs: 'http://localhost:3000/docs'
  });
});

// 2. GET /tasks - Get all tasks
app.get('/tasks', (req, res) => {
  res.json({ tasks });
});

// 3. GET /tasks/:id - Get a single task by ID
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }

  res.json(task);
});

// 4. POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Basic validation
  if (!title || String(title).trim() === '') {
    return res.status(400).json({ error: 'Title is a required field and cannot be empty.' });
  }

  // Auto-increment ID
  const id = tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1;
  
  const newTask = { 
    id, 
    title: String(title).trim(), 
    done: false // Default new tasks to not done
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 5. PUT /tasks/:id - Update an existing task
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }

  const { title, done } = req.body ?? {};
  const hasTitle = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'title');
  const hasDone = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'done');

  if (!hasTitle && !hasDone) {
    return res.status(400).json({ error: 'Please provide title or done status to update.' });
  }

  if (hasTitle) {
    if (title === null || String(title).trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }
    task.title = String(title).trim();
  }

  if (hasDone) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'Done must be a boolean.' });
    }
    task.done = done;
  }

  res.json(task);
});

// 6. DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }

  // Remove the task from the array
  tasks.splice(index, 1);
  
  // 204 No Content is standard for successful deletions
  res.status(204).send(); 
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});