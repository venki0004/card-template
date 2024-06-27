/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE TRIGGER update_employee_cards AFTER UPDATE ON employees
    FOR EACH ROW
    BEGIN
        IF OLD.is_active <> NEW.is_active THEN
            UPDATE employee_cards SET is_active = NEW.is_active WHERE employee_id = OLD.id;
        END IF;
    END;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS update_employee_cards;
  `);
};
