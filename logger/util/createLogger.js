const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize } = format;
const path = require('path');
const mainDir = path.dirname(require.main.filename);

const logger = (logLevel, logFile) => {

    const myFormat = printf(({ level, label, message, timestamp}) => {
        return `${timestamp} ${level}: ${label}: ${message}`;
    });

    let labelValue = "";
    if (mainDir) {
        labelValue = process.env.LOG_LABEL
    } else {
      labelValue = "defaultLabel"; // Use a default label if LOG_LABEL is not defined
    }

    // Metadata configuration
    // Metadata is passed as a json object in the logs which has a key name meta followed by the data or the object
    // Example : { "meta": {"key": "value"} }
    // Metadata will not be visible in the console logs they are found only in the transport files

    return createLogger({
        level: logLevel,
        format: combine(
            colorize(),
            label({ label: `${labelValue}}`}),
            timestamp({format: "DD/MMM/YYYY - HH:mm:ss"}),
            // Format the metadata object
            format.metadata({ fillExcept: ['message','level', 'timestamp', 'label'] }),
            myFormat
        ),

        transports: [
            new transports.Console(),
            new transports.File({
                filename: logFile,
                format: format.combine(
                    format.json(),
                )
            })
        ],
    });
}

module.exports = logger