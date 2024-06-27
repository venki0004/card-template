/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('role_modules').del()
  await knex('role_modules').insert([
    {
      "id" : 1,
      "name" : "Dashboard",
      "slug" : "dashboard",
      "parent_id" : null,
      "created_at" : "2024-02-06 09:07:56",
      "updated_at" : "2024-02-06 09:07:56"
    },
    {
      "id" : 2,
      "name" : "Employee",
      "slug" : "employees",
      "parent_id" : null,
      "created_at" : "2024-02-06 09:07:57",
      "updated_at" : "2024-02-06 09:07:57"
    },
    {
      "id" : 3,
      "name" : "Employees List",
      "slug" : "all-employees",
      "parent_id" : 2,
      "created_at" : "2024-02-06 09:07:57",
      "updated_at" : "2024-02-06 09:07:57"
    },
    {
      "id" : 4,
      "name" : "Distributors",
      "slug" : "distributors",
      "parent_id" : 2,
      "created_at" : "2024-02-06 09:07:57",
      "updated_at" : "2024-02-06 09:07:57"
    },
    {
      "id" : 5,
      "name" : "Card Requests",
      "slug" : "card-requests",
      "parent_id" : null,
      "created_at" : "2024-02-06 09:07:57",
      "updated_at" : "2024-02-06 09:07:57"
    },

    {
      "id" : 6,
      "name" : "Reports",
      "slug" : "reports",
      "parent_id" : null,
      "created_at" : "2024-02-06 09:07:57",
      "updated_at" : "2024-02-06 09:07:57"
    },
    
    {
      "id" : 7,
      "name" : "User Settings",
      "slug" : "user-settings",
      "parent_id" : null,
      "created_at" : "2024-02-06 09:07:58",
      "updated_at" : "2024-02-06 09:07:58"
    },
    {
      "id" : 8,
      "name" : "Users List",
      "slug" : "users",
      "parent_id" : 7,
      "created_at" : "2024-02-06 09:07:58",
      "updated_at" : "2024-02-06 09:07:58"
    },
    {
      "id" : 9,
      "name" : "Roles",
      "slug" : "roles",
      "parent_id" : 7,
      "created_at" : "2024-02-06 09:07:58",
      "updated_at" : "2024-02-06 09:07:58"
    },
  ]);
};
