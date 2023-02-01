const express = require("express");
const {
  getGooglePlaces,
  createEvent,
  getPlacePhotos,
  getPlaceDetails,
  getAllEvents,
} = require("../controller/googleCtrl");
const { uploadPhoto, uploadPlaces } = require("../middlewares/uploadImages");
const router = express.Router();

router.post(
  "/create-event",
  uploadPhoto.array("image", 2),
  uploadPlaces,
  createEvent
);
router.get("/", getAllEvents);

router.get("/:lat/:lng/:type/:radius", getGooglePlaces);

router.get("/:place_id", getPlacePhotos);

router.get("/details/:placeId", getPlaceDetails);

module.exports = router;
