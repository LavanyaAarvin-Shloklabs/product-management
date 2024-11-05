const logger = require('./util/createLogger');

const devLogger = () => logger('debug', 'dev.log');

module.exports = devLogger;

