const Logger = require("../../bootstrap/logger");
const { ERROR_CODES, ERROR_TYPES } = require("../helpers/error-codes");

const handleErrorDbLogger = (errorMessage, exception, request) => {
  Logger.error({
    error_type: ERROR_TYPES.DATABASE_ERROR,
    error_code: ERROR_CODES.DATABASE_ERROR,
    message: `${errorMessage}: Database error occurred - ${exception.message}`,
    source_ip: request.headers['sourceip'] || request.ip,
    user_id: request.user ? request.user.id : undefined,
    request_id: request.requestId,
  });
};

module.exports = { handleErrorDbLogger };
