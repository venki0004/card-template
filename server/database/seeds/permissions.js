/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('permissions').del()
  await knex('permissions').insert([
    {
      "role_id" : 1,
      "module_id" : 1,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:12",
      "updated_at" : "2024-02-06 09:12:12"
    },
    {
      "role_id" : 1,
      "module_id" : 2,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:12",
      "updated_at" : "2024-02-06 09:12:12"
    },
    {
      "role_id" : 1,
      "module_id" : 3,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:12",
      "updated_at" : "2024-02-06 09:12:12"
    },
    {
      "role_id" : 1,
      "module_id" : 4,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
    {
      "role_id" : 1,
      "module_id" : 5,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
    {
      "role_id" : 1,
      "module_id" : 6,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
    {
      "role_id" : 1,
      "module_id" : 7,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
    {
      "role_id" : 1,
      "module_id" : 8,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
    {
      "role_id" : 1,
      "module_id" : 9,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
    {
      "role_id" : 2,
      "module_id" : 2,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:12",
      "updated_at" : "2024-02-06 09:12:12"
    },
    {
      "role_id" : 2,
      "module_id" : 3,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:12",
      "updated_at" : "2024-02-06 09:12:12"
    },
    {
      "role_id" : 2,
      "module_id" : 4,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
    {
      "role_id" : 3,
      "module_id" : 5,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
    {
      "role_id" : 3,
      "module_id" : 6,
      "is_read" : 1,
      "is_write" : 1,
      "is_delete" : 1,
      "is_update" : 1,
      "created_at" : "2024-02-06 09:12:13",
      "updated_at" : "2024-02-06 09:12:13"
    },
  ]);
};
