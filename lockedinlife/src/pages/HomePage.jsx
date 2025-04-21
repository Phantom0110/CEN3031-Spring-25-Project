import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        name: '',
        difficulty: 'Easy',
        dueDate: '',
    });

    const userId = localStorage.getItem("userId"); // Get the user ID from localStorage

    useEffect(() => {
        const fetchUserTasks = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/${userId}/challenges`);
                const data = await response.json();

                const xpMap = {
                    10: 'Easy',
                    20: 'Medium',
                    30: 'Hard',
                };

                const parseDueDate = (desc) => {
                    const match = desc.match(/Due (\d{4}-\d{2}-\d{2})/);
                    return match ? match[1] : '';
                };

                const active = [];
                const completed = [];

                data.forEach(challenge => {
                    const task = {
                        id: challenge.challenge_id,
                        name: challenge.name,
                        difficulty: xpMap[challenge.experience_points] || 'Easy',
                        dueDate: parseDueDate(challenge.description),
                    };

                    if (challenge.completed) {
                        completed.push(task);
                    } else {
                        active.push(task);
                    }
                });

                setTasks(active);
                setCompletedTasks(completed);

            } catch (error) {
                console.error('Failed to load user tasks:', error);
            }
        };

        if (userId) {
            fetchUserTasks();
        }
    }, [userId]);


const handleAddTask = async (e) => {
    e.preventDefault();

    try {
        // 1. Map difficulty to XP (can be anything you decide)
        const xpMap = {
            Easy: 10,
            Medium: 20,
            Hard: 30,
        };

const difficultyFromXP = Object.entries(xpMap).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

const extractDueDate = (description) => {
  const match = description.match(/Due (\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
};

        const challengePayload = {
            name: newTask.name,
            description: `Due ${newTask.dueDate}`, // You can customize this
            experience_points: xpMap[newTask.difficulty] || 10,
        };

        // 2. Create the challenge
        const challengeRes = await fetch('http://localhost:3000/challenges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(challengePayload),
        });

        const createdChallenge = await challengeRes.json();

        // 3. Assign challenge to user
        const assignRes = await fetch('http://localhost:3000/assign-challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                challenge_id: createdChallenge.id,
            }),
        });

        if (!assignRes.ok) {
            throw new Error('Failed to assign challenge');
        }

        // 4. Update UI
        const taskWithId = {
            ...newTask,
            id: createdChallenge.id,
            completed: false,
        };
        setTasks([...tasks, taskWithId]);
        setNewTask({ name: '', difficulty: 'Easy', dueDate: '' });

    } catch (error) {
        console.error('Error adding task:', error);
        alert('There was a problem adding the task.');
    }
};

    
    const handleCompleteTask = async (taskId) => {
    const taskToComplete = tasks.find(task => task.id === taskId);

    try {
        const response = await fetch('http://localhost:3000/complete-challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                challenge_id: taskToComplete.id,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to complete challenge');
        }

        console.log('✅ Challenge completed! You earned:', data.earned);

        // Update frontend state
        setCompletedTasks([taskToComplete, ...completedTasks]);
        setTasks(tasks.filter(task => task.id !== taskId));

    } catch (err) {
        console.error('Error completing task:', err);
        alert('Failed to complete task.');
    }
};

    
    return (
        <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
          
            {/* To-Do Tasks Box */}
            <div style={{ flex: 1, border: '3px solid rgba(255, 255, 255, 0.635)', padding: '1rem', borderRadius: '8px' , backgroundColor: 'rgba(224, 211, 233, 0.39)'}}>
                <h2>To-Do Tasks</h2>
                {tasks.length === 0 ? <p>No tasks yet!</p> : (
                <ul>
                    {tasks.map(task => (
                    <li key={task.id}>
                        <strong>{task.name}</strong> ({task.difficulty}) - Due {task.dueDate}
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
                <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    required
                />
                <button type="submit">➕ Add Task</button>
            </form>
        </div>
    
        {/* Completed Tasks Box */}
        <div style={{ flex: 1, border: '3px solid rgba(255, 255, 255, 0.635)', padding: '1rem', borderRadius: '8px' , backgroundColor: 'rgba(224, 211, 233, 0.39)' }}>
            <h2>Recently Completed</h2>
            {completedTasks.length === 0 ? (
                <p>No completed tasks yet.</p>
            ) : (
                <ul>
                {completedTasks.map(task => (
                    <li key={task.id}>
                    ✅ <strong>{task.name}</strong> ({task.difficulty}) - Due {task.dueDate}
                    </li>
                ))}
                </ul>
            )}
        </div>
    
    </div>
    );
};

export default HomePage;