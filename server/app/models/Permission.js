"use strict";

const { Model } = require("objection");
const knex = require("../../database/knex");

Model.knex(knex);

class Permission extends Model {
  static get tableName() {
    return "permissions";
  }

  static create = (props) => {
    return knex(this.tableName).insert(props);
  };

  static list = (request) => {
    let query = knex(this.tableName);

    return query
      .leftJoin("permissions", "roles.id", "permissions.role_id")
      .select(
        "roles.id as id",
        "roles.is_manager",
        "roles.name",
        "roles.is_default"
      )
      .select(
        knex.raw(
          '(SELECT JSON_ARRAYAGG(JSON_OBJECT("permission_id", id, "module_id", module_id, "is_read", is_read, "is_write", is_write, "is_update", is_update, "is_delete", is_delete)) FROM permissions WHERE role_id = roles.id) AS permissions'
        )
      )
      .orderBy("roles.id", "desc")
      .paginate({
        perPage: Number(request.query.size) || 10,
        currentPage: Number(request.query.page) || 1,
        isLengthAware: true,
      });
  };

  static permissionByRole = (id) => {
    return knex(this.tableName)
      .where({ role_id: id })
      .then((row) => row);
  };

  static findByIdAndRemove = (id) => {
    return knex(this.tableName).del().where({ role_id: id });
  };
}

module.exports = Permission;
