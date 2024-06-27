const Validator = require('validatorjs');
const Logger = require("../../bootstrap/logger");
const { ERROR_CODES, ERROR_TYPES, ERROR_MESSAGES} = require("../helpers/error-codes");
const NodeCache = require("memory-cache");
const { decryptClientData } = require("../helpers/encryption");
const xssFilters = require('xss-filters');

module.exports = async (request, response, next) => {

    const serverPrivateKey = NodeCache.get("privateKey");
    if(request.body['user_secret']){
        request.body['user_secret'] = await decryptClientData(serverPrivateKey,request.headers["encrypted-key"],request.body.user_secret)
    }
    if(request.body['email']){
        request.body['email'] = await decryptClientData(serverPrivateKey,request.headers["encrypted-key"],request.body.email)
    }

    let validation = new Validator(request.body, {
        'email': 'required|email|max:255',
        'user_secret': 'required|min:8|max:14',
    });

    if (validation.fails()) {
        Logger.error({
            error_type: ERROR_TYPES.VALIDATION_ERROR,
            error_code: ERROR_CODES.INVALID_INPUT,
            message:ERROR_MESSAGES.INVALID_INPUT,
            source_ip: request.headers['sourceip'] || request.ip,
            user_id: request.user ? request.user.id : undefined,
            request_id: request.requestId,
        });
        const escapedErrors = {};
        for (let field in validation.errors.errors) {
            escapedErrors[field] = validation.errors.errors[field].map(xssFilters.inHTMLData);
        }
        return response.status(400).send({
            status: false,
            message: "Uh ooh! Please check the errors",
            errors: escapedErrors
        });
    }

    next();
}