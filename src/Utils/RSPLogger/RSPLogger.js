const MAX_RUNTIME_LOG_ENTRIES = 50;

const runtimeIssueBuffer = [];

function pruneLegacyLocalStorageErrorLog() {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('rsp_error_log');
    } catch {
        // ignore storage errors
    }
}

pruneLegacyLocalStorageErrorLog();

function syncRuntimeIssueWindowState() {
    if (typeof window === 'undefined') return;
    window.__RSP_RUNTIME_LOG__ = [...runtimeIssueBuffer];
    const latestError = [...runtimeIssueBuffer].reverse().find((entry) => entry.level === 'error');
    if (latestError) {
        window.__RSP_LAST_ERROR__ = latestError;
    }
}

export function captureRuntimeIssue(entry) {
    if (typeof window === 'undefined') return;

    const payload = {
        level: entry.level === 'warn' ? 'warn' : 'error',
        ...entry,
        route: window.location.pathname + window.location.search,
        host: window.location.host,
        timestamp: new Date().toISOString(),
    };

    runtimeIssueBuffer.push(payload);
    if (runtimeIssueBuffer.length > MAX_RUNTIME_LOG_ENTRIES) {
        runtimeIssueBuffer.splice(0, runtimeIssueBuffer.length - MAX_RUNTIME_LOG_ENTRIES);
    }

    syncRuntimeIssueWindowState();
}

export function captureRuntimeError(entry) {
    captureRuntimeIssue({ ...entry, level: 'error' });
}

export function captureRuntimeWarning(entry) {
    captureRuntimeIssue({ ...entry, level: 'warn' });
}

export function getCapturedErrors() {
    return [...runtimeIssueBuffer].reverse();
}

export function clearCapturedErrors() {
    runtimeIssueBuffer.length = 0;
    delete window.__RSP_LAST_ERROR__;
    window.__RSP_RUNTIME_LOG__ = [];
    window.__RSP_ERROR_LOG__ = [];
}

function formatConsoleArgs(args) {
    return args
        .map((arg) => {
            if (arg instanceof Error) {
                return `${arg.message}\n${arg.stack || ''}`;
            }
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg);
                } catch {
                    return String(arg);
                }
            }
            return String(arg);
        })
        .join(' ');
}

export function installRuntimeConsoleCapture() {
    if (typeof window === 'undefined' || window.__RSP_CONSOLE_CAPTURE__) return;

    window.__RSP_CONSOLE_CAPTURE__ = true;
    const consoleRef = window.console;
    const originalError = consoleRef?.error?.bind(consoleRef);
    const originalWarn = consoleRef?.warn?.bind(consoleRef);
    const isProduction = process.env.NODE_ENV === 'production';

    if (originalError) {
        consoleRef.error = (...args) => {
            captureRuntimeError({ type: 'console.error', message: formatConsoleArgs(args) });
            if (!isProduction) {
                originalError(...args);
            }
        };
    }

    if (originalWarn) {
        consoleRef.warn = (...args) => {
            captureRuntimeWarning({ type: 'console.warn', message: formatConsoleArgs(args) });
            if (!isProduction) {
                originalWarn(...args);
            }
        };
    }
}

class RSPLogger {
    static isDev = process.env.NODE_ENV === 'development';

    static info(message, data) {
        if (this.isDev) {
            console.info(`[INFO] ${message}`, data || '');
        }
    }

    static warn(message, data) {
        const text = `${message}${data ? ` ${String(data)}` : ''}`;
        if (this.isDev) {
            console.warn(`[WARN] ${message}`, data || '');
            return;
        }
        captureRuntimeWarning({ type: 'logger', message: text });
    }

    static error(message, data) {
        const text = `${message}${data ? ` ${String(data)}` : ''}`;
        if (this.isDev) {
            console.error(`[ERROR] ${message}`, data || '');
            return;
        }
        captureRuntimeError({ type: 'logger', message: text });
    }

    static debug(message, data) {
        if (this.isDev) {
            console.debug(`[DEBUG] ${message}`, data || '');
        }
    }
}

export default RSPLogger;
