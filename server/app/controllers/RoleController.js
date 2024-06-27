"use strict";

const _ = require("lodash");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const RoleModule = require("../models/RoleModule");
const Log = require("../models/Log");
const {
  ERROR_CODES,
  ERROR_TYPES,
  ERROR_MESSAGES,
} = require("../helpers/error-codes");
const Logger = require("../../bootstrap/logger");
const { handleErrorDbLogger } = require("../helpers/commonErrorLogger");

class RoleController {
  /**
   * List of roles
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async index(request, response) {
    try {
      const roleMeta = await Role.paginate(request);
      roleMeta.data = roleMeta.data.map((x) => {
        x.permissions = x.permissions !== null ? JSON.parse(x.permissions) : [];
        return x;
      });
      return response.status(200).send({
        status: true,
        message: "Role Lists",
        data: roleMeta,
      });
    } catch (exception) {
      handleErrorDbLogger("Role fetching failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Create a new role
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async create(request, response) {
    try {
      if (await Role.findOne({ name: request.body.name })) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.RECORD_DUPLICATION_ERROR,
          message: ERROR_MESSAGES.ROLE_CREATION_FAILED_DUPLICATE_NAME,
          source_ip: request.headers['sourceip'] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });
        return response.status(400).send({
          status: false,
          message:'Role name already exists!',
        });
      }
      let data = _.pick(request.body, ["name", "is_manager"]);
      data["slug"] = data.name.toLowerCase().replace(" ", "_");
      data['created_by'] = request.user.id
      const role = await Role.create(data);
      let permissions = request.body.permissions.map((x) => {
        x["role_id"] = role[0];
        return x;
      });
      await Permission.create(permissions);

      // Log role creation action
      await Log.create({
        user_id: request.user.id,
        module: "ROLES",
        message: "Created new role: " + role.name,
        action_type: "ACTION",
      });

      return response.status(201).send({
        status: true,
        message: "Role created successfully",
      });
    } catch (exception) {
      console.log(exception)
      handleErrorDbLogger("Role creation failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Update the role
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async update(request, response) {
    try {
      const data = _.pick(request.body, ["name", "is_manager", "permissions"]);
      const updated = {
        name: data.name,
        is_manager: data.is_manager,
        updated_by:request.user.id
      };
      let roleExists = await Role.findOne({ name: request.body.name });
      if (roleExists && roleExists.id !== Number(request.params.id)) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.RECORD_DUPLICATION_ERROR,
          message: ERROR_MESSAGES.ROLE_UPDATE_FAILED_DUPLICATE_NAME,
          source_ip: request.headers['sourceip'] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });
        return response.status(400).send({
          status: false,
          message: 'Role name already exists!',
        });
      }

      let result = await Role.updatedRecord(request.params.id, updated);

      await Permission.findByIdAndRemove(request.params.id);
      let permissions = data.permissions.map((x) => {
        x["role_id"] = request.params.id;
        return x;
      });
      await Permission.create(permissions);

      // Log role update action
      await Log.create({
        user_id: request.user.id,
        module: "ROLES",
        message: "Updated existing role: " + updated.name,
        action_type: "ACTION",
      });

      return response.send({
        status: true,
        message: "Role updated successfully",
        data: result,
      });
    } catch (exception) {
      handleErrorDbLogger("Role updation failed", exception, request);

      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Roles dropdown
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async dropdown(request, response) {
    try {
      let result = await Role.dropdown();
      return response.send({
        status: true,
        message: "User roles fetched successfully",
        data: result,
      });
    } catch (exception) {
      handleErrorDbLogger("Role dropdown fetching failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Roles modules dropdown
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async roleModules(request, response) {
    try {
      let result = await RoleModule.list();
      return response.send({
        status: true,
        message: "Modules fetched successfully",
        data: result,
      });
    } catch (exception) {
      handleErrorDbLogger("Role modules fetching failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = RoleController;
