const morgan = require("morgan");
const cookie = require("cookie-parser");
const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const googleRouter = require("../routes/googleRoutes");
const { notFound, errorHandler } = require("../middlewares/errorHandler");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(cookie());

  app.use("/api/google", googleRouter);

  app.use(notFound);
  app.use(errorHandler);
};
