/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("roles", function (table) {
    table.increments("id").primary();;
    table.string("name", 100).notNullable().unique();
    table.boolean("is_deleted").defaultTo(false);
    table.boolean("is_manager").defaultTo(false);
    table.boolean("is_default").defaultTo(false);
    table.string("slug", 100).notNullable().unique();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("roles");
};
