const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const zlib = require('zlib');

const LOG_DIR = path.join(__dirname, '..', 'Logs');

async function rotateLogs() {
  try {
    const files = await fs.readdir(LOG_DIR);
    const now = Date.now();
    await Promise.all(files.map(async (file) => {
      const filePath = path.join(LOG_DIR, file);
      const stat = await fs.stat(filePath);
      // Compress arquivos com mais de 7 dias
      if (stat.isFile() && now - stat.mtimeMs > 7 * 24 * 60 * 60 * 1000 && !file.endsWith('.gz')) {
        const gzPath = filePath + '.gz';
        await new Promise((resolve, reject) => {
          const inp = fs.createReadStream(filePath);
          const out = fs.createWriteStream(gzPath);
          inp.pipe(zlib.createGzip()).pipe(out).on('finish', resolve).on('error', reject);
        });
        await fs.remove(filePath);
      }
    }));
    console.log('🗜️  Log rotation executada');
  } catch (error) {
    console.error('Erro na rotação de logs:', error);
  }
}

function scheduleLogRotation() {
  // Executa diariamente às 02:00
  cron.schedule('0 2 * * *', rotateLogs, { timezone: 'UTC' });
  console.log('⏰ Job de rotação de logs agendado para 02:00 UTC diariamente');
}

module.exports = { scheduleLogRotation }; 