import axios from 'axios';
import React, { useEffect, useState } from 'react';

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
      {stats ? (
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      ) : (
        <p>Carregando métricas...</p>
      )}
    </div>
  );
} 