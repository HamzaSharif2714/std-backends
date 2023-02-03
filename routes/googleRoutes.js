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

function rateLimit(limit) {
  let requests = 0;
  return function (req, res, next) {
    requests++;
    if (requests > limit) {
      return res.status(429).send("Too many requests");
    }
    next();
  };
}

router.post(
  "/create-event",
  uploadPhoto.array("image", 2),
  uploadPlaces,
  createEvent
);

router.get("/geolocate", getCurrentLocation);
router.get("/location/:lat/:lng", getLocationDetails);
router.get("/", getAllEvents);
router.get("/:lat/:lng/:type/:radius", getGooglePlaces);
router.get("/details/:placeId", getPlaceDetails);
router.get("/:placeId", getPlacePhotos);
module.exports = router;
