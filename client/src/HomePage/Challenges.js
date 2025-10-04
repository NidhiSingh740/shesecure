
import React from 'react';

// To resolve the compile error, the external CSS file import has been
// removed. All the necessary styles are now embedded directly within this
// component, making it self-contained and resolving the path issue.

const ChallengesStyles = () => (
  <style>
    {`
      .challenges-section {
        padding: 5rem 3rem;
                background: linear-gradient(135deg, #f6f2f4ff, #f1ebf9ff);

      }

      .challenges-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4rem;
      }

      .challenges-content {
        flex-basis: 55%;
      }

      .challenges-content h2 {
        font-size: 2.2rem;
        font-weight: 700;
  color: #b8369a;
       
        margin-bottom: 1rem;
      }

      .challenges-content .intro-text {
        font-size: 1.1rem;
        color: #666;
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      .challenges-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .challenges-list li {
        display: flex;
        align-items: left;
        gap: 1rem;
      }

      .challenges-list h3 {
        font-size: 1.2rem;
        font-weight: 600;

        margin: 0 0 0.3rem 0;
      }

      .challenges-list p {
        margin: 0;
      align-items: center;
        color: #555;
      }

      .stat-card {
        flex-basis: 35%;
        background-color: #e6c6c6ff;
        border-radius: 12px;
        padding: 2.5rem;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      }
      
      .stat-card .warning-icon-wrapper {
        display: inline-block;
      }

      .stat-card h3 {
        font-size: 2rem;
        color: #d92121;
        margin: 1rem 0 0.5rem 0;
        font-weight: 700;
      }

      .stat-card p {
        font-size: 1rem;
        color: #555;
        margin: 0;
      }

      @media (max-width: 992px) {
        .challenges-container {
          flex-direction: column;
          gap: 3rem;
        }

        .challenges-content, .stat-card {
          flex-basis: 100%;
        }

        .challenges-content h2 {
          text-align: center;
        }
      }

      @media (max-width: 576px) {
        .challenges-section {
          padding: 3rem 1.5rem;
        }

        .challenges-content h2 {
          font-size: 1.8rem;
        }

        .stat-card {
          padding: 2rem;
        }
      }
    `}
  </style>
);


const BulletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#b8369a" strokeWidth="2"/>
    <path d="M12 7V13" stroke="#b8369a" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill="#b8369a"/>
  </svg>
);

const WarningIcon = () => (
    <div className="warning-icon-wrapper">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L1 21H23L12 2Z" stroke="#ff4d4f" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M11 10V14H13V10H11ZM11 16V18H13V16H11Z" fill="#ff4d4f"/>
        </svg>
    </div>
);


const Challenges = () => {
  return (
    <>
      <ChallengesStyles />
      <section className="challenges-section">
        <div className="challenges-container">
          
          <div className="challenges-content">
            <h2>The Challenge Women Face Daily</h2>
            <p className="intro-text">
             Across India and the world, women often encounter safety concerns while commuting,
              traveling in isolated areas, or being alone at night. 
              Traditional safety apps depend on manual triggers and delayed responses,
               making them unreliable in real emergencies.
            </p>
            <ul className="challenges-list">
              <li>
                <BulletIcon />
               <div>
                  <h3>Manual SOS Activation Required
</h3>
                  <p>Traditional apps need conscious action during a crisis.</p>
                </div>
              </li>
              <li>
                <BulletIcon />
               <div>
                  <h3>Limited Contact Methods</h3>
                  <p>Basic SMS/call features often lack critical context like location.</p>
                </div>
              </li>
              <li>
                <BulletIcon />
                <div>
                  <h3>Limited Sharing Options</h3>
                  <p>Simple call/SMS alerts without live location or context.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="stat-card">
              <WarningIcon />
              <h3>Every 3 Minutes</h3>
              <p>A woman in India faces a safety-related incident.</p>
          </div>

        </div>
      </section>
    </>
  );
};

export default Challenges;

