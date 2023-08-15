export enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  DEBUG = "debug",
}


interface LogEntry {
  message: any;
  params: any[];
  level: LogLevel;
}

class LoggerInstance {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.DEBUG) {
    this.logLevel = logLevel;
  }

  public setLevel(level:LogLevel){
    this.logLevel = level;
  }

  private addEntry(entry: LogEntry) {
    console[entry.level](entry.message, ...entry.params);
  }

  public info(message: any, ...params) {
    if (this.logLevel === "info" || this.logLevel === "debug") {
      this.addEntry({message, params, level: LogLevel.INFO});
    }
  }

  public warn(message: any, ...params) {
    if (this.logLevel !== "error") {
      this.addEntry({message, params, level: LogLevel.WARN});
    }
  }

  public error(message: any, ...params) {
    this.addEntry({message, params, level: LogLevel.ERROR});
  }

  public debug(message: any, ...params) {
    if (this.logLevel === "debug") {
      this.addEntry({message, params, level: LogLevel.DEBUG});
    }
  }
}

export const Logger = new LoggerInstance();
