

"use strict";

const EmployeeCardController = require("../app/controllers/EmployeeCardController");
const webAuthorize = require('../app/middleware/web-authorize');

/**
 * Defines routes for Web Services (card info, card activity logs), ensuring  request validation.
 *
 * @param {Object} router - The Express.js router object.
 * @returns {Object} The router object with defined web-service routes.
 */
const getWebServiceRoutes = (router) => {
    // Route for generate cards excel report.
    router.get(
        '/card-info/:id',
        webAuthorize,
        EmployeeCardController.employeeActiveCardInfo
    );
    // Route for store card activity logs
    router.post(
        '/activity-log',
        webAuthorize,
        EmployeeCardController.storeCardActivityLog
    );

    return router;
};

module.exports = getWebServiceRoutes;
