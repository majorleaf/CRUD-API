require('dotenv').config();
const { Pool } = require('pg');


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initDb() {
   //Using the same idea as that of SQLite , create the table if it doesnt exist 
   await pool.query(`
     CREATE TABLE IF NOT EXISTS tasks (
      id serial PRIMARY KEY,
      title text NOT NULL,
      done boolean NOT NULL DEFAULT false

     );
    `);

    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM tasks');

    if (Number(rows[0].count) === 0) {   
        console.log('[db] tasks table is empty - inserting seed tasks');
        await pool.query(`
            INSERT INTO tasks (title, done) VALUES
            ('read a book', false),
            ('trim flowers', false),
            ('walk the dog', false);
        `);
     } else {
        console.log(`[db] tasks table already has ${rows[0].count} row(s) - skipping seed `);
    }
}

module.exports = { pool, initDb };