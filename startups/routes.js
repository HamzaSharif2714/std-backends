const morgan = require("morgan");
const cookie = require("cookie-parser");
const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const googleRouter = require("../routes/googleRoutes");
const friendRouter = require("../routes/friendListRoutes");
const eventRouter = require("../routes/eventRoutes");
const { notFound, errorHandler } = require("../middlewares/errorHandler");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(cookie());

  app.use("/api/google", googleRouter);
  app.use("/api/friends", friendRouter);
  app.use("/api/events", eventRouter);

  app.use(notFound);
  app.use(errorHandler);
};
