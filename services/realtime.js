const { Server } = require('socket.io');
const dashboardController = require('../controllers/dashboardController');

function initRealtime(server){
  const io = new Server(server, {cors:{origin:'*'}});
  console.log('🔌 WebSocket iniciado em /socket.io');

  async function broadcast(){
    const fakeReq={}; const fakeRes={json: (obj)=>obj};
    const metricsRaw = await new Promise((resolve)=>{
      dashboardController.getMetrics(fakeReq,{json:(d)=>resolve(d)});
    });
    io.emit('metrics', metricsRaw.data);
  }

  io.on('connection',(socket)=>{
    console.log('Client conectado', socket.id);
    broadcast();
  });

  setInterval(broadcast, 60000);
}

module.exports = { initRealtime }; 