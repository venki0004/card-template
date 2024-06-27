"use strict";
const moment = require("moment");
const { Model } = require("objection");
const knex = require("../../database/knex");
Model.knex(knex);

class Log extends Model {
  static get tableName() {
    return "logs";
  }

  static create = (props) => {
    return knex(this.tableName).insert(props);
  };

  static list = (request) => {
    let query = knex(this.tableName)
      .select(`${this.tableName}.*`, 'users.name as user_name')
      .join('users', `${this.tableName}.user_id`, 'users.id');
  
    const {
      from = '',
      to = '',
    } = request.query;
  
    if (from && to) {
      let start = moment(from).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      let end = moment(to).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      query = query.where(`${this.tableName}.created_at`, '>=', start)
      .where(`${this.tableName}.created_at`, '<=', end);
    }
  
    return query
      .where(`${this.tableName}.user_id`, '=', request.params.id)
      .orderBy(`${this.tableName}.id`, "desc")
      .paginate({
        perPage: Number(request.query.size) || 10,
        currentPage: Number(request.query.page) || 1,
        isLengthAware: true,
      });
  };
  

}

module.exports = Log;
