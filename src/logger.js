const { createLogger, transports, format, info } = require('winston');
const LOGGER_LEVEL = {
    INFO: "info",
    DEBUG: "debug"
}
function initLogger(appName, level=LOGGER_LEVEL.INFO){
    const logFormat = format.printf(info => {
        const padEnd = 5;
        const formattedDate = info.timestamp.padEnd(padEnd).replace('T', ' ').replace('Z', '');
        return `${formattedDate} ${info.level.padEnd(padEnd).toUpperCase()} [${appName}] ${info.message}`;
    });


    const logger = createLogger({
    format: format.combine(format.timestamp(),logFormat),
    level: level,
    transports: [
        new transports.Console(),
        new transports.File({ filename: `./logs/${appName}.log`})
    ]
    });
    return logger;
}

module.exports = {initLogger, LOGGER_LEVEL};