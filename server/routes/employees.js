"use strict";
const EmployeeController = require("../app/controllers/EmployeeController");
const EmployeeRequest = require("../app/validators/EmployeeRequest");
const CardPrintRequest = require("../app/validators/CardPrintRequest");
const Authenticate = require("../app/middleware/auth");
const userPrivilege = require("../app/middleware/userPrivilege");

/**
 * Defines routes for managing employees, ensuring authentication and validation.
 *
 * @param {Object} router - The Express.js router object.
 * @returns {Object} The router object with defined employee routes.
 */
const getEmployeeRoutes = (router) => {
  // Route for creating a new employee
  router.post(
    "/",
    [
      // Ensure user is authenticated
      Authenticate,
      (req, res, next) => userPrivilege(req, res, next, "employees", "is_write"),
      // Validate employee data before creation
      EmployeeRequest.validateOnStore(),
    ],
    EmployeeController.create
  );

  // Route for listing all employees (accessible only to authenticated users)
  router.get(
    "/",
    Authenticate,
    (req, res, next) => userPrivilege(req, res, next, "employees", "is_read"),
    EmployeeController.index
  );


  // Route for report download all employees (accessible only to authenticated users)
  router.get(
    "/report/download",
    Authenticate,
    (req, res, next) => userPrivilege(req, res, next, "employees", "is_read"),
    EmployeeController.generateEmployeeReport
  );
  

  // Route for retrieving a specific employee's details
  router.get(
    "/:id",
    [
      Authenticate,
      (req, res, next) => userPrivilege(req, res, next, "employees", "is_read"),
      // Validate employee existence and access permissions
      EmployeeRequest.validateEmployee(),
    ],
    EmployeeController.show
  );

  // Route for bulk upload employees data.
  router.post(
    "/bulk-upload-employees",
    [Authenticate],
    (req, res, next) => userPrivilege(req, res, next, "employees", "is_write"),
    EmployeeController.bulkDataUpload
  );
  // Route for bulk upload employees data.
  router.post(
    "/bulk-image-upload",
    [Authenticate],
    (req, res, next) => userPrivilege(req, res, next, "employees", "is_write"),
    EmployeeController.bulkImageUpload
  );

  // Route for updating an existing employee
  router.put(
    "/:id",
    [Authenticate,EmployeeRequest.validateEmployee(),EmployeeRequest.validateOnStore()],
    (req, res, next) => userPrivilege(req, res, next, "employees", "is_update"),
    EmployeeController.update
  );
  // Route for updating an existing employee
  router.put(
    "/card-print-request/:id",
    [Authenticate, EmployeeRequest.validateEmployee()],
    (req, res, next) => userPrivilege(req, res, next, "employees", "is_update"),
    EmployeeController.employeeCardPrintRequest
  );

  // Route for fetching employee cards
  router.get(
    "/cards/:id",
    [Authenticate, EmployeeRequest.validateEmployee()],
    (req, res, next) => userPrivilege(req, res, next, "employees", "is_read"),
    EmployeeController.getEmployeeCards
  );

  // Route for updating an existing employee
  router.put(
    "/cards/:id",
    [Authenticate, CardPrintRequest.validateCardRequest()],
    (req, res, next) => userPrivilege(req, res, next, "employees", "is_update"),
    EmployeeController.updateEmployeeCardStatus
  );

  return router;
};

// Export the function for usage in other parts of the application
module.exports = getEmployeeRoutes;
