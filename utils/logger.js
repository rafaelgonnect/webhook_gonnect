const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

/**
 * Sistema de logs para webhook payloads
 */
class WebhookLogger {
  constructor(logDirectory = './Logs') {
    this.logDirectory = logDirectory;
    this.ensureLogDirectory();
  }

  /**
   * Garante que o diretório de logs existe
   */
  async ensureLogDirectory() {
    try {
      await fs.ensureDir(this.logDirectory);
      await fs.ensureDir(path.join(this.logDirectory, 'raw-payloads'));
      await fs.ensureDir(path.join(this.logDirectory, 'processed'));
      await fs.ensureDir(path.join(this.logDirectory, 'errors'));
      console.log('📁 Diretórios de log criados/verificados');
    } catch (error) {
      console.error('❌ Erro ao criar diretórios de log:', error);
    }
  }

  /**
   * Gera nome de arquivo baseado na data
   * @param {string} type - Tipo do log (raw, processed, error)
   * @param {string} action - Ação do webhook (message, tag, file, status)
   * @returns {string} Nome do arquivo
   */
  generateFileName(type, action) {
    const date = moment().format('YYYY-MM-DD');
    const timestamp = moment().format('HHmmss-SSS');
    return `${date}_${action}_${timestamp}.json`;
  }

  /**
   * Salva payload bruto do webhook
   * @param {Object} payload - Payload recebido
   * @param {string} action - Tipo de ação
   */
  async saveRawPayload(payload, action = 'unknown') {
    try {
      const fileName = this.generateFileName('raw', action);
      const filePath = path.join(this.logDirectory, 'raw-payloads', fileName);
      
      const logData = {
        timestamp: moment().toISOString(),
        action: action,
        payload: payload,
        metadata: {
          source: 'whaticket-webhook',
          version: '1.0.0',
          receivedAt: new Date().toISOString()
        }
      };

      await fs.writeJSON(filePath, logData, { spaces: 2 });
      console.log(`📝 Payload bruto salvo: ${fileName}`);
      
      return fileName;
    } catch (error) {
      console.error('❌ Erro ao salvar payload bruto:', error);
      throw error;
    }
  }

  /**
   * Salva dados processados
   * @param {Object} processedData - Dados após processamento
   * @param {string} action - Tipo de ação
   * @param {string} originalFileName - Nome do arquivo original
   */
  async saveProcessedData(processedData, action, originalFileName) {
    try {
      const fileName = this.generateFileName('processed', action);
      const filePath = path.join(this.logDirectory, 'processed', fileName);
      
      const logData = {
        timestamp: moment().toISOString(),
        action: action,
        originalFile: originalFileName,
        processedData: processedData,
        processingInfo: {
          processedAt: new Date().toISOString(),
          success: true
        }
      };

      await fs.writeJSON(filePath, logData, { spaces: 2 });
      console.log(`✅ Dados processados salvos: ${fileName}`);
      
      return fileName;
    } catch (error) {
      console.error('❌ Erro ao salvar dados processados:', error);
      throw error;
    }
  }

  /**
   * Salva logs de erro
   * @param {Error} error - Erro ocorrido
   * @param {Object} payload - Payload que causou o erro
   * @param {string} action - Ação que estava sendo executada
   */
  async saveError(error, payload, action) {
    try {
      const fileName = this.generateFileName('error', action);
      const filePath = path.join(this.logDirectory, 'errors', fileName);
      
      const logData = {
        timestamp: moment().toISOString(),
        action: action,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        payload: payload,
        errorInfo: {
          occurredAt: new Date().toISOString(),
          severity: 'high'
        }
      };

      await fs.writeJSON(filePath, logData, { spaces: 2 });
      console.log(`🚨 Erro registrado: ${fileName}`);
      
      return fileName;
    } catch (logError) {
      console.error('❌ Erro crítico ao salvar log de erro:', logError);
    }
  }

  /**
   * Gera relatório de análise dos logs
   * @param {string} date - Data no formato YYYY-MM-DD (opcional)
   */
  async generateAnalysisReport(date = null) {
    try {
      const targetDate = date || moment().format('YYYY-MM-DD');
      const rawLogsDir = path.join(this.logDirectory, 'raw-payloads');
      const files = await fs.readdir(rawLogsDir);
      
      const dayFiles = files.filter(file => file.startsWith(targetDate));
      
      const analysis = {
        date: targetDate,
        totalEvents: dayFiles.length,
        eventTypes: {},
        hourlyDistribution: {},
        commonPatterns: []
      };

      for (const file of dayFiles) {
        const filePath = path.join(rawLogsDir, file);
        const data = await fs.readJSON(filePath);
        
        // Contar tipos de eventos
        const action = data.action;
        analysis.eventTypes[action] = (analysis.eventTypes[action] || 0) + 1;
        
        // Distribuição por hora
        const hour = moment(data.timestamp).format('HH');
        analysis.hourlyDistribution[hour] = (analysis.hourlyDistribution[hour] || 0) + 1;
      }

      const reportPath = path.join(this.logDirectory, `analysis-report-${targetDate}.json`);
      await fs.writeJSON(reportPath, analysis, { spaces: 2 });
      
      console.log(`📊 Relatório de análise gerado: analysis-report-${targetDate}.json`);
      return analysis;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de análise:', error);
      throw error;
    }
  }
}

// Instância singleton do logger
const logger = new WebhookLogger();

module.exports = {
  WebhookLogger,
  logger
}; 