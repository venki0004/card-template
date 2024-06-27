/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('roles', (table) => {
        table.integer('created_by').unsigned().references('id').inTable('users').nullable()
        table.integer('updated_by').unsigned().references('id').inTable('users').nullable()        
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('roles', table => {
        table.dropColumns('created_by','updated_by');
      })
}; 