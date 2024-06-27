"use strict";

const { Model } = require("objection");
const knex = require("../../database/knex");
Model.knex(knex);
const moment = require("moment");
class Employee extends Model {
  static get tableName() {
    return "employees";
  }

  static create = (props) => {
    return knex(this.tableName).insert(props);
  };

  static list = (request) => {
    let query = knex(this.tableName);

    const {
      status ='',
      search = '',
      from = '',
      to = '',
      type = 1,
    } = request.query

    if (search) {
        query = query.where((query) => {
          query
            .orWhere('name', 'LIKE', `%${search}%`)
            .orWhere('primary_phone', 'LIKE', `%${search}%`)
            .orWhere('email', 'LIKE', `%${search}%`)
            .orWhere('emp_id', 'LIKE', `%${search}%`)
        })
    }

    if (from && to) {
      let start = moment(from).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      let end = moment(to).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      query = query.where('created_at', '>=', start).where('created_at', '<=', end)
    }

    if(status) {
      query = query.where('card_status', '=', status)
    }

    return query
       .where('employee_type', '=', type)
      .select(
        "id",
        "name",
        "designation",
        "department",
        "primary_phone",
        "email",
        "employee_type",
        "created_at",
        "card_status",
        'emp_id'
      )
      .orderBy("id", "desc")
      .paginate({
        perPage: Number(request.query.size) || 10,
        currentPage: Number(request.query.page) || 1,
        isLengthAware: true,
      });
  };

  static findById = (id) => {
    return knex(this.tableName)
      .where({ id: id })
      .first()
      .then((row) => row);
  };

  static findOne = (query) => {
    return knex(this.tableName)
      .where(query)
      .first()
      .then((row) => row);
  };

  static findByIdAndRemove = (id) => {
    return knex(this.tableName).del().where({ id: id });
  };

  static updatedRecord = (id, record) => {
    return knex(this.tableName).where({ id: id }).update(record);
  };

  static isExists = (body) => {
    return knex(this.tableName)
    .where('email', body.email.replace(/\s+/g, ''))
    .orWhere('emp_id', body.emp_id)
    .first()
  };

  static totalCardsCount = () => {
    let query = knex(this.tableName)
    return query.count('id')
    .then((total) => { return total[0]['count(`id`)'] })
 }

 static totalActiveCardsCount = () => {
  let query = knex(this.tableName)
  return query.count('id')
   .where('is_active',1)
  .then((total) => { return total[0]['count(`id`)'] })
  }
 static totalInActiveCardsCount = () => {
  let query = knex(this.tableName)
  return query.count('id')
   .where('is_active',0)
  .then((total) => { return total[0]['count(`id`)'] })
 }

 static totalEmployees = (request) => {
  let query = knex(this.tableName);
  const {
    type = 1,
  } = request.query

  return query
     .where('employee_type', '=', type)
    .select(
      "id",
      "name",
      "designation",
      "department",
      "primary_phone",
      "email",
      "employee_type",
      "created_at",
      "card_status",
      'emp_id',
      'image_base64'
    )
    .orderBy("id", "desc")
};
}

module.exports = Employee;
