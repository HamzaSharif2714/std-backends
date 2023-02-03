const Event = require("../models/eventModel");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const createEvent = asyncHandler(async (req, res) => {
  try {
    const event = new Event({
      title: req.body.title,
      description: req.body.description,
      time: req.body.time,
      date: req.body.date,
      isthisDate: req.body.isthisDate,
      TicketPrice: req.body.TicketPrice,
      locationings: req.body.locationings.map((location) => ({
        place_id: location.place_id,
        imageUrl: location.imageUrl,
        name: location.name,
        description: location.description,
        location: { lat: location.location.lat, lng: location.location.lng },
      })),
      peopleinformations: req.body.peopleinformations.map((peopleInfo) => ({
        id: uuidv4(),
        number: peopleInfo.number,
        gender: peopleInfo.gender,
        age: [peopleInfo.age.min, peopleInfo.age.max],
      })),
    });

    const savedEvent = await event.save();
    res.status(200).json({ message: "Event created successfully", savedEvent });
  } catch (error) {
    res.status(400).json({ message: "Error creating event", error });
  }
});

module.exports = { createEvent };
