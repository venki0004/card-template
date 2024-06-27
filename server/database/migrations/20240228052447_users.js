/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments('id').primary();
    table.string('name', 50).notNullable()
    table.string('password').notNullable();
    table.string('email', 225).notNullable().unique()
    table.string('phone', 50).nullable()
    table.integer('role_id').unsigned().references('id').inTable('roles').nullable()
    table.boolean('is_active').defaultTo(1)
    table.boolean('mark_as_exit').defaultTo(0)
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.integer('created_by').unsigned().references('id').inTable('users').nullable()
    table.integer('updated_by').unsigned().references('id').inTable('users').nullable()
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
