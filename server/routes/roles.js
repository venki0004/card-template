"use strict";

const RoleController = require("../app/controllers/RoleController");
const RoleRequest = require("../app/validators/RoleRequest");
const Authenticate = require("../app/middleware/auth");
const userPrivilege = require("../app/middleware/userPrivilege");

/**
 * Defines routes for managing roles, ensuring authentication and validation.
 *
 * @param {Object} router - The Express.js router object.
 * @returns {Object} The router object with defined role routes.
 */
const getRoleRoutes = (router) => {
  router.post(
    "/",
    [
      // Ensure user is authenticated
      Authenticate,
      (req, res, next) => userPrivilege(req, res, next, "roles", "is_write"),
      // Validate role data before creation
      RoleRequest.validateOnStore(),
    ],
    RoleController.create
  );

  // Route for listing all roles (accessible only to authenticated users)
  router.get(
    "/",
    Authenticate,
    (req, res, next) => userPrivilege(req, res, next, "roles", "is_read"),
    RoleController.index
  );

  // Route for retrieving roles for a dropdown menu (authenticated users only)
  router.get(
    "/dropdown",
    Authenticate,
    (req, res, next) => userPrivilege(req, res, next, "roles", "is_read"),
    RoleController.dropdown
  );

  // Route for retrieving modules in system (authenticated users only)
  router.get(
    "/modules",
    Authenticate,
    (req, res, next) => userPrivilege(req, res, next, "roles", "is_read"),
    RoleController.roleModules
  );

  // Route for updating an existing role
  router.put(
    "/:id",
    [
      Authenticate,
      (req, res, next) => userPrivilege(req, res, next, "roles", "is_update"),
      // Validate role data before update
      RoleRequest.validateRole(),
    ],
    RoleController.update
  );

  return router;
};

module.exports = getRoleRoutes;
