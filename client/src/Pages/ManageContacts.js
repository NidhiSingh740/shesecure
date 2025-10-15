import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// To resolve the file path error, the styles are now embedded directly
// within the component, making it self-contained and runnable.
const ManageContactsStyles = () => (
  <style>{`
    .contacts-container {
        padding: 100px 2rem 2rem 2rem;
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

        margin-top: 0;
        margin-bottom: 0.5rem;
    }

    .subtitle {
        text-align: center;
        color: #6b7280;
        margin-bottom: 3rem;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }

    .error-message {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }

    .contacts-content {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 3rem;
    }

    .add-contact-form h3, .contact-list h3 {
        font-size: 1.4rem;
                 color: #b8369a;

        margin-top: 0;
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
        transition: background-color 0.3s;
    }
    
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
        border-bottom: 1px solid #f3f4f6;
    }

    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }
    
    .contact-info strong { font-weight: 600; color: #111827; }
    .contact-info span { color: #6b7280; font-size: 0.9rem; }

    .delete-btn {
        padding: 0.4rem 0.8rem;
        border: 1px solid #fee2e2;
        background-color: #fff;
        color: #dc2626;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .delete-btn:hover { background-color: #fee2e2; }

    .empty-text {
        color: #6b7280;
    }

    @media (max-width: 768px) {
        .contacts-content { grid-template-columns: 1fr; }
    }
  `}</style>
);

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const res = await axios.get('http://localhost:5000/api/contacts', {
          headers: { 'x-auth-token': token },
        });

        setContacts(res.data);
      } catch (err) {
        setError('Could not fetch contacts. Please ensure your backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [navigate]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setError('');
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/contacts', { name, phone }, {
            headers: { 'x-auth-token': token },
        });
        setContacts(res.data);
        setName('');
        setPhone('');
    } catch (err) {
        setError(err.response?.data?.msg || 'Failed to add contact.');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
        const token = localStorage.getItem('token');
        const res = await axios.delete(`http://localhost:5000/api/contacts/${contactId}`, {
            headers: { 'x-auth-token': token },
        });
        setContacts(res.data);
    } catch (err) {
        setError('Failed to delete contact.');
    }
  };

  return (
    <>
      <ManageContactsStyles />
      <div className="contacts-container">
        <div className="contacts-wrapper">
          <h2>Manage Trusted Contacts</h2>
          <p className="subtitle">These contacts will be alerted in an emergency.</p>
          
          {error && <p className="error-message">{error}</p>}

          <div className="contacts-content">
            <div className="add-contact-form">
              <h3>Add New Contact</h3>
              <form onSubmit={handleAddContact}>
                <input type="text" placeholder="Contact Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <button type="submit">Add Contact</button>
              </form>
            </div>

            <div className="contact-list">
              <h3>Your Contacts</h3>
              {loading ? <p>Loading...</p> : (
                contacts.length === 0 ? <p className="empty-text">No trusted contacts added yet.</p> : (
                  <ul>
                    {contacts.map((contact) => (
                      <li key={contact._id}>
                        <div className="contact-info">
                          <strong>{contact.name}</strong>
                          <span>{contact.phone}</span>
                        </div>
                        <button onClick={() => handleDeleteContact(contact._id)} className="delete-btn">Delete</button>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageContacts;

