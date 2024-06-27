"use strict";

const EmployeeCardController = require("../app/controllers/EmployeeCardController");
const CardPrintRequest = require("../app/validators/CardPrintRequest");
const Authenticate = require('../app/middleware/auth');
const userPrivilege = require("../app/middleware/userPrivilege");

/**
 * Defines routes for managing card requests, enforcing authentication and validation.
 *
 * @param {Object} router - The Express.js router object.
 * @returns {Object} The router object with defined card request routes.
 */
const getCardRoutes = (router) => {
  // Route to access card requests list (authenticated users only)
  router.get("/", Authenticate, 
  (req, res, next) => userPrivilege(req, res, next, "card-requests", "is_read"),
  EmployeeCardController.index);

  // Route to retrieve details of a specific card request (authenticated users only)
  router.get(
    "/:id",
    [
      Authenticate,
      (req, res, next) => userPrivilege(req, res, next, "card-requests", "is_read"),
      // Validate card request existence, integrity, and access permissions
      CardPrintRequest.validateCardRequest()
    ],
    EmployeeCardController.show
  );

  // Route to retrieve qr of specific card request (authenticated users only)
  router.get(
    "/download/:id",
    [
      Authenticate,
      (req, res, next) => userPrivilege(req, res, next, "card-requests", "is_read"),
      // Validate card request existence, integrity, and access permissions
      CardPrintRequest.validateCardRequest()
    ],
    EmployeeCardController.downloadCardQR
  );

  // Route to update the status of specific card request (authenticated users only)
  router.put(
    "/:id",
    [
      Authenticate,
      (req, res, next) => userPrivilege(req, res, next, "card-requests", "is_update"),
      // Validate card request existence, integrity, and access permissions
      CardPrintRequest.validateCardRequest()
    ],
    EmployeeCardController.update
  );

  return router;
};

// Export the function for usage in other parts of the application
module.exports = getCardRoutes;

