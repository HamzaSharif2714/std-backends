const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res) => {
  const categoryData = req.body;
  let category = await Category.create({
    name: categoryData.name,
  });
  category = await category.save();
  return res
    .status(201)
    .json({ message: "Category data saved successfully", category });
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const getCategories = await Category.find();
    if (!getCategories || getCategories.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No categories found" });
    }
    res.json({ success: true, data: getCategories });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { createCategory, getAllCategories };
