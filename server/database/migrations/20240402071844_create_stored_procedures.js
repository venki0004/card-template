/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Fetch Active and Inactive Employees
  await knex.raw(`
    CREATE PROCEDURE FetchEmployeesByStatus(IN isActive BOOLEAN)
    BEGIN
        IF isActive THEN
            SELECT id, emp_id,name,email,designation,department FROM employees WHERE is_active = 1;
        ELSE
            SELECT id, emp_id,name,email,designation,department FROM employees WHERE is_active = 0;
        END IF;
    END;
    `);

    //Insert/Update Employee:
    await knex.raw(`
    CREATE PROCEDURE UpsertEmployee(
        IN empId VARCHAR(100),
        IN empName VARCHAR(150),
        IN empDesignation VARCHAR(100),
        IN empDepartment VARCHAR(100),
        IN empPrimaryPhone VARCHAR(20),
        IN empSecondaryPhone VARCHAR(20),
        IN empWhatsappNumber VARCHAR(20),
        IN empBloodGroup VARCHAR(20),
        IN empImageBase64 LONGTEXT,
        IN empEmail VARCHAR(100),
        IN empWorkLocation TEXT,
        IN empMapUrl VARCHAR(100),
        IN empType ENUM('1', '2', '3')
    )
    BEGIN
        DECLARE empExists INT;
        SET empExists = (SELECT COUNT(*) FROM employees WHERE emp_id = empId);
        
        IF empExists > 0 THEN
            UPDATE employees
            SET 
                name = empName,
                designation = empDesignation,
                department = empDepartment,
                primary_phone = empPrimaryPhone,
                secondary_phone = empSecondaryPhone,
                whatsapp_number = empWhatsappNumber,
                blood_group = empBloodGroup,
                image_base64 = empImageBase64,
                email = empEmail,
                work_location = empWorkLocation,
                map_url = empMapUrl,
                employee_type = empType,
                updated_at = NOW()
            WHERE emp_id = empId;
        ELSE
            INSERT INTO employees (
                emp_id, name, designation, department, primary_phone, secondary_phone, whatsapp_number, blood_group, image_base64,
                email, work_location, map_url, employee_type, created_at, updated_at
            ) VALUES (
                empId, empName, empDesignation, empDepartment, empPrimaryPhone, empSecondaryPhone, empWhatsappNumber, empBloodGroup, empImageBase64,
                empEmail, empWorkLocation, empMapUrl, empType, NOW(), NOW()
            );
        END IF;
    END;
`);


   return knex.raw(`
    CREATE PROCEDURE DisableEmployee(IN empId VARCHAR(100))
    BEGIN
        SET SQL_SAFE_UPDATES = 0;
        UPDATE employees SET is_active = 0 WHERE emp_id = empId;
        SET SQL_SAFE_UPDATES = 1;
    END;
    `);

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
