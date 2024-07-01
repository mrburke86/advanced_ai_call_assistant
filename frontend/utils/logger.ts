// frontend/utils/logger.ts
import winston from "winston";
import path from "path";
import fs from "fs";

const logDirectory = path.join(__dirname, "..", "logs");

// Generate today's log file name
const today = new Date();
const logFileName = `current_ai_audio_assistant_${
    today.toISOString().split("T")[0]
}.log`;
const logFilePath = path.join(logDirectory, logFileName);

// Create the log directory if it does not exist
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(
            (info) =>
                `${info.timestamp} | ${info.level.toUpperCase()} | ${
                    info.message
                }`,
        ),
    ),
    transports: [new winston.transports.File({ filename: logFilePath })],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    );
}

export default logger;
