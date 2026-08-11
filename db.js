const Database = require('better-sqlite3');

const db = new Database('tasks.db', { verbose: console.log });

// optimized database performance by using PRAGMA statements
db.pragma('journal_mode = WAL');

// create the initialization SQL string
const createTableQuery = `
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Execute the query to create the table 
db.exec(createTableQuery);

console.log('Database tasks.db is ready and "tasks" table is configured.');


// seed db with 3 example tasks 
// check if there are any existing tasks 
 const count = db.prepare('SELECT count(*) as count FROM tasks').get();

 if (count.count === 0) {
    console.log('Seeding example tasks ');

   const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
 


 const insertMany = db.transaction((tasks) => {
    for (const task of tasks) 
        insertTask.run(task.title, task.done);
 });

  insertMany(exampleTasks);
  console.log('Successfully inserted 3 example tasks.');
} else {
  console.log('Tasks table already contains data. Skipping seed.');
}


 //
// Export db connection
module.exports = db;