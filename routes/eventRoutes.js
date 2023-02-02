const express = require("express");
const { createEvent } = require("../controller/eventCtrl");
const router = express.Router();

router.post("/", createEvent);

module.exports = router;
