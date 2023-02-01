const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const dbConnect = () => {
  try {
    const connection = mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected");
  } catch (error) {
    console.log("Server is not connected");
  }
};

module.exports = dbConnect;
