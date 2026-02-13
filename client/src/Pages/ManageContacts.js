// client/src/Pages/ManageContacts.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/* ===================== STYLES ===================== */
const ManageContactsStyles = () => (
  <style>{`
    /* --- BASE CONTAINER --- */
    .contacts-container {
        padding: 100px 1.5rem 2rem; /* Adjusted padding for mobile */
        background: linear-gradient(135deg, rgb(247, 240, 243), rgb(232, 227, 239));
        min-height: 100vh;
        width: 100%;
    }

    .contacts-wrapper {
        max-width: 900px;
        margin: 0 auto;
        background: #fff;
        padding: 2.5rem;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
        width: 100%;
    }

    /* --- TYPOGRAPHY --- */
    .contacts-wrapper h2 {
        text-align: center;
        font-size: 2.2rem;
        color: #b8369a;
        margin-bottom: 0.5rem;
    }

    .subtitle {
        text-align: center;
        color: #6b7280;
        margin-bottom: 2.5rem;
        font-size: 1rem;
    }

    .error-message {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    /* --- LAYOUT GRID (Desktop Default) --- */
    .contacts-content {
        display: grid;
        grid-template-columns: 1fr 1.5fr; /* Side-by-side on desktop */
        gap: 3rem;
        align-items: start;
    }

    /* --- HEADINGS --- */
    .add-contact-form h3,
    .contact-list h3 {
        font-size: 1.3rem;
        color: #b8369a;
        margin-bottom: 1rem;
        border-bottom: 2px solid #f3f4f6;
        padding-bottom: 0.5rem;
    }

    /* --- FORM SECTION --- */
    .add-contact-form form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: #fdfdfd;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #f3f4f6;
    }

    .add-contact-form input {
        width: 100%;
        padding: 0.9rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s;
    }

    .add-contact-form input:focus {
        border-color: #b8369a;
        outline: none;
    }

    .add-contact-form button {
        width: 100%;
        padding: 0.9rem;
        border: none;
        border-radius: 8px;
        background: linear-gradient(90deg, #b8369a, #6a11cb);
        color: white;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    .add-contact-form button:hover {
        opacity: 0.9;
    }

    /* --- CONTACT LIST SECTION --- */
    .contact-list ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .contact-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        margin-bottom: 0.8rem;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        transition: transform 0.1s ease;
    }

    .contact-list li:hover {
        border-color: #b8369a;
    }

    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .contact-info strong {
        color: #111827;
        font-size: 1.05rem;
    }

    .contact-info span {
        color: #6b7280;
        font-size: 0.9rem;
    }

    .delete-btn {
        padding: 0.5rem 1rem;
        border: 1px solid #fee2e2;
        background: #fff;
        color: #dc2626;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        transition: background 0.2s;
    }

    .delete-btn:hover {
        background-color: #fee2e2;
    }

    .empty-text {
        color: #9ca3af;
        text-align: center;
        font-style: italic;
        padding: 2rem 0;
    }

    /* =========================================
       RESPONSIVE MEDIA QUERIES
    ========================================= */

    /* TABLET (Max-Width: 1024px) */
    @media (max-width: 1024px) {
        .contacts-wrapper {
            padding: 2rem;
        }
        
        .contacts-content {
            gap: 2rem;
        }
    }

    /* MOBILE (Max-Width: 768px) */
    @media (max-width: 768px) {
        .contacts-container {
            padding: 90px 1rem 1rem; /* Less padding on sides */
        }

        .contacts-wrapper {
            padding: 1.5rem; /* Compact wrapper */
        }

        .contacts-wrapper h2 {
            font-size: 1.8rem;
        }

        /* CRITICAL: Stack Grid Columns Vertically */
        .contacts-content {
            grid-template-columns: 1fr; 
            gap: 2.5rem;
        }

        /* Order: Show Add Form FIRST, then List below */
        .add-contact-form {
            order: 1; 
        }

        .contact-list {
            order: 2;
        }

        /* Adjust List Items for small width */
        .contact-list li {
            padding: 0.8rem;
        }
    }
  `}</style>
);

/* ===================== COMPONENT ===================== */

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // API URL Config
  const API_URL = 'http://localhost:5000/api/contacts';

  /* -------- FETCH CONTACTS -------- */
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get(API_URL, {
          headers: { 'x-auth-token': token },
        });

        setContacts(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Could not fetch contacts. Please ensure backend is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [navigate]);

  /* -------- ADD CONTACT -------- */
  const handleAddContact = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if(!name.trim() || !phone.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        API_URL,
        { name, phone },
        { headers: { 'x-auth-token': token } }
      );

      // Append new contact to list instead of overwriting whole list (Optimization)
      // Or just use the response if your API returns the full list.
      // Assuming API returns the full updated list based on your previous code:
      setContacts(res.data); 
      
      setName('');
      setPhone('');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.msg || 'Failed to add contact.');
      }
    }
  };

  /* -------- DELETE CONTACT -------- */
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this contact?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_URL}/${id}`, {
        headers: { 'x-auth-token': token },
      });

      setContacts(res.data); // Update list
    } catch (err) {
      setError('Failed to delete contact.');
    }
  };

  /* ===================== UI ===================== */
  return (
    <>
      <ManageContactsStyles />
      <div className="contacts-container">
        <div className="contacts-wrapper">
          <h2>Manage Trusted Contacts</h2>
          <p className="subtitle">
            These contacts will be alerted during emergencies.
          </p>

          {error && <p className="error-message">{error}</p>}

          <div className="contacts-content">
            
            {/* ADD CONTACT FORM */}
            <div className="add-contact-form">
              <h3>Add New Contact</h3>
              <form onSubmit={handleAddContact}>
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <button type="submit">Add Contact</button>
              </form>
            </div>

            {/* CONTACT LIST DISPLAY */}
            <div className="contact-list">
              <h3>Your Contacts</h3>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
              ) : contacts.length === 0 ? (
                <p className="empty-text">No trusted contacts added yet.</p>
              ) : (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact._id}>
                      <div className="contact-info">
                        <strong>{contact.name}</strong>
                        <span>{contact.phone}</span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteContact(contact._id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ManageContacts;