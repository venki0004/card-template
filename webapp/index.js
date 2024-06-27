const express = require("express");
const app = express();
require("express-async-errors");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3001;
if (dotenv.error) {
  console.trace(".env file is missing");
  process.exit(0);
}

app.use(express.static("public"));
require("./bootstrap/routes")(app);
app.enable("trust proxy");

app.listen(PORT, () => {
  console.log(`Server Listening on port: ${PORT}`);
});
