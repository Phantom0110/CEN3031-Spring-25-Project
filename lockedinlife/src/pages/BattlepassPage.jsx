import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../styles/BattlepassPage.css';

const milestones = [
  { points: 20, reward: "Mountain theme!" },
  { points: 40, reward: "Blue background!" },
  { points: 60, reward: "Beach theme!" },
  { points: 80, reward: "Red background!" },
  { points: 100, reward: "Unlock mascot!" }
];

const userId = localStorage.getItem("userId");

const BattlepassPage = ({ onRewardUnlock }) => {
  const [userPoints, setUserPoints] = useState(0); // For testing, change to dynamic later
  const [activatedRewards, setActivatedRewards] = useState(() => {
    const storedState = localStorage.getItem('activatedRewards');
    return storedState ? JSON.parse(storedState) : {};
  });

  const { setSidebarImage, setBottomSidebarImage, mascotImage, setMascotImage } = useOutletContext();

    useEffect(() => {
        const fetchUserPoints = async () => {
            try {
                const response = await fetch(`http://localhost:3000/users/${userId}/points`);
                const data = await response.json();
                setUserPoints(data.points);
            } catch (error) {
                console.error('Failed to fetch user points:', error);
            }
        };

        if (userId) {
            fetchUserPoints();
        }
    }, []);


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
        setSidebarImage('src/assets/Themes/2_PurpleMtns/main.png'); // Change sidebar image
        setBottomSidebarImage('src/assets/Themes/2_PurpleMtns/pic2.png'); // Change bottom sidebar image
      }  
      if (points === 40) {
        document.body.style.backgroundImage = 'linear-gradient(rgb(47, 56, 136),rgb(198, 195, 248))';
      }
      if (points === 60) {
        setSidebarImage('src/assets/Themes/3_Beach/main.jpg'); // Change sidebar image
        setBottomSidebarImage('src/assets/Themes/3_Beach/pic2.png'); // Change bottom sidebar image
      }
      if (points === 80) {
        document.body.style.backgroundImage = 'linear-gradient(rgb(136, 47, 47),rgb(248, 195, 195))';
      }
      if (points === 100) {
        setMascotImage('src/assets/lilguy.gif');
      }    
    } else {
      if (points === 20) {
        // Reset sidebar image to default
        setSidebarImage('src/assets/Themes/1_Default/main.png'); // Change sidebar image
        setBottomSidebarImage('src/assets/Themes/1_Default/pic1.jpg'); // Change bottom sidebar image
      }
      if (points === 40) {
        document.body.style.backgroundImage = '';
      }
      if (points === 60) {
        // Reset sidebar image to default
        setSidebarImage('src/assets/Themes/1_Default/main.png'); // Change sidebar image
        setBottomSidebarImage('src/assets/Themes/1_Default/pic1.jpg'); // Change bottom sidebar image
      }
      if (points === 80) {
        document.body.style.backgroundImage = '';
      }
      if (points === 100) {
        setMascotImage(null); // Reset mascot image
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
      <img src={mascotImage} alt="Mascot" style={{ display: mascotImage ? 'block' : 'none', width: '300px', margin: '0 auto'}} />
    </div>
  );
};

export default BattlepassPage;
