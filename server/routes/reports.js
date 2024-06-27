"use strict";

const ReportController = require('../app/controllers/ReportController');
const Authenticate = require('../app/middleware/auth');
const userPrivilege = require("../app/middleware/userPrivilege");

/**
 * Defines routes for Application Cards Report module, ensuring authentication and validation.
 *
 * @param {Object} router - The Express.js router object.
 * @returns {Object} The router object with defined report routes.
 */
const getReportsRoutes = (router) => {
    // Route for generate cards excel report. (accessible only to authenticated users)
    router.get(
        '/',
        Authenticate,
        (req, res, next) => userPrivilege(req, res, next, "reports", "is_read"),
        ReportController.generateReport
    );
    return router;
};

module.exports = getReportsRoutes;
