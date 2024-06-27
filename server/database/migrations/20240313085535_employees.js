/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('employees', (table) => {
        table.increments("id").primary();;
        table.string("name", 150).notNullable();
        table.string("designation", 100).notNullable();
        table.string("department", 100).notNullable();
        table.string("primary_phone", 20).notNullable();
        table.string("whatsapp_number", 20).nullable();
        table.string("blood_group", 20).nullable();
        table.text("image_base64",'longtext').nullable();
        table.string("email", 100).notNullable();
        table.text("work_location").nullable();
        table.enum("employee_type", [1,2,3]).defaultTo(1);
        table.enum("card_type", ['Alternates','MF']).defaultTo('MF');
        table.string("emp_id", 100).nullable();
        table.boolean('is_access_card_enabled').defaultTo(0)
        table.boolean('is_print_dept_designation').defaultTo(0)
        table.boolean('is_print_requested').defaultTo(0)
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.boolean("is_active").defaultTo(false);
        table.string("card_status").defaultTo('NOT_REQUESTED');
        table.integer('created_by').unsigned().references('id').inTable('users').nullable();
        table.integer('updated_by').unsigned().references('id').inTable('users').nullable();
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('employees');
}								