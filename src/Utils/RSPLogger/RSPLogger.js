class RSPLogger {
    static isDev = process.env.NODE_ENV === 'development';
  
    static info(message, data) {
      if (this.isDev) {
        console.info(`[INFO] ${message}`, data || '');
      }
    }
  
    static warn(message, data) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  
    static error(message, data) {
      console.error(`[ERROR] ${message}`, data || '');
    }
  
    static debug(message, data) {
      if (this.isDev) {
        console.debug(`[DEBUG] ${message}`, data || '');
      }
    }
  }
  
  export default RSPLogger;
  