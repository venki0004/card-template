/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('roles').del()
  await knex('roles').insert([
    {
      "id" : 1,
      "name" : "Admin",
      "is_deleted" : 0,
      "is_manager" : 1,
      "is_default" : 1,
      "slug" : "admin",
    },
    {
      "id" : 2,
      "name" : "Executive",
      "is_deleted" : 0,
      "is_manager" : 0,
      "is_default" : 1,
      "slug" : "executive",
    },
    {
      "id" : 3,
      "name" : "Vendor",
      "is_deleted" : 0,
      "is_manager" : 0,
      "is_default" : 1,
      "slug" : "vendor",
    },
  ]);
};
