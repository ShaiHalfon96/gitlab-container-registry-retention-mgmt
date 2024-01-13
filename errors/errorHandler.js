
const errorHandler = (logger, error, next) => {
  logger.error(error);
  process.exit(1);
}; 

module.exports = errorHandler;