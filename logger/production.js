const logger = require('./util/createLogger');

const productionLogger = () => logger('warn', 'production.log');

module.exports = productionLogger;