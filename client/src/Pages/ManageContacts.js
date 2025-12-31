// client/src/Pages/Manage

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/* ===================== STYLES ===================== */
const ManageContactsStyles = () => (
  <style>{`
    .contacts-container {
        padding: 100px 2rem 2rem;
        background: linear-gradient(135deg, rgb(247, 240, 243), rgb(232, 227, 239));
        min-height: calc(100vh - 70px);
    }

    .contacts-wrapper {
        max-width: 900px;
        margin: 0 auto;
        background: #fff;
        padding: 2.5rem;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
    }

    .contacts-wrapper h2 {
        text-align: center;
        font-size: 2.2rem;
        color: #b8369a;
        margin-bottom: 0.5rem;
    }

    .subtitle {
        text-align: center;
        color: #6b7280;
        margin-bottom: 3rem;
    }

    .error-message {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .contacts-content {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 3rem;
    }

    .add-contact-form h3,
    .contact-list h3 {
        font-size: 1.4rem;
        color: #b8369a;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 0.75rem;
    }

    .add-contact-form form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .add-contact-form input {
        padding: 0.8rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1rem;
    }

    .add-contact-form button {
        padding: 0.8rem;
        border: none;
        border-radius: 8px;
        background: linear-gradient(90deg, #b8369a, #6a11cb);
        color: white;
        font-weight: 600;
        cursor: pointer;
    }

    .contact-list ul {
        list-style: none;
        padding: 0;
    }

    .contact-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .contact-info strong {
        color: #111827;
    }

    .contact-info span {
        color: #6b7280;
        font-size: 0.9rem;
    }

    .delete-btn {
        padding: 0.4rem 0.8rem;
        border: 1px solid #fee2e2;
        background: #fff;
        color: #dc2626;
        border-radius: 6px;
        cursor: pointer;
    }

    .delete-btn:hover {
        background-color: #fee2e2;
    }

    .empty-text {
        color: #6b7280;
        text-align: center;
    }

    @media (max-width: 768px) {
        .contacts-content {
            grid-template-columns: 1fr;
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

  // ✅ CORRECT API BASE URL: Must include 'http://'
  // If you are running backend locally, use localhost:5000
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
        // FIX 2: Handle expired token (401) gracefully
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

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        API_URL,
        { name, phone },
        { headers: { 'x-auth-token': token } }
      );

      setContacts(res.data); // Update list with new data
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
            {/* ADD CONTACT */}
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

            {/* CONTACT LIST */}
            <div className="contact-list">
              <h3>Your Contacts</h3>
              {loading ? (
                <p>Loading...</p>
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