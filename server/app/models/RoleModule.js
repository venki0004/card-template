"use strict";

const { Model } = require("objection");
const knex = require("../../database/knex");

Model.knex(knex);

class RoleModule extends Model {
  static get tableName() {
    return "role_modules";
  }

  static list = (request) => {
    let query = knex(this.tableName);

    return query
      .select(
        'id', 'name', 'slug', 'parent_id'
      )
  };
}

module.exports = RoleModule;
