const Logger = require('../../bootstrap/logger');
const {ERROR_CODES,ERROR_TYPES,ERROR_MESSAGES}    = require('../helpers/error-codes')
const xssFilters = require('xss-filters');

module.exports = (error, response) => {
    if(error?.type ==='entity.parse.failed'){
        Logger.error({
            error_type: ERROR_TYPES.VALIDATION_ERROR,
            error_code: ERROR_CODES.INVALID_INPUT,
            message: ERROR_MESSAGES.INVALID_INPUT,
            source_ip: xssFilters.inHTMLData(error.ip) ,
            user_id: xssFilters.inHTMLData(error.userId) || 'N/A',
            request_id: xssFilters.inHTMLData(error.requestId),
        });

        return response.status(400).
        send({
            status: false,
            message: "The request body is invalid."
        });
    }

    const message = {
        message: "Something went wrong.",
    };

    Logger.error({
        error_type: 'Server Error',
        error_code: error.code || 'N/A',
        message: error.message,
        source_ip: xssFilters.inHTMLData(error.ip),
        destination_ip: xssFilters.inHTMLData(error.hostname),
        user_id: error.userId || 'N/A',
        request_id: error.requestId,
    });
    
    if (process.env.ENVIRONMENT === "development") {
        message.error = error.message;
    }
    return response.status(500).send(message);
}