const mongoose = require("mongoose");

const TrendSchema = new mongoose.Schema({
  word: String,
  volume: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trend", TrendSchema);
