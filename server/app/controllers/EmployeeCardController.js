"use strict";

const EmployeeCard = require("../models/EmployeeCard");
const CardActivityLog = require("../models/CardActivity");
const Log = require("../models/Log");
const QRCode = require("easyqrcodejs-nodejs");
const { convertFileToBase64 } = require("../helpers/string");
const path = require("path");
const fs = require("fs");
const Validator = require("validatorjs");
const _ = require("lodash");
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

class EmployeeCardController {
  /**
   * List the Card requests
   *
   * @param {object} request
   * @param {object} response
   */
  static async index(request, response) {
    try {
      const clientId = getClientId(request);
      const clientPublicKey = NodeCache.get(clientId);
      if(!clientPublicKey) {
        return response.status(401).send({
          status: false,
          message: "Unauthorized access. Session not found.",
        });
      }
      const metaData = await EmployeeCard.list(request);
      const key = crypto.randomBytes(32).toString("hex");
      const encryptKeyData = await encryptKey(clientPublicKey, key);

      const encryptionPromises = metaData.data.map(async (ele) => {
        ele["name"] = await encryptClientData(key, ele.name);
        ele["designation"] = await encryptClientData(key, ele.designation);
        ele["department"] = await encryptClientData(key, ele.department);
        ele["emp_id"] = await encryptClientData(key, ele.emp_id);
      });

      await Promise.all(encryptionPromises);

      return response.status(200).send({
        status: true,
        message: "Card Requests Lists",
        data: metaData,
        x_key: encryptKeyData,
      });
    } catch (exception) {
      handleErrorDbLogger("Card Requests fetching failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * View the Card Request
   *
   * @param {object} request
   * @param {object} response
   */
  static async show(request, response) {
    try {
    const card_request = request.card_request;
    const clientId = getClientId(request);
    const clientPublicKey = NodeCache.get(clientId);
    if(!clientPublicKey) {
      return response.status(401).send({
        status: false,
        message: "Unauthorized access. Session not found.",
      });
    }
    const key = crypto.randomBytes(32).toString("hex");
    const encryptKeyData = await encryptKey(clientPublicKey, key);
    const encryptionPromises = [
      'name', 'designation', 'department','emp_id','blood_group'
    ].map(async (property) => {
      if (card_request[property]) {
        card_request[property] = await encryptClientData(key, card_request[property]);
      }
    });
    
    await Promise.all(encryptionPromises);
    
    return response.status(200).send({
      status: true,
      message: "Card Request Data",
      data: request.card_request,
      x_key: encryptKeyData
    });
    } catch (exception) {
      handleErrorDbLogger(
        "Card Request details fetching failed",
        exception,
        request
      );
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Update Card Request Status
   *
   * @param {object} request
   * @param {object} response
   */
  static async update(request, response) {
    try {
      let card = await EmployeeCard.findOne({ id: request.params.id });

      if (!card) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.CARD_REQUEST_NOT_FOUND,
          message: ERROR_MESSAGES.EMPLOYEE_EMAIL_ALREADY_EXISTS,
          source_ip: request.headers['sourceip'] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });

        return response.status(400).send({
          status: false,
          message: "Card Request Does Not Exist",
        });
      }

      if (!["PRINTED", "DISPATCHED"].includes(request.body.status)) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.INVALID_CARD_STATUS,
          message: ERROR_MESSAGES.INVALID_CARD_STATUS,
          source_ip: request.headers['sourceip'] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });
        return response.status(400).send({
          status: false,
          message: "Status must be either 'PRINTED' or 'DISPATCHED'",
        });
      }

      let obj = {
        card_print_status: request.body.status,
      };

      if (request.body.status === "DISPATCHED") {
        obj["dispatched_date"] = new Date();
      }

      let result = await EmployeeCard.updatedRecord(request.params.id, obj);

      await Log.create({
        user_id: request.user.id,
        module: "CARD",
        message: `Updated the card status to ${request.body.status}`,
        action_type: "STATUS",
      });

      return response.send({
        status: true,
        message: "Card Status Updated Successfully",
        data: result,
      });
    } catch (exception) {
      handleErrorDbLogger(
        "Card Request printing status updation failed",
        exception,
        request
      );
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Download card QR code
   *
   * @param {object} request
   * @param {object} response
   */
  static async downloadCardQR(request, response) {
    try {
      let card = await EmployeeCard.findOne({ id: request.params.id });
      if (!card) {
        return response.status(400).send({
          status: false,
          message: "Card Request Does Not Exist",
        });
      }

      const options = {
        text: "" + card.card_uuid,
        autoColor: false, // Automatic color adjustment(for data block)
        autoColorDark: "rgba(0, 0, 0, .6)", // Automatic color: dark CSS color
        autoColorLight: "rgba(255, 255, 255, .7)", // Automatic color: light CSS color
        dotScale: 0.6,
        dotScaleTiming: 0.6,
        correctLevel: QRCode.CorrectLevel.M, // L, M, Q,
      };

      const qrcode = new QRCode(options);
      const fileName = new Date().getTime();
      const filePath = path.join("uploads", `${fileName}.svg`);
      await qrcode.saveSVG({
        path: filePath,
      });
      const base64String = await convertFileToBase64(filePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await Log.create({
        user_id: request.user.id,
        module: "CARD",
        message: `Download the QR code of the card Id ${card.id}`,
        action_type: "ACTION",
      });

      return response.status(200).send({
        status: true,
        message: "QR fetched successfully",
        data: base64String,
      });
    } catch (exception) {
      handleErrorDbLogger(
        "Card Request qr download failed",
        exception,
        request
      );
      return response.status(500).send({
        status: false,
        message: "Something went wrong. Please try again",
      });
    }
  }

  /**
   * View the Employee Active Card info
   *
   * @param {object} request
   * @param {object} response
   */
  static async employeeActiveCardInfo(request, response) {
    try {
      let employee = await EmployeeCard.employeeCardInfo(request.params.id);
      if (!employee) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.CARD_REQUEST_NOT_FOUND,
          message: ERROR_MESSAGES.CARD_REQUEST_NOT_FOUND,
          source_ip: request.headers['sourceip'] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });
        return response.status(400).send({
          status: false,
          message: "Card Request Does Not Exist",
        });
      }

      return response.status(200).send({
        status: true,
        message: "Employee fetched successfully",
        data: employee,
      });
    } catch (exception) {
      handleErrorDbLogger(
        "Card Request activity info failed",
        exception,
        request
      );
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Store Card Activity Logs
   *
   * @param {object} request
   * @param {object} response
   */
  static async storeCardActivityLog(request, response) {
    try {
      let card = await EmployeeCard.findOne({
        card_uuid: request.body.card_id,
      });
      if (!card) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.CARD_REQUEST_NOT_FOUND,
          message: ERROR_MESSAGES.CARD_REQUEST_NOT_FOUND,
          source_ip: request.headers['sourceip'] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });
        return response.status(400).send({
          status: false,
          message: "Card Request Does Not Exist",
        });
      }

      const rules = {
        card_id: "required",
        action: "required",
        message: "required",
      };
      let validation = new Validator(request.body, rules);

      if (validation.fails()) {
        return response.status(400).send({
          status: false,
          message: "Uh ooh! Please check the errors",
          errors: validation.errors.errors,
        });
      }

      let data = _.pick(request.body, ["action", "message"]);
      data["card_id"] = card.id;
      await CardActivityLog.create(data);

      return response.status(200).send({
        status: true,
        message: "Log Stored successfully",
      });
    } catch (exception) {
      handleErrorDbLogger(
        "Card  activity logs creation failed",
        exception,
        request
      );
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = EmployeeCardController;
