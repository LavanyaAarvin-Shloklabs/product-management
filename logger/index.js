const devLogger = require('./dev')
const qaLogger = require('./qa')
const productionLogger = require('./production')

let winstonLogger = devLogger();

if (process.env.NODE_ENV === "development") {
    winstonLogger = devLogger()
}

if (process.env.NODE_ENV === "qa") {
    winstonLogger = qaLogger()
}

if (process.env.NODE_ENV === "production") {
    winstonLogger = productionLogger()
}


/** The below is a custom wrapper on top of the winston ZEdge-BillingLogger
 *  This helps the developer to use the ZEdge-BillingLogger like a regular console.log to combine the Strings
 *  You can use to print object easily like ZEdge-BillingLogger.info("Request Body", req.body)
 *  In regular winston the req.body won't be printer.
 *  In this you can add multiple arguments and this wrapper will combine everything
 **/
function customSerializer(obj) {
    // Special handling for Error objects
    if (obj instanceof Error) {
        try {
            return JSON.stringify({
                // Standard Error properties
                message: obj.message,
                name: obj.name,
                stack: obj.stack,

                // Include additional properties from the Error object
                ...obj
            });
        } catch (e) {
            console.log(obj);
            return {
                message: obj.message,
                name: obj.name,
                stack: obj.stack,

                // Include additional properties from the Error object
                ...obj
            };
        }
    }
    const cache = new Set();
    const serialized = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {

            if (cache.has(value)) {
                // Duplicate reference found, avoid infinite loop
                try {
                    // If this value does not reference a parent it can be deduped
                    return JSON.parse(JSON.stringify(value));
                } catch (error) {
                    // Discard key if value cannot be deduped
                    return;
                }
            }
            // Store value in our collection
            cache.add(value);
        }

        return value;
    });
    cache.clear();
    return serialized;
}

class Logger {
    constructor(filename) {
        // Dynamically create methods for each log level
        for (const level of Object.keys(winstonLogger.levels)) {
            this[level] = (...args) => this.log(level, ...args);
        }
        // Store the filename
        this.filename = filename;
    }

    log(level, ...args) {
        let metadata = {};
        if (args.length > 1 && typeof args[args.length - 1] === 'object' && args[args.length - 1].meta) {
            metadata = args.pop();
        }

        const serializedArgs = args.map(arg => {
            return (arg !== null && typeof arg === 'object') ? customSerializer(arg) : arg;
        });

        // Include the filename in the log
        const messageWithFile = `[${this.filename}] ${serializedArgs.join(' ')}`;
        winstonLogger.log(level, messageWithFile, metadata);
    }
}

const path = require('path');

function getFileName(module) {
    // Use the filename from the module object and extract the base name
    return module.filename;
}

// Wrapper function to create a new Logger instance
function createLogger(module) {
    return new Logger(getFileName(module));
}

module.exports = createLogger;