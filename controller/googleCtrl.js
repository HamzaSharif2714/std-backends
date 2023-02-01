const fs = require("fs");
const cloudinaryUploadImage = require("../utils/cloudinary");
const Google = require("../models/googleModel");
const asyncHandler = require("express-async-handler");
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const axios = require("axios");
const request = require("request");
require("dotenv").config();

const types = [
  {
    type: "dining",
    keywords: ["bar", "bakery", "cafe", "restaurant"],

    excludeTypes: [
      "liquor_store",
      "store",
      "supermarket",
      "airport",
      "convenience_store",
    ],
  },
  {
    type: "nightlife",
    keywords: ["night_club", "bar", "casino"],
    excludeTypes: [
      "liquor_store",
      "atm",
      "bowling_alley",
      "cafe",
      "restaurant",
      "bakery",
      "store",
    ],
  },
  {
    type: "adventure",
    keywords: [
      "amusement_park",
      "aquarium",
      "campground",
      "park",
      "tourist_attraction",
      "zoo",
      "airport",
      "bus_station",
      "light_rail_station",
      "natural_feature",
      "point_of_interest",
    ],
    excludeTypes: [
      "courthouse",
      "city_hall",
      "library",
      "embassy",
      "local_government_office",
      "museum",
      "travel_agency",
    ],
  },
  {
    type: "dining",
    keywords: ["Bar", "bakery", "cafe", "restaurant"],
    excludeTypes: [
      "liquor_store",
      "store",
      "supermarket",
      "airport",
      "convenience_store",
    ],
  },
  {
    type: "art",
    keywords: ["art_gallery", "museum"],
    excludeTypes: ["painter", "lodging"],
  },
  {
    type: "entertainment",
    keywords: [
      "movie_theater",
      "stadium",
      "tourist_attraction",
      "museum",
      "night_club",
      "bar",
      "amusement_park",
      "book_store",
    ],
    excludeTypes: ["liquor_store", "atm", "cafe", "restaurant", "bakery"],
  },
  {
    type: "music",
    keywords: ["bar", "stadium", "casino", "night_club"],
    excludeTypes: [
      "bowling_alley",
      "church",
      "movie_theater",
      "liquor_store",
      "atm",
      "cafe",
      "restaurant",
      "bakery",
      "store",
    ],
  },
  {
    type: "casual",
    keywords: [
      "spa",
      "aquarium",
      "art_gallery",
      "beauty_salon",
      "book_store",
      "cafe",
      "park",
      "shopping_mall",
      "tourist_attraction",
      "university",
    ],
    excludeTypes: ["lodging"],
  },
  {
    type: "celebrations",
    keywords: [
      "spa",
      "bar",
      "casino",
      "amusement_park",
      "church",
      "hindu_temple",
      "lodging",
      "mosque",
      "restaurant",
      "stadium",
      "synagogue",
      "tourist_attraction",
      "place_of_worship",
    ],
    excludeTypes: [
      "bowling_alley",
      "movie_theater",
      "liquor_store",
      "bakery",
      "cafe",
      "store",
      "supermarket",
    ],
  },
  {
    type: "gaming",
    keywords: ["stadium"],
    excludeTypes: [],
  },
  {
    type: "education",
    keywords: [
      "art_gallery",
      "book_store",
      "museum",
      "library",
      "university",
      "zoo",
    ],
    excludeTypes: ["supermarket", "convenience_store"],
  },
  {
    type: "sports",
    keywords: ["stadium", "bowling_alley", "gym", "park", "university"],
    excludeTypes: ["lodging", "zoo", "amusement_park"],
  },
];

const convertToBase64 = (photoReference) => {
  return new Promise((resolve, reject) => {
    request(
      {
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`,
        encoding: null,
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          const base64 = body.toString("base64");
          resolve(base64);
        }
      }
    );
  });
};

const getGooglePlaces = asyncHandler(async (req, res) => {
  let { lat, lng, type, radius } = req.params;
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ success: false, error: "Latitude and longitude are required." });
  }
  if (!type) {
    return res.status(400).json({ success: false, error: "Type is required." });
  }
  if (!radius) {
    return res
      .status(400)
      .json({ success: false, error: "Radius is required." });
  }
  radius = parseInt(radius, 10);
  let results = [];
  const validType = types.find((t) => t.type === type);
  if (!validType) {
    return res.status(400).json({ success: false, error: "Invalid type" });
  }

  let keywords = validType.keywords;
  let excludeTypes = validType.excludeTypes;

  while (results.length < 6) {
    let response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&keyword=${keywords.join(
        "|"
      )}&key=${apiKey}`
    );
    if (response.data.status === "OVER_QUERY_LIMIT") {
      return res.status(429).json({
        success: false,
        error: "Over query limit, please try again later",
      });
    }
    console.log("The url are =====>", response.config.url);
    results = response.data.results;

    radius += 500;
  }
  // Filter results by keywords if provided
  if (keywords && typeof keywords === "string") {
    keywords = keywords.split(",");
    results = results.filter((result) => {
      return keywords.some((keyword) =>
        result.name.toLowerCase().includes(keyword.toLowerCase())
      );
    });
  }

  // Filter results by excludeTypes if provided
  if (excludeTypes && typeof excludeTypes === "string") {
    excludeTypes = excludeTypes.split(",");
    results = results.filter((result) => {
      return !excludeTypes.some((excludeType) =>
        result.types.includes(excludeType)
      );
    });
  }
  // Filter out only the required fields from the results
  let selectedFields = [];
  for (const result of results) {
    let image;
    if (result.photos && result.photos.length > 0) {
      // Get image in base64 format
      const photoReference = result.photos[0].photo_reference;
      image = await convertToBase64(photoReference);
    }
    // Add result to selectedFields array
    selectedFields.push({
      venue_name: result.name,
      image: image,
      google_place_id: result.place_id,
      description: result.vicinity,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      types: result.types,
    });
  }

  return res.status(200).json({
    success: true,
    data: selectedFields,
    total: selectedFields.length,
  });
});

const getPlacePhotos = asyncHandler(async (req, res) => {
  const { place_id } = req.params;
  if (!place_id) {
    return res
      .status(400)
      .json({ error: "Missing required parameter 'place_id'" });
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({ error: "API Key is not set" });
  }

  try {
    // Use the 'axios' API to retrieve the place details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?fields=photo&place_id=${place_id}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    const detailsResponse = await axios(detailsUrl);
    const placeData = await detailsResponse.json();

    if (!placeData.result || !placeData.result.photos) {
      return res.status(404).json({ error: "No photos found for this place" });
    }

    // Use Promise.all() to retrieve all of the images in parallel
    const photos = placeData.result.photos;
    const photoUrls = photos.map(
      (photo) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );
    const photoResponses = await Promise.all(
      photoUrls.map((url) => axios(url))
    );
    const images = await Promise.all(
      photoResponses.map((response) => response.arrayBuffer())
    );

    // Process the images in a single step
    const placePhotos = images.map((image) => {
      const base64 = Buffer.from(image, "binary").toString("base64");
      return {
        data: base64,
        type: "image/jpeg",
      };
    });
    res.json(placePhotos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An unknown error occurred" });
  }
});

const getPlaceDetails = asyncHandler(async (req, res) => {
  const { placeId } = req.params;
  if (!placeId || !placeId.trim().length || !placeId.trim()) {
    return res.status(400).json({
      success: false,
      error: "Missing or invalid 'placeId' parameter",
    });
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return res
      .status(500)
      .json({ success: false, error: "API Key is not set" });
  }

  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?fields=name,formatted_address,rating,formatted_phone_number,website,opening_hours,photos,reviews,geometry/location&place_id=${placeId}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    const detailsResponse = await axios.get(detailsUrl);
    const placeData = detailsResponse.data;

    if (!placeData.result) {
      return res.status(404).json({ success: false, error: "Place not found" });
    }
    res.json({ success: true, data: placeData.result });
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ success: false, error: error.response.data });
    } else {
      return res
        .status(500)
        .json({ success: false, error: "An unknown error occurred" });
    }
  }
});

const getAllEvents = asyncHandler(async (req, res) => {
  try {
    const getEvents = await Google.find();
    if (!getEvents || getEvents.length === 0) {
      return res.status(404).json({ success: false, error: "No events found" });
    }
    res.json({ success: true, data: getEvents });
  } catch (error) {
    throw new Error(error);
  }
});

const createEvent = asyncHandler(async (req, res) => {
  const googleData = req.body;
  const uploader = (path) => cloudinaryUploadImage(path, "images");
  const urls = [];
  const files = req.files;
  for (const file of files) {
    const { path } = file;
    const newPath = await uploader(path);
    urls.push(newPath);
    try {
      fs.unlinkSync(path);
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
    }
  }

  let google = await Google.create({
    venue_name: googleData.venue_name,
    description: googleData.description,
    image: urls,
    location: {
      lat: googleData.location.lat,
      lng: googleData.location.lng,
    },
    city: googleData.city,
    street: googleData.street,
    building: googleData.building,
    phoneNumber: googleData.phoneNumber,
    website: googleData.website,
    isPrivate: googleData.isPrivate,
  });
  google = await google.save();
  return res
    .status(201)
    .json({ message: "Google data saved successfully", google });
});

module.exports = {
  getGooglePlaces,
  createEvent,
  getPlacePhotos,
  getPlaceDetails,
  getAllEvents,
};
