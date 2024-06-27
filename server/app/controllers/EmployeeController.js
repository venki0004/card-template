"use strict";

const Employee = require("../models/Employee");
const EmployeeCard = require("../models/EmployeeCard");
const Log = require("../models/Log");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const AdmZip = require("adm-zip");
const Validator = require("validatorjs");
const fs = require("fs");
const path = require("path");
const { ERROR_CODES, ERROR_TYPES, ERROR_MESSAGES } = require("../helpers/error-codes");
const Logger = require("../../bootstrap/logger");
const { handleErrorDbLogger } = require("../helpers/commonErrorLogger");
const crypto = require("crypto");
const NodeCache = require("memory-cache");
const {encryptKey,encryptClientData,decryptClientData } = require("../helpers/encryption")
const { getClientId } = require("../helpers/utils");
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB in bytes
const ExcelJS = require("exceljs");
const moment = require("moment");
const { getMimeType } = require("../helpers/string");

class EmployeeController {
  /**
 * List employees
 *
 * @param {Object} request
 * @param {Object} response
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
    const metaData = await Employee.list(request);
    const key = crypto.randomBytes(32).toString("hex");
    const encryptKeyData = await encryptKey(clientPublicKey, key);
    
    const encryptionPromises = metaData.data.map(async (ele) => {
      ele['name'] = await encryptClientData(key, ele.name);
      ele['designation'] = await encryptClientData(key, ele.designation);
      ele['department'] = await encryptClientData(key, ele.department);
      ele['primary_phone'] = await encryptClientData(key, ele.primary_phone);
      ele['email'] = await encryptClientData(key, ele.email);
      ele['emp_id'] = await encryptClientData(key, ele.emp_id);
    });
    
    await Promise.all(encryptionPromises);
    
    return response.status(200).send({
      status: true,
      message: "Employee Lists",
      data: metaData,
      x_key: encryptKeyData
    });
  } catch (exception) {
    console.error(exception);
    handleErrorDbLogger("Employee list fetching failed", exception, request);
    return response.status(500).send({
      status: false,
      message: "Internal Server Error",
    });
  }
}


  /**
   * Create a new employee
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async create(request, response) {
    try {
      if (await Employee.findOne({ email: request.body.email })) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.RECORD_DUPLICATION_ERROR,
          message:ERROR_MESSAGES.EMPLOYEE_EMAIL_ALREADY_EXISTS,
          source_ip: request.headers['sourceip'] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });
        return response.status(400).send({
          status: false,
          message: "Employee already exists with the given email address",
        });
      }
      if (await Employee.findOne({ emp_id: request.body.emp_id })) {
        return response.status(400).send({
          status: false,
          message: "Employee already exists with the given employee ID",
        });
      }
      
      let data = _.pick(request.body, [
        "emp_id",
        "name",
        "email",
        "primary_phone",
        "is_access_card_enabled",
        "is_print_dept_designation",
        "whatsapp_number",
        "department",
        "designation",
        "work_location",
        "image_base64",
        "blood_group",
        "employee_type",
        "card_type",
      ]);
      data['created_by'] = request.user.id
      await Employee.create(data);

      // Log employee creation
      await Log.create({
        user_id: request.user.id,
        module: "EMPLOYEE",
        message: `Created employee with ID ${data.emp_id}`,
        action_type: "ACTION",
      });

      return response.status(201).send({
        status: true,
        message: "Employee created successfully",
      });
    } catch (exception) {
      handleErrorDbLogger("Employee creation failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

 /**
 * View employee details
 *
 * @param {Object} request
 * @param {Object} response
 */
static async show(request, response) {
  try {
    const employee = request.employee;
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
      'name', 'designation', 'department', 'primary_phone',
      'email', 'emp_id', 'whatsapp_number', 'blood_group'
    ].map(async (property) => {
      if (employee[property]) {
        employee[property] = await encryptClientData(key, employee[property]);
      }
    });
    
    await Promise.all(encryptionPromises);
    
    return response.status(200).send({
      status: true,
      message: "Employee Data",
      data: request.employee,
      x_key: encryptKeyData
    });
  } catch (exception) {
    handleErrorDbLogger("Employee details fetching failed", exception, request);
    return response.status(500).send({
      status: false,
      message: "Internal Server Error",
    });
  }
}


  /**
   * Update employee details
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async update(request, response) {
    try {
      let data = _.pick(request.body, [
        "emp_id",
        "name",
        "primary_phone",
        "is_access_card_enabled",
        "is_print_dept_designation",
        "whatsapp_number",
        "department",
        "designation",
        "work_location",
        "image_base64",
        "card_type",
        "email"
      ]);
      data['updated_by'] = request.user.id

      const updated = _.merge(request.employee, data);
      let result = await Employee.updatedRecord(request.params.id, updated);

      // Log employee details update
      await Log.create({
        user_id: request.user.id,
        module: "EMPLOYEE",
        message: `Updated the details of employee ID ${data.emp_id}`,
        action_type: "ACTION",
      });

      return response.send({
        status: true,
        message: "Employee updated successfully",
        data: result,
      });
    } catch (exception) {
      handleErrorDbLogger("Employee updation failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Request for employee card print
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async employeeCardPrintRequest(request, response) {
    try {
      let employee = request.employee;
      let obj = {
        employee_id: employee.id,
        card_uuid: uuidv4(),
        name: employee.name,
        emp_id: employee.emp_id,
        designation: employee.designation,
        department: employee.department,
        blood_group: employee.blood_group,
        image_base64: employee.image_base64,
        card_type: employee.card_type,
        card_status: "REQUESTED",
        is_access_card_enabled: employee.is_access_card_enabled,
        is_print_dept_designation: employee.is_print_dept_designation,
        created_by: request.user.id
      };
      let cardExists = await EmployeeCard.findOne({ employee_id: employee.id });
      if (cardExists) {
        obj["is_reprint"] = 1;
      }
      await EmployeeCard.create(obj);
      await Employee.updatedRecord(employee.id, {
        is_print_requested: 1,
        card_status: "REQUESTED",
      });

      // Log card print request
      await Log.create({
        user_id: request.user.id,
        module: "EMPLOYEE",
        message: `Requested card print for employee with ID ${employee.emp_id}`,
        action_type: "ACTION",
      });

      return response.status(200).send({
        status: true,
        message: "Card request submitted successfully",
      });
    } catch (exception) {
      console.error(exception)
      handleErrorDbLogger("Employee card print request failed", exception, request)
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Get employee cards
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async getEmployeeCards(request, response) {
    try {
      let cardList = await EmployeeCard.employeeCardsList(request.params.id);

      return response.status(200).send({
        status: true,
        message: "Cards fetched successfully",
        data: cardList,
      });
    } catch (exception) {
      handleErrorDbLogger("Employee cards list failed", exception, request)
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Update employee card status
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async updateEmployeeCardStatus(request, response) {
    try {
      let card = await EmployeeCard.findOne({ id: request.params.id });
      if (!card) {
        return response.status(400).send({
          status: false,
          message: "Card Request Does Not Exist",
        });
      }
      if (!["ACTIVE", "DISABLED"].includes(request.body.status)) {
        Logger.error({
          error_type: ERROR_TYPES.VALIDATION_ERROR,
          error_code: ERROR_CODES.INVALID_CARD_UPDATE_STATUS,
          message:ERROR_MESSAGES.INVALID_CARD_UPDATE_STATUS,
          source_ip: request.headers['sourceip'] || request.ip,
          user_id: request.user ? request.user.id : undefined,
          request_id: request.requestId,
        });
        return response.status(400).send({
          status: false,
          message: "Status must Dispatched or Printed",
        });
      }
      let obj = {
        card_status: request.body.status,
        remark: request.body.remark,
      };
      obj["is_active"] = request.body.status === "ACTIVE" ? 1 : 0;
      obj['updated_by'] = request.user.id

      let result = await EmployeeCard.updatedRecord(request.params.id, obj);
      if (request.body.status === "ACTIVE") {
        await Employee.updatedRecord(card.employee_id, {
          card_status: "ACTIVE",
          is_active: 1,
        });
      }

      if (request.body.status === "DISABLED") {
        await Employee.updatedRecord(card.employee_id, {
          card_status: "DISABLED",
          is_active: 0,
          is_print_requested: 0,
        });
      }

      // Log employee card status update
      await Log.create({
        user_id: request.user.id,
        module: "EMPLOYEE",
        message: `Updated the employee card status to ${request.body.status} of Employee ${card.emp_id}`,
        action_type: "ACTION",
      });

      return response.send({
        status: true,
        message: "Card Status Updated Successfully",
        data: result,
      });
    } catch (exception) {
      handleErrorDbLogger("Employee cards status updation failed", exception, request)
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Update bulk employee data
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async bulkDataUpload(request, response) {
    try {
      // Validation of request body
      const body = request.body;

      const rules = {
        emp_id: "required|max:100",
        name: "required|max:150",
        email: "email|max:225",
        primary_phone: "max:13",
        whatsapp_number: "max:13",
        department: "string|max:100",
        designation: "string|max:100",
        work_location: "string|max:3000",
        card_type: "string|required",
        is_access_card_enabled: "required",
        is_print_dept_designation: "required",
      };

      // Process each employee in the request
      let response_list = [];
      for (let employee of body.employees) {
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
          if (employee[property]) {
            employee[property] = await decryptClientData(
              serverPrivateKey,
              request.headers["encrypted-key"],
              employee[property]
            );
          }
        });
        await Promise.all(encryptionPromises);
        let validation = new Validator(employee, rules);
        if (validation.fails()) {
          const error = validation.errors.errors;
          response_list.push({
            emp_id: employee.emp_id,
            email: employee.email,
            status: "REJECTED",
            remark: error[Object.keys(error)[0]].join(),
          });
        } else {
          let employeeExist = await Employee.isExists(employee);
          if (!employeeExist) {
            let data = _.pick(employee, [
              "emp_id",
              "name",
              "email",
              "primary_phone",
              "whatsapp_number",
              "department",
              "designation",
              "work_location",
              "blood_group",
              "card_type",
            ]);
            data['is_access_card_enabled'] = employee.is_access_card_enabled === 'Yes' ? 1 : 0;
            data['is_print_dept_designation'] = employee.is_print_dept_designation === 'Yes' ? 1 : 0;
            data['employee_type'] = body.employee_type
            data['created_by']= request.user.id

            // Create employee
            await Employee.create(data);
            console.log(data);
            response_list.push({
              emp_id: employee.emp_id,
              email: employee.email,
              status: "SUCCESS",
              remark: "NA",
            });
          } else {
            response_list.push({
              emp_id: employee.emp_id,
              email: employee.email,
              status: "ERROR",
              remark: "Employee already exists with this email/Id",
            });
          }
        }
      }

      // Log bulk data upload
      await Log.create({
        user_id: request.user.id,
        module: "EMPLOYEE",
        message: `Initiated the Bulk upload of ${body.employees.length} Employees`,
        action_type: "ACTION",
      });

      return response.send({
        status: true,
        data: "success",
        response_list: response_list,
      });
    } catch (exception) {
      handleErrorDbLogger("Employee bulk image upload failed", exception, request)
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Update bulk image upload
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async bulkImageUpload(request, response) {
    try {

      const { file } = request.body;
      const fileBuffer = Buffer.from(file, 'base64');
      const folderPath = path.join(__dirname, '../../uploads/'); // temp  folder path
      if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
         return res.status(400).send({
          status: false,
          message: "File size exceeds the limit"
        });
      }
      const type = file.split(';')[0].split('/')[1];
			const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
			const base64File = matches[2];
			const fileName = new Date().getTime();
			const filePath = folderPath + fileName + '.' + type;

      fs.writeFileSync(filePath, base64File, 'base64');

      // Process the uploaded zip file
      const zip = new AdmZip(filePath);
      let entries = await zip.getEntries();
      let respPayload = [];
      for (let entry of entries) {
        // Process each file in the zip
        let obj = {
          employee_id: "NA",
          file_name: entry.name,
          status: "FAILED",
          reason: "NA",
        };
        if (entry.isDirectory) continue;

        const refId = entry.name.split(".")[0];
        let employeeExists = await await Employee.findOne({ emp_id: refId });
        if (employeeExists) {
          obj["email"] = employeeExists.email;
          obj["employee_id"] = refId;
          obj["status"] = "SUCCESS";
          // Update employee with image data
          let imageExt = getMimeType(entry.entryName)
          await Employee.updatedRecord(employeeExists.id, {
            image_base64: `data:${imageExt};base64, ${entry.getData().toString("base64")}`,
            updated_by:request.user.id
          });
        } else {
          obj["email"] = "NA";
          obj["employee_id"] = refId;
          obj["status"] = "FAILED";
          obj["reason"] = "EMP ID Not Found!.";
        }
        if (refId) respPayload.push(obj);
      }

      // Remove uploaded zip file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Log bulk image upload
      await Log.create({
        user_id: request.user.id,
        module: "EMPLOYEE",
        message: "Initiated the Bulk Image upload",
        action_type: "ACTION",
      });

      return response.status(200).send({
        status: true,
        message: "Images Uploaded Successfully",
        list: respPayload,
      });
    } catch (exception) {
      console.error(exception)
      handleErrorDbLogger("Employee bulk data upload failed", exception, request)
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Generates a report for total employees
   *
   * @param {object} request
   * @param {object} response
   */
  static async generateEmployeeReport(request, response) {
    try {
      
      let reports = await Employee.totalEmployees(request);
      let workbook = new ExcelJS.Workbook();
      let worksheet = workbook.addWorksheet("Employees");
      worksheet.columns = [
        { header: "Employee Id", key: "emp_id" },
        { header: "Name", key: "name" },
        { header: "Email", key: "email" },
        { header: "Phone", key: "primary_phone" },
        { header: "Designation", key: "designation" },
        { header: "Department", key: "department" },
        { header: "Image", key: "image_base64" },
        { header: "Card Status", key: "card_status" },
        { header: "Created At", key: "created_at" },
      ];
      worksheet.getRow(1).font = { bold: true };
      reports.forEach((e) => {
        let obj = {
          created_at: moment(e.created_at).format("DD-MM-YYYY"),
          emp_id: e.emp_id,
          name: e.name,
          email: e.email,
          primary_phone: e.primary_phone,
          designation: e.designation,
          department: e.department,
          image_base64: e.image_base64 ? "IMAGE_FOUND":"IMAGE_NOT_FOUND",
          card_status: e.card_status
        };
        worksheet.addRow({
          ...obj,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      let base64String = await buffer.toString('base64');
      return response.status(200).send({
        status: true,
        message: "Employee generated successfully",
        base64String: base64String,
      });
    } catch (exception) {
      // Log and handle errors
      console.log(exception);
      handleErrorDbLogger("Employee generation failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = EmployeeController;
