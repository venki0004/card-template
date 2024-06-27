/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('employee_cards', (table) => {
        table.increments("id").primary();
        table.integer('employee_id').unsigned().references('id').inTable('employees').nullable();
        table.string("card_uuid", 150).notNullable().unique();
        table.boolean("is_active").defaultTo(false);
        table.string("emp_id", 100).nullable();
        table.string("card_print_status").defaultTo('NOT_PRINTED');
        table.string("card_status").nullable()
        table.string("name", 150).notNullable();
        table.string("designation", 100).notNullable();
        table.string("department", 100).notNullable();
        table.string("blood_group", 20).nullable();
        table.dateTime("dispatched_date").nullable();
        table.text("image_base64",'longtext').nullable();
        table.text("remark").nullable();
        table.string("rf_id", 20).nullable();
        table.enum("card_type", ['Alternates','MF']).defaultTo('MF');
        table.boolean('is_access_card_enabled').defaultTo(0)
        table.boolean('is_print_dept_designation').defaultTo(0)
        table.boolean("is_reprint").defaultTo(false);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.integer('created_by').unsigned().references('id').inTable('users').nullable();
        table.integer('updated_by').unsigned().references('id').inTable('users').nullable();
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('employee_cards');
};
