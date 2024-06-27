"use strict";

const middleware = require('composable-middleware');
const EmployeeCard = require('../models/EmployeeCard');
const Logger = require("../../bootstrap/logger");
const { ERROR_CODES, ERROR_TYPES, ERROR_MESSAGES} = require("../helpers/error-codes");

const validateCardRequest = () => {
    return middleware()
        .use(exists());
}

const exists = () => {
    return async (request, response, next) => {
        const card_request = await EmployeeCard.findOne({id:request.params.id});
        if (!card_request) {
            Logger.error({
                error_type: ERROR_TYPES.NOT_FOUND_ERROR,
                error_code: ERROR_CODES.CARD_REQUEST_NOT_FOUND,
                message:ERROR_MESSAGES.CARD_REQUEST_NOT_FOUND,
                source_ip: request.headers['sourceip'] || request.ip,
                user_id: request.user ? request.user.id : undefined,
                request_id: request.requestId,
            });
            return response.status(404).send({ status:false, message: "Card Request not found" });
        }

        request.card_request = card_request;
        next();
    }
}

module.exports = {
    validateCardRequest
}