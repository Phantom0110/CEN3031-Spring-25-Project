import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [newTask, setNewTask] = useState({
    name: '',
    difficulty: 'Easy'
});


    const userId = 2; // Replace this with your logged-in user's ID

const handleAddTask = async (e) => {
    e.preventDefault();

    try {
        // 1. Create challenge
        const challengeResponse = await fetch('http://localhost:3000/challenges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
    name: newTask.name,
    description: '',
    experience_points: getXPFromDifficulty(newTask.difficulty)
})

        });

        const challenge = await challengeResponse.json();

        // 2. Assign challenge to user
        await fetch('http://localhost:3000/assign-challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                challenge_id: challenge.id
            })
        });

        // 3. Add to UI state
        const taskWithMeta = {
            ...newTask,
            id: challenge.id,
            completed: false
        };

        setTasks([...tasks, taskWithMeta]);
        setNewTask({ name: '', difficulty: 'Easy' });
    } catch (err) {
        console.error('Failed to add task:', err);
    }
};

    
const handleCompleteTask = async (userChallengeId) => {
    try {
        await fetch('http://localhost:3000/complete-challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: userChallengeId  // This is the 'id' in user_challenges table
            })
        });

        const taskToComplete = tasks.find(task => task.id === userChallengeId);
        setCompletedTasks([taskToComplete, ...completedTasks]);
        setTasks(tasks.filter(task => task.id !== userChallengeId));
    } catch (err) {
        console.error('Failed to complete task:', err);
    }
};

useEffect(() => {
    async function fetchUserTasks() {
        const res = await fetch(`http://localhost:3000/user-challenges/${userId}`);
        const data = await res.json();

        const incomplete = data.filter(t => !t.completed);
        const complete = data.filter(t => t.completed);

        setTasks(incomplete.map(t => ({
    id: t.id, // use this for the complete endpoint
    challenge_id: t.challenge_id, // store separately for name and difficulty
    name: t.challenge_name,
    difficulty: mapXpToDifficulty(t.experience_points),
})));

setCompletedTasks(complete.map(t => ({
    id: t.id,
    challenge_id: t.challenge_id,
    name: t.challenge_name,
    difficulty: mapXpToDifficulty(t.experience_points),
})));

    }

    fetchUserTasks();
}, []);

// Map difficulty to XP value
    const getXPFromDifficulty = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 50;
            case 'medium': return 100;
            case 'hard': return 200;
            default: return 0;
        }
    };

    const getDifficultyFromXP = (xp) => {
        switch (xp) {
            case 50: return 'Easy';
            case 100: return 'Medium';
            case 200: return 'Hard';
            default: return 'Unknown';
        }
    };
    
    return (
        <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
          
            {/* To-Do Tasks Box */}
            <div style={{ flex: 1, border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h2>To-Do Tasks</h2>
                {tasks.length === 0 ? <p>No tasks yet!</p> : (
                <ul>
                    {tasks.map(task => (
                    <li key={task.id}>
                        <strong>{task.name}</strong> ({task.difficulty})
                        <button onClick={() => handleCompleteTask(task.id)} style={{ marginLeft: '1rem' }}>
                        ✅ Complete
                        </button>
                    </li>
                    ))}
                </ul>
            )}
            <hr />
            
            {/* Add Task Form */}
            <h3>Add Task</h3>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                    type="text"
                    placeholder="Task name"
                    value={newTask.name}
                    onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                    required
                />
                <select value={newTask.difficulty} onChange={e => setNewTask({ ...newTask, difficulty: e.target.value })}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
                <button type="submit">➕ Add Task</button>
            </form>
        </div>
    
        {/* Completed Tasks Box */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h2>Recently Completed</h2>
            {completedTasks.length === 0 ? (
                <p>No completed tasks yet.</p>
            ) : (
                <ul>
                {completedTasks.map(task => (
                    <li key={task.id}>
                    ✅ <strong>{task.name}</strong> ({task.difficulty})
                    </li>
                ))}
                </ul>
            )}
        </div>
    
    </div>
    );
};

export default HomePage;