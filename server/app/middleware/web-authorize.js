const { verifySignature } = require('../helpers/string')
const Logger = require("../../bootstrap/logger");
const { ERROR_CODES, ERROR_TYPES, ERROR_MESSAGES} = require("../helpers/error-codes");

async function webAuthorize(request, response, next) {
    const timestamp = request.header('timestamp');
    const oSign = request.header('o-sign');

    if (!timestamp || !oSign) {
        logUnauthorizedError(request, response, ERROR_MESSAGES.UN_AUTHORIZATION_TOKEN);
        return response.status(401).send({
            status: false,
            message: "Unauthorized access. Token not found."
        });
    }

    try {
        const isVerified = await verifySignature(timestamp, oSign, process.env.SHARED_SECRET_KEY);
        if (!isVerified) {
            logUnauthorizedError(request, response, ERROR_MESSAGES.UN_AUTHORIZATION_SIGNATURE);
            return response.status(403).send({
                status: false,
                message: "Invalid signature"
            });
        }
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
            message: "Access denied."
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
        user_id: undefined,
        request_id: request.requestId,
    });
}

module.exports = webAuthorize;
