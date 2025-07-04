import React from 'react';
export default function Page404() {
  return (
    <div style={{background:'#222',color:'#fff',height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <h1>404 - Dashboard Gonnect Customizado</h1>
      <p>Esta tela é do <b>front-end</b> React. O backend está servindo o build corretamente.</p>
      <p>Se você vê isso, o React Router não encontrou a rota.</p>
      <small>{new Date().toLocaleString()}</small>
    </div>
  );
} 