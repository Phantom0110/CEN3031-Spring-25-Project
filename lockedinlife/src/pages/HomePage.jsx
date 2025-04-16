import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        name: '',
        difficulty: 'Easy',
        dueDate: '',
    });

    const handleAddTask = (e) => {
        e.preventDefault();
        const taskWithId = { ...newTask, id: Date.now(), completed: false };
        setTasks([...tasks, taskWithId]);
        setNewTask({ name: '', difficulty: 'Easy', dueDate: '' });
    };
    
    const handleCompleteTask = (taskId) => {
        const taskToComplete = tasks.find(task => task.id === taskId);
        setCompletedTasks([taskToComplete, ...completedTasks]);
        setTasks(tasks.filter(task => task.id !== taskId));
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
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
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