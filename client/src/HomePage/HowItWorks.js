
import React from 'react';

// To resolve the compile error, the external CSS file import has been removed. 
// All necessary styles are now embedded directly within this component.
const HowItWorksStyles = () => (
    <style>
        {`
          /* --- How It Works Section Styles --- */
          .how-it-works-section {
            padding: 5rem 3rem;
                   background: linear-gradient(135deg, #f6f2f4ff, #f1ebf9ff);

            text-align: center;
          }

          .how-it-works-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .how-it-works-section h2 {
            font-size: 2.5rem;
            font-weight: 700;
              color: #b8369a;

            margin-bottom: 0.5rem;
          }

          .how-it-works-section .section-subtitle {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 4rem;
          }

          .steps-timeline {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
          }

          .step {
            display: flex;
            flex-direction: column;
            
            align-items: center;
            max-width: 220px; /* Limits the width of each step */
          }

          .step-number {
            width: 60px;
            height: 60px;
            border-radius: 50%;
             background: linear-gradient(90deg, #b8369a, #6a11cb);

            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 1rem;
            box-shadow: 0 4px 15px rgba(184, 54, 154, 0.3);
          }

          .step h3 {
            font-size: 1.3rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
          }

          .step p {
            color: #555;
            line-height: 1.6;
          }

          .arrow-icon {
            margin-top: 20px; /* Aligns arrow with the number circles */
          }


          /* --- Responsive Design --- */
          @media (max-width: 992px) {
            .steps-timeline {
              flex-direction: column;
              align-items: center;
              gap: 2rem;
            }
            
            .arrow-icon {
              transform: rotate(90deg); /* Points arrow downwards */
              margin: 0;
            }

            .step {
              max-width: 400px; /* Allows more text width when stacked */
            }
          }

          @media (max-width: 576px) {
            .how-it-works-section {
              padding: 3rem 1.5rem;
            }
            
            .how-it-works-section h2 {
              font-size: 2rem;
            }
          }
        `}
    </style>
);


// A simple arrow icon to place between steps
const ArrowIcon = () => (
  <svg className="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18l6-6-6-6" stroke="#cccccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HowItWorks = () => {
  return (
    <>
      <HowItWorksStyles />
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <h2>How SafeWalk Works</h2>
          <p className="section-subtitle">
            Simple setup, intelligent protection, instant response.
          </p>

          <div className="steps-timeline">
            {/* Step 1 */}
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up & Add Contacts</h3>
              <p>Create your account and add trusted friends or family as emergency contacts.</p>
            </div>

            <ArrowIcon />

            {/* Step 2 */}
            <div className="step">
              <div className="step-number">2</div>
              <h3>Start a Monitored Trip</h3>
              <p>Share a live location link with your contacts before you start your journey.</p>
            </div>

            <ArrowIcon />

            {/* Step 3 */}
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Instant Help</h3>
              <p>Use the one-tap SOS or rely on the automated safe-check to alert contacts instantly.</p>
            </div>

            <ArrowIcon />

            {/* Step 4 */}
            <div className="step">
              <div className="step-number">4</div>
              <h3>Travel Smarter</h3>
              <p>Check route safety scores and view community-reported incidents before you travel.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorks;

