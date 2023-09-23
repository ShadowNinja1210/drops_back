const mongoose = require("mongoose");

const dropSchema = new mongoose.Schema({
  name: String,
  count: Number,
  date: String,
});

module.exports = mongoose.model("Drop", dropSchema);
