const mongoose = require("mongoose");

const trendSchema = new mongoose.Schema({
  title: { type: String, required: true },
  traffic: { type: Number, required: true },
  image: { type: String, default: "" },
  news: { type: Array, default: [] },
  timestamp: { type: Date, default: Date.now },
  isBreaking: { type: Boolean, default: false }, // 🔥 NEW FIELD
});

const Trend = mongoose.model("Trend", trendSchema);

module.exports = Trend;
