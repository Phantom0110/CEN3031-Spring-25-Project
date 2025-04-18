import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../styles/BattlepassPage.css'; // Import the CSS file

const milestones = [
  { points: 20, reward: "New sidebar image!" },
  { points: 40, reward: "Change background!" },
  { points: 60, reward: "Unlock mascot!" },
  { points: 80, reward: "Special avatar item!" },
  { points: 100, reward: "Exclusive profile banner!" }
];

const BattlepassPage = ({ onRewardUnlock }) => {
  const [userPoints, setUserPoints] = useState(45); // For testing, change to dynamic later
  const [activatedRewards, setActivatedRewards] = useState(() => {
    const storedState = localStorage.getItem('activatedRewards');
    return storedState ? JSON.parse(storedState) : {};
  });

  const { setSidebarImage } = useOutletContext(); // Get the function from DashboardLayout

  // Save activated rewards to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('activatedRewards', JSON.stringify(activatedRewards));
  }, [activatedRewards]);

  const handleSwitchToggle = (points) => {
    const updatedRewards = {
      ...activatedRewards,
      [points]: !activatedRewards[points],
    };
    setActivatedRewards(updatedRewards);
  
    // Apply reward actions (example: change background color)
    if (updatedRewards[points]) {
      if (points === 20) {
        setSidebarImage('src/assets/capy.jpg'); // Change sidebar image
      }  
      if (points === 40) {
        document.body.style.backgroundImage = 'linear-gradient(rgb(60, 71, 162),rgb(186, 183, 248))';
      }
    } else {
      if (points === 20) {
        setSidebarImage('src/assets/react.svg');
      }
      if (points === 40) {
        document.body.style.backgroundImage = '';
      }
    }
  };

  const progressPercent = Math.min((userPoints / 100) * 100, 100);

  return (
    <div className="battlepass-container">
      <h1>Battlepass</h1>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${progressPercent}%`,
          }}
        />

        {/* Milestone Points (numbers) on the Bar */}
        {milestones.map((milestone, idx) => {
          const left = `${(milestone.points / 100) * 100}%`;
          const isUnlocked = userPoints >= milestone.points;

          return (
            <div
              key={idx}
              className="milestone-label"
              style={{
                left,
                color: isUnlocked ? '#28753d' : '#888',
                fontWeight: isUnlocked ? 'bold' : 'normal',
              }}
            >
              {milestone.points}
            </div>
          );
        })}
      </div>

      {/* Rewards Row (below the progress bar) */}
      <div className="reward-row">
        {milestones.map((milestone, idx) => {
          const isUnlocked = userPoints >= milestone.points;
          const isActive = activatedRewards[milestone.points];

          return (
            <div key={idx} className="reward-item">
              <div
                className="reward-text"
                style={{
                  color: isUnlocked ? '#84d186' : '#FFFFFF',
                }}
              >
                {milestone.reward}
              </div>

              {isUnlocked && (
                <label className="switch-container">
                  <span className="switch-label">{isActive ? 'On' : 'Off'}</span>
                  <input
                    className="switch-input"
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleSwitchToggle(milestone.points)}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      <p>{userPoints} / 100 points</p>
    </div>
  );
};

export default BattlepassPage;
