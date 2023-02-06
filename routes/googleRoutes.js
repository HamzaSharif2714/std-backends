const express = require("express");
const {
  getGooglePlaces,
  createEvent,
  getPlacePhotos,
  getPlaceDetails,
  getAllEvents,
  getCurrentLocation,
  getLocationDetails,
} = require("../controller/googleCtrl");
const { uploadPhoto, uploadPlaces } = require("../middlewares/uploadImages");
const router = express.Router();

router.post(
  "/create-event",
  uploadPhoto.array("image", 2),
  uploadPlaces,
  createEvent
);
router.get("/:lat/:lng/:type/:radius", getGooglePlaces);

router.get("/geolocate", getCurrentLocation);
router.get("/location/:lat/:lng", getLocationDetails);
router.get("/", getAllEvents);
router.get("/details/:placeId", getPlaceDetails);
router.get("/:placeId", getPlacePhotos);
module.exports = router;
