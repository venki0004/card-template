"use strict";
const moment = require("moment");
const Employee = require("../models/Employee");
const CardActivity = require("../models/CardActivity");
const { dashboardDateRange } = require("../helpers/string");
const { handleErrorDbLogger } = require("../helpers/commonErrorLogger");

class StatsController {
  /**
   * Dashboard stats of employees and cards
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async index(request, response) {
    try {
      const stats = {
        total_employees: await Employee.totalCardsCount(request),
        total_active_cards: await Employee.totalActiveCardsCount(request),
        total_inactive_cards: await Employee.totalInActiveCardsCount(request),
      };

      return response.send({
        status: true,
        message: "Statistics information",
        data: {
          ...stats,
        },
      });
    } catch (exception) {
      handleErrorDbLogger(
        "Dashboard Cards meta info fetching failed",
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
   * Dashboard graph statistics of employees card activity
   *
   * @param {Object} request
   * @param {Object} response
   */
  static async dashboard(request, response) {
    try {
      let dateRange = dashboardDateRange(request.query.dateRange);
      const data = await CardActivity.dashboardStats(dateRange);
      const labels = dateRange.range.map((item) => {
        let formattedDate = moment(item, "YYYY-MM-DD").format("YYYY-MM-DD");
        if (Number(request.query.dateRange) === 1) {
          formattedDate = moment(item, "YYYY-MM-DD HH:mm:ss").format("HH:mm");
        } else if (Number(request.query.dateRange) === 365) {
          formattedDate = moment(item, "YYYY-MM-DD").format("MMM-YY");
        }

        const transactionsByDate = data.filter((result) => {
          let comparisonUnit = "day";
          if (Number(request.query.dateRange) === 1) {
            comparisonUnit = "hour";
          } else if (Number(request.query.dateRange) === 365) {
            comparisonUnit = "month";
          }
          const search = moment(
            comparisonUnit != "month" ? new Date(result.date) : result.date,
            "YYYY-MM-DD"
          );
          const record = moment(item);
          return search.isSame(record, comparisonUnit);
        });

        const total_count = transactionsByDate.reduce(
          (sum, result) => sum + result.count,
          0
        );
        return {
          TOTAL_SHARED: total_count,
          date: formattedDate,
        };
      });

      return response.send({
        status: true,
        message: "Dashboard Statistics",
        statistics: labels,
      });
    } catch (exception) {
      handleErrorDbLogger(
        "Dashboard Cards activity info graph data fetching failed",
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

module.exports = StatsController;
