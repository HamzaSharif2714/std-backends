const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3000;
const app = express();
dbConnect();

require("./startups/routes")(app);

app.listen(PORT, () => {
  console.log(`Server is on port ${PORT}`);
});
