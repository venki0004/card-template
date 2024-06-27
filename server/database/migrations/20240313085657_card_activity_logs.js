/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('card_activity_logs', (table) => {
        table.increments("id").primary();
        table.integer('card_id').unsigned().references('id').inTable('employee_cards').nullable();
        table.string("action",100).notNullable();
        table.string("message",225).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('card_activity_logs');
};
