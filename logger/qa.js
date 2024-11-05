const logger = require("./util/createLogger");

const qaLogger = () => logger('info', 'qa.log');

module.exports = qaLogger;