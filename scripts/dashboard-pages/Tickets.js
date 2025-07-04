import axios from 'axios';
import React, { useState, useEffect } from 'react';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    axios.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(() => setTickets([]));
  }, []);
  return (
    <div style={{padding:32}}>
      <h1>Tickets</h1>
      <ul>
        {tickets.map(t => (
          <li key={t._id}>{t.subject || t._id} - {t.status}</li>
        ))}
      </ul>
    </div>
  );
} 