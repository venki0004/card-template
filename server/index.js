const express = require("express");

// Import the dotenv library for loading environment variables
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 3001;

// Create an instance of the Express application
const app = express();
const config = require("./bootstrap/loadEnv");

module.exports = Promise.all([config.loadKeys()])
  .then((data) => {
    require("./bootstrap/express")(app);    
    return app.listen(PORT, () => {
      console.log(`Server Listening on port: ${PORT}`)
    })
    
  })
  .catch((error) => {
    console.log(error);
    process.exit(0);
  });
