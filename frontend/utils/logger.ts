/**
 * Logger utilitaire pour le frontend
 * Gère les logs de manière centralisée avec niveaux
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
      if (this.isDev) {
        console.log(logMessage, data);
      } else {
        console.log(`${logMessage} ${JSON.stringify(data)}`);
      }
    } else {
      console.log(logMessage);
    }

    // En production, vous pourriez envoyer les logs à un service
    // this.sendToLoggingService(level, message, data);
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // Pour les erreurs non gérées
  captureException(error: Error, context?: string) {
    this.error(`Unhandled exception${context ? ` (${context})` : ''}`, {
      message: error.message,
      stack: error.stack,
    });
  }
}

export const logger = new Logger();
