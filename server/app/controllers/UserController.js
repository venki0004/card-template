"use strict";

const _ = require("lodash");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Log = require("../models/Log");
const {
  ERROR_CODES,
  ERROR_TYPES,
  ERROR_MESSAGES,
} = require("../helpers/error-codes");
const Logger = require("../../bootstrap/logger");
const { handleErrorDbLogger } = require("../helpers/commonErrorLogger");
const crypto = require("crypto");
const NodeCache = require("memory-cache");
const { encryptKey, encryptClientData } = require("../helpers/encryption");
const { getClientId } = require("../helpers/utils");

class UserController {
  /**
   * List of users
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async index(request, response) {
    try {
      const clientId = getClientId(request);
      const clientPublicKey = NodeCache.get(clientId);
      if (!clientPublicKey) {
        return response.status(401).send({
          status: false,
          message: "Unauthorized access. Session not found.",
        });
      }
      const metaData = await User.paginate(request);
      const key = crypto.randomBytes(32).toString("hex");
      const encryptKeyData = await encryptKey(clientPublicKey, key);

      const encryptionPromises = metaData.data.map(async (ele) => {
        ele["name"] = await encryptClientData(key, ele.name);
        ele["phone"] = await encryptClientData(key, ele.phone);
      });
      await Promise.all(encryptionPromises);

      return response.status(200).send({
        status: true,
        message: "User Lists",
        data: metaData,
        x_key: encryptKeyData,
      });
    } catch (exception) {
      console.error(exception);
      handleErrorDbLogger("Users List fetching failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * View the user
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async show(request, response) {
    try {
      let data = _.pick(request.admin_user, [
        "id",
        "name",
        "email",
        "phone",
        "is_active",
        "role_id",
        "mark_as_exit",
        "created_at",
      ]);

      const clientId = getClientId(request);
      const clientPublicKey = NodeCache.get(clientId);
      if (!clientPublicKey) {
        return response.status(401).send({
          status: false,
          message: "Unauthorized access. Session not found.",
        });
      }
      const key = crypto.randomBytes(32).toString("hex");
      const encryptKeyData = await encryptKey(clientPublicKey, key);
      const encryptionPromises = ["name", "phone"].map(async (property) => {
        if (data[property]) {
          data[property] = await encryptClientData(key, data[property]);
        }
      });

      await Promise.all(encryptionPromises);

      return response.status(200).send({
        status: true,
        message: "User Data",
        data: data,
        x_key: encryptKeyData,
      });
    } catch (exception) {
      handleErrorDbLogger("User details fetching failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Create a new user
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async create(request, response) {
    try {
      if (await User.findOne({ email: request.body.email })) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.RECORD_DUPLICATION_ERROR,
          message: ERROR_MESSAGES.USER_CREATION_FAILED_EMAIL_EXISTS,
          source_ip: request.headers["sourceip"] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });
        return response.status(400).send({
          status: false,
          message: "User already exists with given email address",
        });
      }
      const data = _.pick(request.body, [
        "name",
        "email",
        "phone",
        "is_active",
        "role_id",
      ]);
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(request.body.user_secret, salt);
      data['created_by'] = request.user.id

      await User.create(data);

      await Log.create({
        user_id: request.user.id,
        module: "USER",
        message: "Creates the new user: " + data.email,
        action_type: "ACTION",
      });

      return response.status(201).send({
        status: true,
        message: "User created successfully",
      });
    } catch (exception) {
      handleErrorDbLogger("User creation failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Update user
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async update(request, response) {
    try {
      const data = _.pick(request.body, [
        "name",
        "phone",
        "is_active",
        "role_id",
        "mark_as_exit",
      ]);

      if (request.body.user_secret) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(request.body.user_secret, salt);
      }
      data['updated_by'] = request.user.id

      const updated = _.merge(request.admin_user, data);
      let result = await User.updatedRecord(request.params.id, updated);

      // Log user update action
      await Log.create({
        user_id: request.user.id,
        module: "USER",
        message: "Updated the user: " + updated.email,
        action_type: "ACTION",
      });

      return response.send({
        status: true,
        message: "User updated successfully",
        data: result,
      });
    } catch (exception) {
      handleErrorDbLogger("User updation failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Update user status
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async updateStatus(request, response) {
    try {

      if (Number(request.user.id) === Number(request.params.id)) {
        return response.status(400).send({
          status: false,
          message: "User not allowed to update themselves"
        });
      }

      const updated = {
        is_active: request.body.status === true ? 1 : 0,
      };
      let result = await User.updatedRecord(request.params.id, updated);

      await Log.create({
        user_id: request.user.id,
        module: "USER",
        message:
          (request.body.status === true ? "Enabled" : "Disabled") +
          " the user status of " +
          request.admin_user.email,
        action_type: "ACTION",
      });

      return response.send({
        status: true,
        message: "User status updated successfully",
        data: result,
      });
    } catch (exception) {
      Logger.error({
        error_type: ERROR_TYPES.DATABASE_ERROR,
        error_code: ERROR_CODES.DATABASE_ERROR,
        message:
          "User status update failed: Database error occurred - " +
          exception.message,
        source_ip: request.headers["sourceip"] || request.ip,
        user_id: request.user ? request.user.id : undefined,
        request_id: request.requestId,
      });
      handleErrorDbLogger("User status updation failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Fetch user logs
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async userLogs(request, response) {
    try {
      const logs = await Log.list(request);

      return response.send({
        status: true,
        message: "Logs fetched successfully",
        data: logs,
      });
    } catch (exception) {
      handleErrorDbLogger("User logs fetching failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = UserController;
