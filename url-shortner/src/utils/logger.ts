import { format, transports, createLogger } from "winston"
import { Config } from "../config/config"

const levels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
}

const level = () => {
    const env = process.env.NODE_ENVIRONMENT || 'development'
    const isDevelopment = (env === 'development') || (Config.logLevel === 'debug')
    return isDevelopment ? 'debug' : 'info'
}

let _format
if (Config.enableColorLogging) {
    _format = format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        format.colorize({ all: true }),
        format.printf(
            (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
        )
    )
} else {
    console.log('process.env.NODE_ENVIRONMENT', process.env.NODE_ENVIRONMENT)
    _format = format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        format.printf(
            (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
        )
    )
}

const _transports = [
    new transports.Console(),
    new transports.File({ filename: "logs/info.log", level: "info" }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
]

export const Logger = createLogger({
    level: level(),
    levels,
    format: _format,
    transports: _transports,
    exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
    rejectionHandlers: [new transports.File({ filename: "logs/rejections.log" })],
})
