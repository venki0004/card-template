/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('role_modules', (table) => {
        table.increments('id').primary();
        table.string('name', 50).notNullable()
        table.string('slug', 50).notNullable()
        table.integer('parent_id').unsigned().nullable();
        table.foreign('parent_id').references('id').on('role_modules');
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('role_modules');
};