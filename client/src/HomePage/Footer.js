
import React from 'react';

// To resolve the compile error, the styles are now embedded directly within the component.
const FooterStyles = () => (
    <style>
        {`
          /* --- Footer Section Styles --- */
          .site-footer {
            background-color: #474747ff;
            border-top: 1px solid #e9ecef;
            padding: 3rem 2rem 0 2rem;
            color: rgba(254, 254, 255, 1);
            font-size: 0.95rem;
          }

          .footer-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr; /* Four columns */
            gap: 2rem;
            padding-bottom: 2rem;
          }

          .footer-about h3 {
            font-size: 1.5rem;
            font-weight: bold;
            color: rgba(250, 246, 249, 1); /* Brand color */
            margin: 0 0 1rem 0;
          }

          .footer-about p {
            line-height: 1.7;
            max-width: 350px;
          }

          .footer-links h4,
          .footer-social h4 {
            font-size: 1.1rem;
            font-weight: 600;
            color: rgba(237, 238, 239, 1);
            margin-bottom: 1rem;
          }

          .footer-links ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .footer-links li {
            margin-bottom: 0.75rem;
          }

          .footer-links a {
            text-decoration: none;
            color: #eef1f5ff;
            transition: color 0.3s ease;
          }

          .footer-links a:hover {
            color: hsla(315, 25%, 97%, 1.00);
          }

          .social-icons {
            display: flex;
            gap: 1rem;
          }

          .social-icons a {
            color: rgba(250, 253, 255, 1);
            transition: color 0.3s ease;
          }

          .social-icons a:hover {
            color: #b8369a;
          }

          .social-icons svg {
            width: 24px;
            height: 24px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .footer-bottom {
            border-top: 1px solid #e9ecef;
            text-align: center;
            padding: 1.5rem 0;
          }

          /* --- Responsive Design --- */
          @media (max-width: 992px) {
            .footer-container {
              grid-template-columns: 1fr 1fr; /* Two columns for tablets */
            }
          }

          @media (max-width: 768px) {
            .footer-container {
              grid-template-columns: 1fr; /* Single column for mobile */
              text-align: center;
            }
            .footer-about p {
              margin: 0 auto;
            }
            .social-icons {
              justify-content: center;
            }
          }
        `}
    </style>
);


// Social Media Icons (Self-contained SVGs)
const FacebookIcon = () => ( <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg> );
const TwitterIcon = () => ( <svg viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg> );
const InstagramIcon = () => ( <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> );

const Footer = () => {
  return (
    <>
      <FooterStyles />
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-about">
            <h3>Shesecure</h3>
            <p>
              Your personal safety companion, powered by AI to provide intelligent protection and instant peace of mind.
            </p>
          </div>
          <div className="footer-links">
            <h4>Features</h4>
            <ul>
              <li><a href="#features">Live Location Sharing</a></li>
              <li><a href="#features">One-Tap SOS</a></li>
              <li><a href="#features">Route Safety Scores</a></li>
              <li><a href="#features">Incident Reporting</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#press">Press</a></li>
            </ul>
          </div>
          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="https://facebook.com" aria-label="Facebook"><FacebookIcon /></a>
              <a href="https://twitter.com" aria-label="Twitter"><TwitterIcon /></a>
              <a href="https://instagram.com" aria-label="Instagram"><InstagramIcon /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 SafeWalk. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;

