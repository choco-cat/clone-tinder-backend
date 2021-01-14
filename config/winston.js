const appRoot = require('app-root-path');
const winston = require('winston');
// define the custom settings for each transport (file, console)
const options = {
    fileInfo: {
        level: 'info',
        filename: `${appRoot}/logs/info.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true,
    },
    fileError: {
        level: 'error',
        filename: `${appRoot}/logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};
// instantiate a new Winston Logger with the settings defined above
const logger = new winston.createLogger({
    transports: [
        new winston.transports.File(options.fileInfo),
        new winston.transports.File(options.fileError),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});
// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

module.exports = logger;
