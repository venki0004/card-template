/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('logs', (table) => {
        table.increments("id").primary();
        table.integer('user_id').unsigned().references('id').inTable('users').nullable();
        table.string("module",100).notNullable();
        table.string("message",225).notNullable();
        table.string("action_type",225).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('logs');

};
