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
    const id = req.params.id;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
        return res.status(404).json({ error: `Task ${id} not found`})
    }
    res.json(task);
});

app.get('/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY title COLLATE NOCASE ASC').all();
    res.json({ tasks });
});

app.post('/tasks', (req, res) => {
    const { title, done } = req.body;

    if (!title || String(title).trim() === '') {
        return res.status(400).json({ error: 'title is required and cannot be empty' });
    }

    // default missing/undefined done to false -> 0
    const doneValue = (done === true) ? 1 : 0;

    const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    const info = insertStmt.run(String(title).trim(), doneValue);

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
});

// update and delete
app.put('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const { title, done } = req.body;

    // 1. Check if the task exists first
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
    }

    // 2. Prepare the updated values, keeping existing values if not provided in req.body
    const updatedTitle = title !== undefined ? String(title).trim() : existingTask.title;

    // Convert boolean true/false to SQLite's integer 1/0
    let updatedDone = existingTask.done;
    if (done !== undefined) {
        updatedDone = (done === true || done === 'true' || done === 1) ? 1 : 0;
    }

    // 3. Apply the same validation rules
    if (updatedTitle === '') {
        return res.status(400).json({ error: 'title cannot be empty' });
    }

    // 4. Update the task in the database
    const updateStmt = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
    updateStmt.run(updatedTitle, updatedDone, id);

    // 5. Fetch and return the updated task
    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
});

// DELETE /tasks/:id - Remove a task
app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;

    // Execute the delete query. .run() returns an object with a 'changes' property
    // telling us how many rows were affected.
    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const info = deleteStmt.run(id);

    // If 0 changes were made, the task didn't exist
    if (info.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
    }

    // Send a 204 No Content response for a successful deletion
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});