const mongoose = require("mongoose");

const showTimeSchema = new mongoose.Schema({
  time: String,
});

module.exports = mongoose.model("Showtime", showTimeSchema);
