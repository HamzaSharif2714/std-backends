const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.NAME,
  api_key: process.env.KEY,
  api_secret: process.env.SECRET,
});

const cloudinaryUploadImage = async (fileToUploads) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUploads, (result) => {
      resolve(
        {
          url: result.secure_url,
        },
        {
          resource_type: "auto",
        }
      );
    });
  });
};

module.exports = cloudinaryUploadImage;
