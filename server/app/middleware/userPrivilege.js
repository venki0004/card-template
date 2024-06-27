const Logger = require("../../bootstrap/logger");
const NodeCache = require("memory-cache");
const { getSessionId } = require("../helpers/utils");
const {
  ERROR_CODES,
  ERROR_TYPES,
  ERROR_MESSAGES,
} = require("../helpers/error-codes");

async function userPrivilege(request, response, next, module, permission) {
  const sessionId = getSessionId(request);
  let userInfo = NodeCache.get(sessionId);

  if (userInfo) {
    userInfo = JSON.parse(userInfo);
  }

  if (!userInfo) {
    logUnauthorizedError(
      request,
      response,
      ERROR_MESSAGES.UN_AUTHORIZATION_USER
    );
    return response.status(401).send({
      status: false,
      message: "Unauthorized access. Session not found.",
    });
  }

  const moduleMeta = userInfo.permissions.find((x) => x.slug === module);

  if (!moduleMeta || !moduleMeta[permission]) {
    logUnauthorizedError(
      request,
      response,
      ERROR_MESSAGES.UN_AUTHORIZATION_MODULE_ACCESS
    );
    return response.status(401).send({
      status: false,
      message: "Unauthorized access.",
    });
  }

  next();
}

function logUnauthorizedError(request, response, errorMessage) {
  Logger.error({
    error_type: ERROR_TYPES.UN_AUTHORIZATION_ERROR,
    error_code: ERROR_CODES.UN_AUTHORIZATION,
    message: errorMessage,
    source_ip: request.headers["sourceip"] || request.ip,
    user_id: request.user ? request.user.id : undefined,
    request_id: request.requestId,
  });
}

module.exports = userPrivilege;
