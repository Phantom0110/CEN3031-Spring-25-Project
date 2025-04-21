const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

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
        password VARCHAR(255) NOT NULL,
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

      CREATE TABLE IF NOT EXISTS battlepass_levels (
        id               SERIAL PRIMARY KEY,
        level_number     INT    NOT NULL UNIQUE,        -- e.g. 1, 2, 3…
        threshold_points INT    NOT NULL,               -- points required to unlock
        reward_name      VARCHAR(255) NOT NULL,
        reward_details   TEXT,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
   
      CREATE TABLE IF NOT EXISTS user_battlepass_levels (
        id               SERIAL PRIMARY KEY,
        user_id          INT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        level_id         INT    NOT NULL REFERENCES battlepass_levels(id) ON DELETE CASCADE,
        unlocked_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, level_id)
      );

      INSERT INTO battlepass_levels (level_number, threshold_points, reward_name, reward_details)
      VALUES
        (1,   10,  'Background Color',  'Change background to red'),
        (2,   25,  'Mascot Badge', 'Own a mascot badge');
      
      ALTER TABLE user_challenges
        ADD COLUMN completed_at TIMESTAMP;


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
    console.error(err.stack);
    res.status(500).json({ message: err.message });
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

// GET: Get all challenges assigned to a specific user
app.get('/user/:id/challenges', async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT 
        uc.completed,
        uc.challenge_id,
        c.name,
        c.description,
        c.experience_points
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = $1
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user challenges' });
  }
});

// GET: Get current points for a specific user
app.get('/users/:id/points', async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT points FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ points: result.rows[0].points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user points' });
  }
});

// POST: Add a new user
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST: Login (check if username and password match)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Query the database for a user with the given username and password
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND password = $2',
            [username, password] // Check for matching username and password
        );

        if (result.rows.length > 0) {
            // User found, send success response
            res.status(200).json({ message: 'Login successful', userId: result.rows[0].id });
        } else {
            // No user found with those credentials
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) mark as completed
    const upd = await client.query(
      `UPDATE user_challenges
          SET completed = TRUE
        WHERE user_id = $1
          AND challenge_id = $2
       RETURNING id`,
      [user_id, challenge_id]
    );
    if (upd.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No such assigned challenge, or already done.' });
    }

    // 2) fetch how much XP that challenge is worth
    const xpRes = await client.query(
      `SELECT experience_points
         FROM challenges
        WHERE id = $1`,
      [challenge_id]
    );
    const earnedPoints = xpRes.rows[0].experience_points;

    // 3) bump the user's total
    const userRes = await client.query(
      `UPDATE users
          SET points = points + $1
        WHERE id = $2
       RETURNING points AS new_balance`,
      [earnedPoints, user_id]
    );
    const newBalance = userRes.rows[0].new_balance;

    // 4) unlock any newly reachable battlepass levels
    await client.query(
      `INSERT INTO user_battlepass_levels (user_id, level_id)
        SELECT $1, bp.id
          FROM battlepass_levels bp
         WHERE bp.threshold_points <= $2
           AND bp.id NOT IN (
                 SELECT level_id
                   FROM user_battlepass_levels
                  WHERE user_id = $1
               )`,
      [user_id, newBalance]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Challenge completed!',
      earned: earnedPoints,
      balance: newBalance
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// right after you configure `pool` but before app.listen(...)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS battlepass_levels (
        id               SERIAL PRIMARY KEY,
        level_number     INT    NOT NULL UNIQUE,
        threshold_points INT    NOT NULL,
        reward_name      VARCHAR(255) NOT NULL,
        reward_details   TEXT,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS user_battlepass_levels (
        id               SERIAL PRIMARY KEY,
        user_id          INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        level_id         INT NOT NULL REFERENCES battlepass_levels(id) ON DELETE CASCADE,
        unlocked_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, level_id)
      );
      ALTER TABLE user_challenges
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
    `);
    console.log('✅ Schema ensured on startup');
  } catch (e) {
    console.error('Schema sync error:', e.stack);
    process.exit(1);
  }
})();


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
