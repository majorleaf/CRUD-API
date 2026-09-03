const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
const { pool, initDb } = require('./db.js');
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

app.get('/tasks', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id');
    res.json({ tasks: result.rows });
});

app.get('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = result.rows[0];
    if (!task) {
        return res.status(404).json({ error: `Task ${id} not found` });
    }
    res.json(task);
});



app.post('/tasks', async (req, res) => {
    const { title, done } = req.body;

    if (!title || String(title).trim() === '') {
        return res.status(400).json({ error: 'title is required and cannot be empty' });
    }

    // default missing/undefined done to false -> 0
    const doneValue = done === true;
    
    const result = await pool.query(
       'INSERT INTO tasks(title, done) VALUES ($1, $2) RETURNING *',
        [String(title).trim(), doneValue]
    );

    res.status(201).json(result.rows[0]);
});

// update and delete
app.put('/tasks/:id', async(req, res) => {
    const id = req.params.id;
    const { title, done } = req.body;

    // 1. Check if the task exists first
    const existingResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const existingTask = existingResult.rows[0];

    if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
    }

    // 2. Prepare the updated values, keeping existing values if not provided in req.body
    const updatedTitle = title !== undefined ? String(title).trim() : existingTask.title;

    
    let updatedDone = existingTask.done;
    if (done !== undefined) {
        updatedDone = (done === true || done === 'true' ); 
    }

    // 3. Apply the same validation rules
    if (updatedTitle === '') {
        return res.status(400).json({ error: 'title cannot be empty' });
    }

    // 4. Update the task in the database
    const updateResult = await pool.query(
        'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
        [updatedTitle, updatedDone, id]
    );

    // 5. Fetch and return the updated task
    
    res.json(updateResult.rows[0]);
});

// DELETE /tasks/:id - Remove a task
app.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id;

    // Execute the delete query. .run() returns an object with a 'changes' property
    // telling us how many rows were affected.
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    // If 0 changes were made, the task didn't exist
    if (result.rowCount === 0) {
        return res.status(404).json({ error: "Task not found" });
    }

    // Send a 204 No Content response for a successful deletion
    res.status(204).send();
});


initDb()
 .then(() => {
    app.listen(port, () => {
    console.log(`server running on port ${port}`);
    });
 })
  .catch((error) => {
    console.log('Failed to initialize database:', error);
    process.exit(1);
  })
