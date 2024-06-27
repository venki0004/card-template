const bcrypt = require("bcrypt");

exports.seed = async function(knex) {
  const salt = await bcrypt.genSalt(10);
  let password = await bcrypt.hash('admin123', salt)
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          "id" : 1,
          "name" : "Venkatesh",
          "email" : "venkatesh@scube.me",
          "role_id" : 1,
          "is_active" : 1,
          "phone" : "+919876543212",
          "password" : password
        },
      ]);
    });
};
