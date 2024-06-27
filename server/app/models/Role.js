"use strict";

const { Model } = require("objection");
const knex = require("../../database/knex");

Model.knex(knex);

class Role extends Model {
  static get tableName() {
    return "roles";
  }

  static create = (props) => {
    return knex(this.tableName).insert(props);
  };

  static paginate = (request) => {
    let query = knex(this.tableName);

    if (request.query.search) {
      query = query
        .where("roles.name", "like", `%${request.query.search}%`)
        .orWhere("roles.email", "like", `%${request.query.search}%`);
    }

    return query
      .select(
        "roles.id as id",
        "roles.is_manager",
        "roles.name",
        "roles.is_default",
        "roles.created_at"
      )
      .leftJoin('users', 'roles.id', 'users.role_id')
      .select(
        knex.raw(
          '(SELECT JSON_ARRAYAGG(JSON_OBJECT("permission_id", id, "module_id", module_id, "is_read", is_read, "is_write", is_write, "is_update", is_update, "is_delete", is_delete)) FROM permissions WHERE role_id = roles.id) AS permissions'
        )
      )
      .select(knex.raw('COUNT(users.id) AS user_count'))
      .groupBy("roles.id")
      .orderBy("roles.id", "desc")
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

  static dropdown = (id) => {
    return knex(this.tableName).where({}).select("name", "slug", "id");
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
}

module.exports = Role;
