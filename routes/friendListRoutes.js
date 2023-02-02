const express = require("express");
const { createFriend, getAllFriends } = require("../controller/friendListCtrl");
const router = express.Router();

router.post("/", createFriend);
router.get("/", getAllFriends);

module.exports = router;
