const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Logger = require("../../bootstrap/logger");
const xssFilters = require('xss-filters');
const {
  ERROR_CODES,
  ERROR_TYPES,
  ERROR_MESSAGES,
} = require("../helpers/error-codes");

async function auth(request, response, next) {
  const authorization = xssFilters.inHTMLData(request.headers["authorization"]);
  const token = authorization?.split(" ")[1];
  
  if (!token) {
    logUnauthorizedError(request, response, ERROR_MESSAGES.UN_AUTHORIZATION_ERROR);
    return response.status(401).send({
      status: false,
      message: "Unauthorized access. Token not found.",
    });
  }

  try {
    var tokenData = jwt.verify(token, process.env.APP_KEY);
    if (!tokenData || !tokenData.id) {
      logUnauthorizedError(request, response, ERROR_MESSAGES.UN_AUTHORIZATION_TOKEN);
      return response.status(401).send({
        status: false,
        message: "Unauthorized access. Token not found.",
      });
    }

    const user = await User.findById(tokenData.id);

    if (!user) {
      logUnauthorizedError(request, response, ERROR_MESSAGES.UN_AUTHORIZATION_USER);
      return response.status(403).send({
        status: false,
        message: "Invalid User",
      });
    }

    if (!user.is_active) {
      logUnauthorizedError(request, response, ERROR_MESSAGES.UN_AUTHORIZATION_USER);
      return response.status(401).send({
        status: false,
        message: "Unauthorized access. Token not found.",
      });
    }

    request.user = user;
  } catch (exception) {
    Logger.error({
      error_type: ERROR_TYPES.INTERNAL_ERROR,
      error_code: ERROR_CODES.INTERNAL_ERROR,
      message: ERROR_MESSAGES.INTERNAL_ERROR_MESSAGE,
      source_ip: request.headers['sourceip'] || request.ip,
      user_id: request.user ? request.user.id : undefined,
      request_id: request.requestId,
    });
    return response.status(403).send({
      status: false,
      message: "Access denied.",
    });
  }
  next();
}

function logUnauthorizedError(request, response, errorMessage) {
  Logger.error({
    error_type: ERROR_TYPES.UN_AUTHORIZATION_ERROR,
    error_code: ERROR_CODES.UN_AUTHORIZATION,
    message: errorMessage,
    source_ip: request.headers['sourceip'] || request.ip,
    user_id: request.user ? request.user.id : undefined,
    request_id: request.requestId,
  });
}

module.exports = auth;
