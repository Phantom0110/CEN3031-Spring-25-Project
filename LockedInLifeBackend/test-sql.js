// test-sql.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    // A) mark as completed
    console.log('Running UPDATE user_challenges …');
    await pool.query(`
      UPDATE user_challenges
         SET completed = TRUE
       WHERE user_id = 1
         AND challenge_id = 1
     RETURNING id;
    `);
    console.log('✔ UPDATE user_challenges succeeded');

    // B) fetch XP
    console.log('Running SELECT experience_points …');
    const xpRes = await pool.query(`
      SELECT experience_points
        FROM challenges
       WHERE id = 1;
    `);
    console.log('✔ SELECT succeeded, XP =', xpRes.rows[0].experience_points);

    // C) bump user points
    console.log('Running UPDATE users …');
    await pool.query(`
      UPDATE users
         SET points = points + 10
       WHERE id = 1
     RETURNING points;
    `);
    console.log('✔ UPDATE users succeeded');

    // D) unlock levels
    console.log('Running INSERT INTO user_battlepass_levels …');
    await pool.query(`
      INSERT INTO user_battlepass_levels (user_id, level_id)
      SELECT 1, bp.id
        FROM battlepass_levels bp
       WHERE bp.threshold_points <= 10
         AND bp.id NOT IN (
               SELECT level_id
                 FROM user_battlepass_levels
                WHERE user_id = 1
             );
    `);
    console.log('✔ INSERT user_battlepass_levels succeeded');

  } catch (err) {
    console.error('❌ Error running SQL:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
})();
