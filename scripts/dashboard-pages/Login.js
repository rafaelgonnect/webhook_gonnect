import axios from 'axios';
import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  function handleSubmit(e) {
    e.preventDefault();
    axios.post('/auth/login', { username: user, password: pass })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setError('');
        if (onLogin) onLogin();
      })
      .catch(() => setError('Login inválido!'));
  }
  return (
    <form onSubmit={handleSubmit} style={{padding:32}}>
      <h1>Login</h1>
      <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Usuário" />
      <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Senha" />
      <button type="submit">Entrar</button>
      {error && <p style={{color:'red'}}>{error}</p>}
    </form>
  );
} 