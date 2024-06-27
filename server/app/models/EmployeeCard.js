"use strict";

const { Model } = require("objection");
const knex = require("../../database/knex");
const moment = require("moment");
Model.knex(knex);

class EmployeeCard extends Model {
  static get tableName() {
    return "employee_cards";
  }

  static create = (props) => {
    return knex(this.tableName).insert(props);
  };

  static list = (request) => {
    let query = knex(this.tableName);
    const {
      status ='',
      search = '',
      dispatched_from = '',
      dispatched_to = ''
    } = request.query

    if (search) {
      query = query.where((query) => {
        query
          .orWhere('name', 'LIKE', `%${search}%`)
          .orWhere('emp_id', 'LIKE', `%${search}%`)
      })
  }

  if (dispatched_from && dispatched_to) {
    let start = moment(dispatched_from).startOf('day').format('YYYY-MM-DD HH:mm:ss')
    let end = moment(dispatched_to).endOf('day').format('YYYY-MM-DD HH:mm:ss')
    query = query.where('dispatched_date', '>=', start).where('dispatched_date', '<=', end)
  }

  if(status) {
    query = query.where('card_print_status', '=', status)
  }

    return query
      .select(
        "id",
        "name",
        "emp_id",
        'designation',
        "department",
        "created_at",
        "card_print_status",
        "dispatched_date"
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

  static employeeCardsList = (employee_id) => {
    let query = knex(this.tableName);

    return query
      .where({ employee_id: employee_id })
      .select("id", "card_uuid", "created_at", "card_status", "is_active",'card_print_status','remark')
      .orderBy("id", "desc");
  };

  static employeeCardReport = (params) => {
    let query = knex(this.tableName);

    if (params.from && params.to) {
      let start = moment(params.from).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      let end = moment(params.to).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      query = query.where('dispatched_date', '>=', start).where('dispatched_date', '<=', end)
    }


    return query
     .where('is_reprint', '=', query?.report_type ==='re_print' ? 1 : 0)
    .select("id", "emp_id","name","designation","created_at",'card_print_status','dispatched_date')
    .orderBy("id", "desc");
  };

  static employeeCardInfo = (card_uuid) => {
    let query = knex(this.tableName);

    return query
    .where('employee_cards.card_uuid', '=', card_uuid)
    .where('employee_cards.is_active', '=', 1)
    .innerJoin("employees", "employee_cards.employee_id", "=", "employees.id")
    .select(
      "employees.id",
      "employees.name",
      "employees.designation",
      "employees.department",
      "employees.primary_phone",
      "employees.whatsapp_number",
      "employees.image_base64",
      "employees.email",
      "employees.work_location",
      "employees.card_type",
      "employees.emp_id",
      "employee_cards.is_active",
      "employee_cards.card_uuid"
    )
    .first()
  };

}

module.exports = EmployeeCard;
