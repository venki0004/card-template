const environment = process.env.ENVIRONMENT || "development";
const config = require("../knexfile.js")[environment];
const { attachPaginate } = require("knex-paginate");
attachPaginate();
module.exports = require("knex")(config);
