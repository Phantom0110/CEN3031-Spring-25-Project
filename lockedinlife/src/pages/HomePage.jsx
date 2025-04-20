import React, { useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'https://localhost:3000';

const HomePage = () => {
  const [tasks, setTasks]             = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTask, setNewTask]         = useState({
    name: '',
    difficulty: 'Easy',
    dueDate: '',
  });
  const [loading, setLoading]         = useState(true);
  const userId                        = localStorage.getItem('userId');

  // 1) Load tasks on mount
  useEffect(() => {
    if (!userId) return; 
    axios
      .get(`/users/${userId}/challenges`)
      .then(({ data }) => {
        setTasks(data.filter(t => !t.completed));
        setCompletedTasks(data.filter(t => t.completed));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  // 2) New handleAddTask that POSTs to your backend
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.name) return alert('Please give your task a name.');

    try {
      // 2a) Create a new challenge record
      const { data: createdChallenge } = await axios.post('http://localhost:3000/challenges', {
        name:              newTask.name,
        description:       newTask.difficulty,    // if you want to store difficulty here
        experience_points: 0                      // or map difficulty → XP
      });

      // 2b) Assign that challenge to this user
      await axios.post('/assign-challenge', {
        user_id:      userId,
        challenge_id: createdChallenge.id
      });

      // 2c) (Re)fetch the full list so UI stays in sync
      const { data: all } = await axios.get(`/users/${userId}/challenges`);

      setTasks(all.filter(t => !t.completed));
      setCompletedTasks(all.filter(t => t.completed));
      setNewTask({ name: '', difficulty: 'Easy', dueDate: '' });
    } catch (err) {
      console.error('Failed to add task', err);
      alert('Could not add task. See console.');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!userId)  return <p>Please login first.</p>;

  return (
    <div style={{ display:'flex', gap:'2rem', padding:'2rem' }}>
      {/* To‑Do List */}
      <div style={{ flex:1, border:'1px solid #ccc', padding:'1rem', borderRadius:'8px' }}>
        <h2>To‑Do Tasks</h2>
        {tasks.length === 0
          ? <p>No tasks yet!</p>
          : (
            <ul>
              {tasks.map(t => (
                <li key={t.id}>
                  <strong>{t.name}</strong> — {t.description}
                  <button
                    onClick={() => {/* your complete handler */}}
                    style={{ marginLeft:'1rem' }}
                  >✅ Complete</button>
                </li>
              ))}
            </ul>
          )
        }
        <hr />

        {/* Add Task Form */}
        <h3>Add Task</h3>
        <form onSubmit={handleAddTask} style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          <input
            type="text"
            placeholder="Task name"
            value={newTask.name}
            onChange={e => setNewTask({ ...newTask, name: e.target.value })}
            required
          />
          <select
            value={newTask.difficulty}
            onChange={e => setNewTask({ ...newTask, difficulty: e.target.value })}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
          <button type="submit">➕ Add Task</button>
        </form>
      </div>

      {/* Completed */}
      <div style={{ flex:1, border:'1px solid #ccc', padding:'1rem', borderRadius:'8px' }}>
        <h2>Recently Completed</h2>
        {completedTasks.length === 0
          ? <p>No completed tasks yet.</p>
          : (
            <ul>
              {completedTasks.map(t => (
                <li key={t.id}>
                  ✅ <strong>{t.name}</strong> — completed at{' '}
                  {new Date(t.completed_at).toLocaleString()}
                </li>
              ))}
            </ul>
          )
        }
      </div>
    </div>
  );
};

export default HomePage;
