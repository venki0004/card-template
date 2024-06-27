"use strict";

const Validator = require("validatorjs");
const middleware = require("composable-middleware");
const Employee = require("../models/Employee");
const Logger = require("../../bootstrap/logger");
const {
  ERROR_CODES,
  ERROR_TYPES,
  ERROR_MESSAGES,
} = require("../helpers/error-codes");
const NodeCache = require("memory-cache");
const { decryptClientData } = require("../helpers/encryption");
const xssFilters = require('xss-filters');

const validateOnStore = () => {
  return middleware().use(validate());
};
const validateEmployee = () => {
  return middleware().use(exists());
};

const exists = () => {
  return async (request, response, next) => {
    const employee = await Employee.findOne({ id: request.params.id });
    if (!employee) {
      Logger.error({
        error_type: ERROR_TYPES.NOT_FOUND_ERROR,
        error_code: ERROR_CODES.EMPLOYEE_NOT_FOUND,
        message: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND,
        source_ip: request.headers['sourceip'] || request.ip,
        user_id: request.user ? request.user.id : undefined,
        request_id: request.requestId,
      });
      return response
        .status(404)
        .send({ status: false, message: "Employee not found" });
    }

    request.employee = employee;
    next();
  };
};
const validate = () => {
  return async (request, response, next) => {
    const payload = request.body;
    const serverPrivateKey = NodeCache.get("privateKey");
    const encryptionPromises = [
      "name",
      "designation",
      "department",
      "primary_phone",
      "email",
      "emp_id",
      "whatsapp_number",
      "blood_group",
    ].map(async (property) => {
      if (payload[property]) {
        payload[property] = await decryptClientData(
          serverPrivateKey,
          request.headers["encrypted-key"],
          payload[property]
        );
      }
    });

    await Promise.all(encryptionPromises);
    const rules = {
      emp_id: "required|max:20",
      name: "string|required|max:150",
      email: "string|max:100|email",
      primary_phone: "string|max:13",
      department: "string|max:100",
      designation: "string|max:100",
      work_location: "string|max:2000",
      whatsapp_number: "string|max:13",
      is_access_card_enabled: "required",
      is_print_dept_designation: "required",
      card_type: "string|required|max:10",
    };

    let validation = new Validator(payload, rules);

    if (validation.fails()) {
      Logger.error({
        error_type: ERROR_TYPES.VALIDATION_ERROR,
        error_code: ERROR_CODES.INVALID_INPUT,
        message: ERROR_MESSAGES.INVALID_INPUT,
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
  };
};

module.exports = {
  validateOnStore,
  validateEmployee,
};
