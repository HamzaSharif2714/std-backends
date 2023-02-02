const Friend = require("../models/freindListModel");
const asyncHandler = require("express-async-handler");

// createFriend
const createFriend = asyncHandler(async (req, res) => {
  const friendData = req.body;
  let friend = await Friend.create({
    name: friendData.name,
    image: friendData.image,
  });
  friend = await friend.save();
  return res
    .status(201)
    .json({ message: "Friend data saved successfully", friend });
});

// getAllFriends
const getAllFriends = asyncHandler(async (req, res) => {
  try {
    const getFriends = await Friend.find();
    if (!getFriends || getFriends.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No friends found" });
    }
    res.json({ success: true, data: getFriends });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { createFriend, getAllFriends };
