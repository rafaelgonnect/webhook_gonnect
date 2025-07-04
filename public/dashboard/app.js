const { useState, useEffect } = React;

function ChartCanvas({ id }) {
  return React.createElement('canvas', { id, style: { maxWidth: '600px', marginBottom: '30px' } });
}

function Login({onLogin}){
  const [username,setU]=useState('');
  const [password,setP]=useState('');
  const [error,setE]=useState(null);
  const handle=()=>{
    axios.post('/auth/login',{username,password}).then(r=>{
      localStorage.setItem('token',r.data.token);
      axios.defaults.headers.common['Authorization']='Bearer '+r.data.token;
      onLogin();
    }).catch(err=>setE('Credenciais inválidas'));
  };
  return React.createElement('div',{id:'loginBox'},[
    React.createElement('h3',{key:'h'} ,'Login Admin'),
    error?React.createElement('div',{style:{color:'red'}},error):null,
    React.createElement('label',{key:'l1'},'Usuário'),
    React.createElement('input',{key:'i1',value:username,onChange:e=>setU(e.target.value)}),
    React.createElement('label',{key:'l2'},'Senha'),
    React.createElement('input',{key:'i2',type:'password',value:password,onChange:e=>setP(e.target.value)}),
    React.createElement('button',{key:'b',onClick:handle},'Entrar')
  ]);
}

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/dashboard-api/metrics')
      .then(res => setMetrics(res.data.data))
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    if (metrics) {
      // doughnut tickets status
      const ctx1 = document.getElementById('chartStatus');
      new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: Object.keys(metrics.ticketsStatus),
          datasets: [{
            data: Object.values(metrics.ticketsStatus),
            backgroundColor: ['#facc15','#60a5fa','#34d399']
          }]
        },
        options: { plugins:{legend:{position:'bottom'}} }
      });

      // line tickets per day
      const ctx2 = document.getElementById('chartTicketsDay');
      const labels = metrics.ticketsPerDay.map(i => i._id);
      const dataVals = metrics.ticketsPerDay.map(i => i.total);
      new Chart(ctx2, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label:'Tickets/dia', data: dataVals, borderColor:'#60a5fa', fill:false }]
        }
      });
    }
  }, [metrics]);

  if (error) return React.createElement('div', null, 'Erro: ' + error);
  if (!metrics) return React.createElement('div', null, 'Carregando...');

  return React.createElement('div', null, [
    React.createElement('h3', { key: 'h' }, 'Tickets por Status'),
    React.createElement(ChartCanvas, { key:'c1', id:'chartStatus' }),
    React.createElement('h3', { key:'h2' }, 'Tickets últimos 7 dias'),
    React.createElement(ChartCanvas, { key:'c2', id:'chartTicketsDay' })
  ]);
}

function DashboardWrapper(){
  const [authed,setA]=useState(!!localStorage.getItem('token'));
  useEffect(()=>{
    if(authed){axios.defaults.headers.common['Authorization']='Bearer '+localStorage.getItem('token');}
  },[authed]);
  if(!authed){return React.createElement(Login,{onLogin:()=>setA(true)});} 
  return React.createElement(Dashboard);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(DashboardWrapper)); 