"use strict";

const StatsController = require('../app/controllers/StatsController');
const Authenticate = require('../app/middleware/auth');
const userPrivilege = require('../app/middleware/userPrivilege');
/**
 * Defines routes for Application Dashboard Statistics, ensuring authentication and validation.
 *
 * @param {Object} router - The Express.js router object.
 * @returns {Object} The router object with defined statistics routes.
 */
const getStatisticsRoutes = (router) => {
    // Route for listing all users (accessible only to authenticated users)
    router.get(
        '/',
        Authenticate,
        (req, res, next) => userPrivilege(req, res, next, 'dashboard', 'is_read'),
        StatsController.index
    );

    // Route for retrieving a specific user's details
    router.get(
        '/stats',
        Authenticate,
        (req, res, next) => userPrivilege(req, res, next, 'dashboard', 'is_read'),
        StatsController.dashboard
    );
    return router;
};

module.exports = getStatisticsRoutes;
