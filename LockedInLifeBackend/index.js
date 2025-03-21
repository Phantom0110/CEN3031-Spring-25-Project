const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// PostgreSQL Pool (for database connection)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from Neon
  ssl: {
    rejectUnauthorized: false, // This is needed for secure connections with Neon
  },
});

// Testing the database connection
pool.connect()
  .then(() => console.log('Connected to Neon PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Route for testing the API
app.get('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        experience_points INT
      );

      CREATE TABLE IF NOT EXISTS user_challenges (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        challenge_id INT REFERENCES challenges(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE
      );
    `);
    res.json(result);
  } catch (errors) {
    res.status(404).json(errors);
    console.log(errors);
  } finally {
    client.release();
  }
});

// GET: Fetch all challenges
app.get('/challenges', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM challenges');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /users: Fetch all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users'); // Query the database
    res.json(result.rows); // Send the result as a JSON response
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST: Add a new user
app.post('/users', async (req, res) => {
  const { username, email, password_hash } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST: Add a new challenge
app.post('/challenges', async (req, res) => {
  const { name, description, experience_points } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO challenges (name, description, experience_points) VALUES ($1, $2, $3) RETURNING *',
      [name, description, experience_points]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST: Assign a challenge to a user (user_challenges)
app.post('/assign-challenge', async (req, res) => {
  const { user_id, challenge_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO user_challenges (user_id, challenge_id) VALUES ($1, $2) RETURNING *',
      [user_id, challenge_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST: Mark challenge as completed by user
app.post('/complete-challenge', async (req, res) => {
  const { user_id, challenge_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE user_challenges SET completed = true, completed_at = NOW() WHERE user_id = $1 AND challenge_id = $2 RETURNING *',
      [user_id, challenge_id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
