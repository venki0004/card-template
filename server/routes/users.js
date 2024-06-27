"use strict";

const UserController = require('../app/controllers/UserController');
const UserRequest = require("../app/validators/UserRequest");
const Authenticate = require('../app/middleware/auth');
const userPrivilege = require('../app/middleware/userPrivilege');

/**
 * Defines routes for managing users, ensuring authentication and validation.
 *
 * @param {Object} router - The Express.js router object.
 * @returns {Object} The router object with defined user routes.
 */
const getUserRoutes = (router) => {
    // Route for creating a new user
    router.post(
        '/',
        [
            // Ensure user is authenticated
            Authenticate,
            (req, res, next) => userPrivilege(req, res, next, 'users', 'is_write'),
            // Validate user data before creation
            UserRequest.validateOnStore()
        ],
        UserController.create
    );

    // Route for listing all users (accessible only to authenticated users)
    router.get(
        '/',
        Authenticate,
        (req, res, next) => userPrivilege(req, res, next, 'users', 'is_read'),
        UserController.index
    );

    // Route for retrieving a specific user's details
    router.get(
        '/:id',
        [
            Authenticate,
            (req, res, next) => userPrivilege(req, res, next, 'users', 'is_read'),
            // Validate user existence and access permissions
            UserRequest.validateUser()
        ],
        UserController.show
    );

    // Route for updating an existing user
    router.put(
        '/:id',
        [
            Authenticate,
            (req, res, next) => userPrivilege(req, res, next, 'users', 'is_update'),
            UserRequest.validateUser(),
            UserRequest.validateOnUpdate()
        ],
        UserController.update
    );

    // Route for updating enabled or disabled
    router.patch(
        '/:id',
        [
            Authenticate,
            (req, res, next) => userPrivilege(req, res, next, 'users', 'is_update'),
            UserRequest.validateUser()
        ],
        UserController.updateStatus
    );

     // Route for retrieving a specific user logs
     router.get(
        '/logs/:id',
        [
            Authenticate,
            (req, res, next) => userPrivilege(req, res, next, 'users', 'is_read'),
            // Validate user existence and access permissions
            UserRequest.validateUser()
        ],
        UserController.userLogs
    );

    return router;
};


module.exports = getUserRoutes;
