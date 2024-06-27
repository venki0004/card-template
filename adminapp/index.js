const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 3001;
const app = express();
try {
  require("./express")(app);
  app.listen(PORT, () => {
    console.log(`Server Listening on port: ${PORT}`);
  });
} catch (error) {
  console.log(error);
  process.exit(0);
}
