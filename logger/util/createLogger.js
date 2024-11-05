const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize } = format;
const path = require('path');

const devLogger = () => {

    const myFormat = printf(({ level, label, message, timestamp}) => {
        return `${timestamp} ${level}: ${label}: ${message}`;
    });

    return createLogger({
        level: 'debug',
        format: combine(
            colorize(),
            label({ label: `${process.env.LOG_LABEL}_${path.basename(process.mainModule.filename)}`}),
            timestamp({format: "DD/MMM/YYYY - HH:mm:ss"}),
            // Format the metadata object
            format.metadata({ fillExcept: ['message','level', 'timestamp', 'label'] }),
            myFormat
        ),

        transports: [
            new transports.Console(),
            // new transports.File({
            //     filename: 'errors.log',
            //     format: format.combine(
            //         format.json(),
            //     )
            // })
        ],
    });
}

module.exports = devLogger;