import axios from 'axios';
import React, { useState, useEffect } from 'react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    axios.get('/contacts')
      .then(res => setContacts(res.data))
      .catch(() => setContacts([]));
  }, []);
  return (
    <div style={{padding:32}}>
      <h1>Contatos</h1>
      <ul>
        {contacts.map(c => (
          <li key={c._id}>{c.name || c._id} - {c.number}</li>
        ))}
      </ul>
    </div>
  );
} 