const { useState, useEffect } = React;

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/stats')
      .then(res => setData(res.data.data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return React.createElement('div', null, 'Erro: ' + error);
  if (!data) return React.createElement('div', null, 'Carregando dados...');

  return React.createElement('div', null, [
    React.createElement('h3', { key: 'h' }, 'Visão Geral'),
    React.createElement('pre', { key: 'p' }, JSON.stringify(data, null, 2))
  ]);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Dashboard)); 