import axios from 'axios';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    axios.get('/dashboard-api/metrics')
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, []);
  return (
    <div style={{padding:32}}>
      <h1>Dashboard</h1>
      <p><Link to="/dashboard">Ir para Dashboard</Link></p>
      {stats ? (
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      ) : (
        <p>Carregando métricas...</p>
      )}
    </div>
  );
} 