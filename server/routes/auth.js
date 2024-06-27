"use strict";

const LoginController = require('../app/controllers/LoginController');
const LoginRequest = require('../app/validators/LoginRequest');
const Authenticate = require("../app/middleware/auth");


/**
 * Defines authentication routes for the application.
 *
 * @param {Object} router - The Express.js router object.
 * @returns {Object} The router object with defined authentication routes.
 */
const getAuthRoutes = (router) => {
    // Authentication routes

    // Route for handling user login
    router.post(
        '/api/login',
        LoginRequest,
        LoginController.login,
    );

    router.post('/api/logout', Authenticate,LoginController.logout);
    return router;
};

module.exports = getAuthRoutes;
