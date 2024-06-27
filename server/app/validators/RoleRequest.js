"use strict";

const Validator = require('validatorjs'),
middleware = require('composable-middleware');
const Role = require('../models/Role');
const Logger = require("../../bootstrap/logger");
const { ERROR_CODES, ERROR_TYPES, ERROR_MESSAGES} = require("../helpers/error-codes");
const xssFilters = require('xss-filters');

const validateOnStore = () => {
    return middleware()
        .use(validate());
}
const validateRole = () => {
    return middleware()
        .use(exists());
}

const exists = () => {
    return async (request, response, next) => {
        const role = await Role.findOne({id:request.params.id});
        if (!role) {

            Logger.error({
                error_type: ERROR_TYPES.NOT_FOUND_ERROR,
                error_code: ERROR_CODES.ROLE_NOT_FOUND,
                message:ERROR_MESSAGES.ROLE_NOT_FOUND,
                source_ip: request.headers['sourceip'] || request.ip,
                user_id: request.user ? request.user.id : undefined,
                request_id: request.requestId,
            });
            return response.status(404).send({ status:false, message: "Role not found" });
        }

        request.role = role;
        next();
    }
}


const validate = () => {
    return async (request, response, next) => {
        const rules = {
            name: 'required|max:100',
            is_manager: 'required|boolean',
            permissions: 'required|array',
        };
    
        let validation = new Validator(request.body, rules);
    
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
}

module.exports = {
    validateOnStore,
    validateRole
}