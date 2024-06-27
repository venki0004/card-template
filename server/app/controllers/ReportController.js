"use strict";
const ExcelJS = require("exceljs");
const EmployeeCard = require("../models/EmployeeCard");
const Log = require("../models/Log");
const Validator = require("validatorjs");
const moment = require("moment");
const { handleErrorDbLogger } = require("../helpers/commonErrorLogger");

class ReportController {
  /**
   * Generates a report for card
   *
   * @param {object} request
   * @param {object} response
   */
  static async generateReport(request, response) {
    try {
      const rules = {
        from: "required",
        to: "required",
        report_type: "required",
      };

      let validation = new Validator(request.query, rules);

      if (validation.fails()) {
        return response.status(400).send({
          status: false,
          message: "Uh ooh! Please check the errors",
          errors: validation.errors.errors,
        });
      }

      let reports = await EmployeeCard.employeeCardReport(request.query);
      let workbook = new ExcelJS.Workbook();
      let worksheet = workbook.addWorksheet("Reports");
      worksheet.columns = [
        { header: "Employee Id", key: "emp_id" },
        { header: "Employee Name", key: "name" },
        { header: "Employee Designation", key: "designation" },
        { header: "Date of Request", key: "created_at" },
        { header: "Dispatched Date", key: "dispatched_date" },
      ];
      worksheet.getRow(1).font = { bold: true };
      reports.forEach((e) => {
        let obj = {
          created_at: moment(e.created_at).format("DD-MM-YYYY"),
          dispatched_date: moment(e.created_at).format("DD-MM-YYYY"),
          name: e.name,
          emp_id: e.emp_id,
          designation: e.designation,
        };
        worksheet.addRow({
          ...obj,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      let base64String = await buffer.toString('base64');
      // Log report generation action
      await Log.create({
        user_id: request.user.id,
        module: "REPORT",
        message: `Downloaded the card report from ${moment(request.query.from).format("DD-MM-YYYY")}  to ${moment(request.query.from).format("DD-MM-YYYY")}`,
        action_type: "ACTION",
      });

      return response.status(200).send({
        status: true,
        message: "Report generated successfully",
        base64String: base64String,
      });
    } catch (exception) {
      // Log and handle errors
      handleErrorDbLogger("Cards Report generation failed", exception, request);
      return response.status(500).send({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = ReportController;
