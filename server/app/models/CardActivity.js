"use strict";
const moment = require("moment");
const { Model } = require("objection");
const knex = require("../../database/knex");

Model.knex(knex);

class CardActivityLog extends Model {
  static get tableName() {
    return "card_activity_logs";
  }

  static create = (props) => {
    return knex(this.tableName).insert(props);
  };
  static dashboardStats = (request) => {
    let query = '';
    if (request.from && request.to) {
        const startDate = new Date(request.from);
        const endDate = new Date(request.to);
        const diffInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (diffInDays === 1) {
          query = `SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS date, COUNT(DISTINCT id) AS count
                  FROM card_activity_logs
                  WHERE action = "CARD_SHARED" AND (created_at >= "${moment(startDate).startOf("hour").format("YYYY-MM-DD HH:mm:ss")}"
                  AND created_at <= "${moment(endDate).endOf("hour").format("YYYY-MM-DD HH:mm:ss")}")
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')`;
      } else if (diffInDays <= 30) {
            query = `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, COUNT(DISTINCT id) AS count
                    FROM card_activity_logs
                    WHERE action = "CARD_SHARED" and (created_at >= "${moment(startDate).startOf("day")
                    .format("YYYY-MM-DD HH:mm:ss")}" and  created_at < "${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")}")
                    GROUP BY date`;
        } else if (diffInDays > 30 && diffInDays <= 365) {
            query = `SELECT DATE_FORMAT(created_at, '%Y-%m') AS date, COUNT(DISTINCT id) AS count
                    FROM card_activity_logs
                    WHERE   action = "CARD_SHARED"  and (created_at >= "${moment(startDate).startOf("day")
                    .format("YYYY-MM-DD HH:mm:ss")}" and  created_at < "${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")}")
                    GROUP BY date`;
        } else {
            query = `SELECT DATE_FORMAT(created_at, '%Y') AS date, COUNT(DISTINCT id) AS count
                    FROM card_activity_logs
                    WHERE  action = "CARD_SHARED" and (created_at >= "${moment(startDate).startOf("day")
                    .format("YYYY-MM-DD HH:mm:ss")}" and  created_at < "${moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")}")
                    GROUP BY date`;
        }
    } else {
        query = `SELECT DATE_FORMAT(created_at, '%Y-%m') AS date, COUNT(DISTINCT id) AS count
                where  action = "CARD_SHARED"
                FROM card_activity_logs
                GROUP BY date`;
    }

    return knex.raw(query).then((rows) => {
        return rows[0].map(row => ({ date: row.date, count: row.count }));
    });
};

}

module.exports = CardActivityLog;
