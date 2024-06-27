/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('permissions', (table) => {
        table.increments('id').primary();
        table.boolean('is_read').defaultTo(false)
        table.boolean('is_write').defaultTo(false)
        table.boolean('is_delete').defaultTo(false)
        table.boolean('is_update').defaultTo(false)

        table.integer('role_id').unsigned().nullable();
        table.foreign('role_id').references('id').on('roles');

        table.integer('module_id').unsigned().nullable();
        table.foreign('module_id').references('id').on('role_modules');

        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('permissions');
};