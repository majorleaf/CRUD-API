const Database = require('better-sqlite3');

const db = new Database('tasks.db', { verbose: console.log });

// optimized database performance by using PRAGMA statements
db.pragma('journal_mode = WAL');

// create the initialization SQL string
const createTableQuery = `
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    is_completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Execute the query to create the table 
db.exec(createTableQuery);

console.log('Database tasks.db is ready and "tasks" table is configured.');

// Export db connection
module.exports = db;