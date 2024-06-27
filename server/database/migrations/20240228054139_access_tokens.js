/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('access_tokens', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('id').on('users');
        table.string('token', 255).unique().notNullable();
        table.datetime('issued_at').defaultTo(knex.fn.now());
        table.datetime('expires_at').notNullable();
        table.timestamp('last_activity').defaultTo(knex.fn.now()).notNullable() // Auto-update on activity
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('access_tokens');
  
};
