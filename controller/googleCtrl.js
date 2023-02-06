const fetch = require("node-fetch");
const fs = require("fs");
const cloudinaryUploadImage = require("../utils/cloudinary");
const Google = require("../models/googleModel");
const asyncHandler = require("express-async-handler");
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const axios = require("axios");
const request = require("request");
const os = require("os");
require("dotenv").config();

const types = [
  {
    type: "dining",
    types: "restaurant",
    keywords: ["bar", "bakery", "cafe"],
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
    types: "night_club",
    keywords: ["bar", "casino"],
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
    types: "zoo",
    keywords: [
      "amusement_park",
      "aquarium",
      "campground",
      "park",
      "tourist_attraction",
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
    type: "art",
    types: "museum",
    keywords: ["art_gallery"],
    excludeTypes: ["painter", "lodging"],
  },

  {
    type: "entertainment",
    types: "movie_theater",
    keywords: [
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
    types: "bar",
    keywords: ["stadium", "casino", "night_club"],
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
    types: "cafe",
    keywords: [
      "spa",
      "aquarium",
      "art_gallery",
      "beauty_salon",
      "book_store",
      "park",
      "shopping_mall",
      "tourist_attraction",
      "university",
    ],
    excludeTypes: ["lodging"],
  },
  {
    type: "celebrations",
    types: "restaurant",
    keywords: [
      "spa",
      "bar",
      "casino",
      "amusement_park",
      "church",
      "hindu_temple",
      "lodging",
      "mosque",
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
    types: "stadium",
    keywords: [],
    excludeTypes: [],
  },
  {
    type: "education",
    types: "library",
    keywords: ["art_gallery", "book_store", "museum", "university", "zoo"],
    excludeTypes: ["supermarket", "convenience_store"],
  },
  {
    type: "sports",
    types: "park",
    keywords: ["stadium", "bowling_alley", "gym", "university"],
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

// original one
// const getGooglePlaces = asyncHandler(async (req, res) => {
//   let { lat, lng } = req.params;
//   let { type, radius, next_page_token } = req.body;

//   radius = parseInt(radius, 10);
//   let pageSize = 20;
//   let page = 1;

//   let results = [];
//   const validType = types.find((t) => t.type === type);
//   if (!validType) {
//     return res.status(400).json({ success: false, error: "Invalid type" });
//   }

//   let keywords = validType.keywords.join("|");
//   let excludeTypes = validType.excludeTypes;
//   let mainType = validType.types;

//   let response;
//   if (next_page_token) {
//     response = await axios.get(
//       `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${next_page_token}&key=${apiKey}`
//     );
//   } else {
//     response = await axios.get(
//       `https://maps.googleapis.com/maps/api/place/nearbysearch/json?type=${mainType}&keyword=${keywords}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`
//     );
//   }
//   if (response.data.status === "ZERO_RESULTS") {
//     return res.status(204).send({
//       success: false,
//       error: "No places found in this radius ",
//     });
//   }
//   if (response.data.status === "INVALID_REQUEST") {
//     return res.status(400).json({
//       success: false,
//       error:
//         "API request was malformed, generally due to missing required query parameter ",
//     });
//   }
//   if (response.data.status === "OVER_QUERY_LIMIT") {
//     return res.status(429).json({
//       success: false,
//       error: "Over query limit, please try again later",
//     });
//   }

//   if (response.data.status === "REQUEST_DENIED") {
//     return res.status(403).json({
//       success: false,
//       error: "The request is missing an API key or key parameter is invalid ",
//     });
//   }
//   if (response.data.status === "UNKNOWN_ERROR") {
//     return res.status(500).json({
//       success: false,
//       error: " Unknown error ",
//     });
//   }
//   results = response.data.results;
//   next_page_token = response.data.next_page_token;

//   const filteredResults = results.filter((result) => {
//     let match = false;
//     for (let i = 0; i < result.types.length; i++) {
//       if (excludeTypes.includes(result.types[i])) {
//         match = true;
//         break;
//       }
//     }
//     return !match;
//   });

//   results = filteredResults;

//   // Filter out only the required fields from the results
//   let imagePromises = [];
//   for (const result of results) {
//     if (result.photos && result.photos.length > 0) {
//       const photoReference = result.photos[0].photo_reference;
//       imagePromises.push(convertToBase64(photoReference));
//     } else {
//       imagePromises.push(null);
//     }
//   }

//   const images = await Promise.all(imagePromises);
//   let selectedFields = [];
//   for (let i = 0; i < results.length; i++) {
//     // Add result to selectedFields array
//     selectedFields.push({
//       venue_name: results[i].name,
//       image: images[i],
//       google_place_id: results[i].place_id,
//       description: results[i].vicinity,
//       location: {
//         latitude: results[i].geometry.location.lat,
//         longitude: results[i].geometry.location.lng,
//       },
//     });
//   }
//   const startIndex = (page - 1) * pageSize;
//   const endIndex = startIndex + pageSize;
//   selectedFields = selectedFields.slice(startIndex, endIndex);
//   return res.status(200).json({
//     success: true,
//     data: {
//       totalResults: selectedFields.length,
//       next_page_token: next_page_token || null,
//       places: selectedFields,
//     },
//   });
// });
const getGooglePlaces = asyncHandler(async (req, res) => {
  let { lat, lng, type, radius } = req.params;
  // let { type, radius } = req.body;

  radius = parseInt(radius, 10);

  let results = [];
  const validType = types.find((t) => t.type === type);
  if (!validType) {
    return res.status(400).json({ success: false, error: "Invalid type" });
  }

  let keywords = validType.keywords.join("|");
  let excludeTypes = validType.excludeTypes;
  let mainType = validType.types;

  let response;
  response = await axios.get(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?type=${mainType}&keyword=${keywords}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`
  );

  if (response.data.status === "INVALID_REQUEST") {
    return res.status(400).json({
      success: false,
      error:
        "API request was malformed, generally due to missing required query parameter ",
    });
  }
  if (response.data.status === "OVER_QUERY_LIMIT") {
    return res.status(429).json({
      success: false,
      error: "Over query limit, please try again later",
    });
  }
  if (response.data.status === "ZERO_RESULTS") {
    return res.status(404).json({
      success: false,
      error: "No results found in this radius",
    });
  }

  if (response.data.status === "REQUEST_DENIED") {
    return res.status(403).json({
      success: false,
      error: "The request is missing an API key or key parameter is invalid ",
    });
  }
  if (response.data.status === "UNKNOWN_ERROR") {
    return res.status(500).json({
      success: false,
      error: " Unknown error ",
    });
  }
  results = response.data.results;

  const filteredResults = results.filter((result) => {
    let match = false;
    for (let i = 0; i < result.types.length; i++) {
      if (excludeTypes.includes(result.types[i])) {
        match = true;
        break;
      }
    }
    return !match;
  });

  results = filteredResults;

  // Filter out only the required fields from the results
  let imagePromises = [];
  for (const result of results) {
    if (result.photos && result.photos.length > 0) {
      const photoReference = result.photos[0].photo_reference;
      imagePromises.push(convertToBase64(photoReference));
    } else {
      imagePromises.push(null);
    }
  }

  const images = await Promise.all(imagePromises);
  let selectedFields = [];
  for (let i = 0; i < results.length; i++) {
    // Add result to selectedFields array
    selectedFields.push({
      venue_name: results[i].name,
      image: images[i],
      google_place_id: results[i].place_id,
      description: results[i].vicinity,
      location: {
        latitude: results[i].geometry.location.lat,
        longitude: results[i].geometry.location.lng,
      },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      totalResults: selectedFields.length,
      places: selectedFields,
    },
  });
});

const getPlacePhotos = async (req, res) => {
  const { placeId } = req.params;

  try {
    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photo&key=${apiKey}`
    );

    let detailsData = await detailsResponse.json();
    if (detailsData.status === "ZERO_RESULTS") {
      return res.status(204).json({
        success: false,
        error: "No photos found for this place",
      });
    }
    if (detailsData.status === "INVALID_REQUEST") {
      return res.status(400).json({
        success: false,
        error:
          "API request was malformed, generally due to missing required query parameter ",
      });
    }
    if (detailsData.status === "OVER_QUERY_LIMIT") {
      return res.status(429).json({
        success: false,
        error: "Over query limit, please try again later",
      });
    }

    if (detailsData.status === "REQUEST_DENIED") {
      return res.status(403).json({
        success: false,
        error: "The request is missing an API key or key parameter is invalid ",
      });
    }
    if (detailsData.status === "UNKNOWN_ERROR") {
      return res.status(500).json({
        success: false,
        error: " Unknown error ",
      });
    }

    let photos = detailsData.result.photos;

    let photoData = await Promise.all(
      photos?.map(async (photo) => {
        let photoResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${photo.width}&photo_reference=${photo.photo_reference}&key=${apiKey}`
        );
        let arrayBuffer = await photoResponse.arrayBuffer();
        return Buffer.from(arrayBuffer).toString("base64");
      })
    );
    res.json(photoData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching photos" });
  }
};

const getPlaceDetails = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?fields=name,formatted_address,rating,formatted_phone_number,website,opening_hours,photos,reviews,geometry/location&place_id=${placeId}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    const detailsResponse = await axios.get(detailsUrl);

    const placeData = detailsResponse.data;
    if (placeData.status === "ZERO_RESULTS") {
      return res.status(204).json({
        success: false,
        error:
          "Place Id, was valid but no longer refers to a valid result. This may occur if the establishment is no longer in business.  ",
      });
    }
    if (placeData.status === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Place Id, was not found in the Places database.  ",
      });
    }
    if (placeData.status === "INVALID_REQUEST") {
      return res.status(400).json({
        success: false,
        error:
          "API request was malformed, generally due to missing required query parameter ",
      });
    }
    if (placeData.status === "OVER_QUERY_LIMIT") {
      return res.status(429).json({
        success: false,
        error: "Over query limit, please try again later",
      });
    }

    if (placeData.status === "REQUEST_DENIED") {
      return res.status(403).json({
        success: false,
        error: "The request is missing an API key or key parameter is invalid ",
      });
    }
    if (placeData.status === "UNKNOWN_ERROR") {
      return res.status(500).json({
        success: false,
        error: " Unknown error ",
      });
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
    category: googleData.category,
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

const getCurrentLocation = asyncHandler(async (req, res) => {
  try {
    const wifiAccessPoints = [];
    const interfaces = os.networkInterfaces();
    for (const [key, values] of Object.entries(interfaces)) {
      for (const { family, internal, mac } of values) {
        if (family === "IPv4" && !internal) {
          wifiAccessPoints.push({
            macAddress: mac,
            signalStrength: -30,
            signalToNoiseRatio: 0,
          });
        }
      }
    }

    const response = await axios.post(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
      {
        considerIp: true,
        wifiAccessPoints,
      }
    );

    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error });
  }
});

const getLocationDetails = asyncHandler(async (req, res) => {
  const { lat, lng } = req.params;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const addressComponents = response.data.results[0].address_components;
    const city =
      addressComponents.find(
        (component) =>
          component.types.includes("administrative_area_level_2") ||
          component.types.includes("locality")
      )?.long_name || "N/A";
    const area =
      addressComponents.find(
        (component) =>
          component.types.includes("sublocality") ||
          component.types.includes("neighborhood")
      )?.long_name || "N/A";
    const street =
      addressComponents.find(
        (component) =>
          component.types.includes("route") ||
          component.types.includes("street_address")
      )?.long_name || "N/A";
    const building =
      addressComponents.find(
        (component) =>
          component.types.includes("premise") ||
          component.types.includes("establishment")
      )?.long_name || "N/A";
    res.send({ city, area, street, building });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = {
  getGooglePlaces,
  createEvent,
  getPlacePhotos,
  getPlaceDetails,
  getAllEvents,
  getCurrentLocation,
  getLocationDetails,
};
