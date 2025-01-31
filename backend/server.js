require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const xml2js = require("xml2js");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI;
const RSS_URL = process.env.RSS_URL;

if (!RSS_URL) {
  console.error("⚠️ RSS_URL is not set in .env file!");
  process.exit(1);
}

app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Trend Schema with Trend History
const trendSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  traffic: Number,
  image: String,
  news: [
    {
      title: String,
      url: String,
      image: String,
      source: String,
    },
  ],
  timestamp: { type: Date, default: Date.now },
  isBreaking: { type: Boolean, default: false },
  history: [
    {
      timestamp: { type: Date, default: Date.now },
      traffic: Number,
    },
  ],
});

const Trend = mongoose.model("Trend", trendSchema);

// ✅ Function to Parse RSS XML Data
const parseTrendsFromRSS = async (xml) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);

  if (
    !result ||
    !result.rss ||
    !result.rss.channel ||
    !result.rss.channel.item
  ) {
    return [];
  }

  return result.rss.channel.item.map((item) => ({
    title: item.title,
    traffic: parseInt(item["ht:approx_traffic"]) || 0,
    image: item["ht:picture"] || "",
    news: item["ht:news_item"]
      ? Array.isArray(item["ht:news_item"])
        ? item["ht:news_item"].map((news) => ({
            title: news["ht:news_item_title"],
            url: news["ht:news_item_url"],
            image: news["ht:news_item_picture"],
            source: news["ht:news_item_source"],
          }))
        : [
            {
              title: item["ht:news_item"]["ht:news_item_title"],
              url: item["ht:news_item"]["ht:news_item_url"],
              image: item["ht:news_item"]["ht:news_item_picture"],
              source: item["ht:news_item"]["ht:news_item_source"],
            },
          ]
      : [],
  }));
};

// ✅ Function to Fetch and Store Google Trends
const fetchAndStoreTrends = async () => {
  console.log("🔄 Fetching Google Trends...");

  try {
    const response = await axios.get(RSS_URL);
    const parsedTrends = await parseTrendsFromRSS(response.data);

    for (const item of parsedTrends) {
      const existingTrend = await Trend.findOne({ title: item.title });

      if (existingTrend) {
        // ✅ Update existing trend, avoid inserting duplicate entries
        existingTrend.traffic = item.traffic;
        existingTrend.timestamp = new Date();
        existingTrend.isBreaking = item.traffic >= 1000;
        existingTrend.history.push({
          timestamp: new Date(),
          traffic: item.traffic,
        });

        await existingTrend.save();
      } else {
        // ✅ Insert new trend only if it doesn’t already exist
        await Trend.create({
          title: item.title,
          traffic: item.traffic,
          image: item.image || "",
          news: item.news || [],
          timestamp: new Date(),
          isBreaking: item.traffic >= 1000,
          history: [{ timestamp: new Date(), traffic: item.traffic }],
        });
      }
    }

    console.log("✅ Trends updated in MongoDB!");
  } catch (error) {
    console.error("❌ Error fetching trends:", error);
  }
};

// ✅ API Route to Fetch Latest Trends
app.get("/trends", async (req, res) => {
  try {
    const trends = await Trend.find().sort({ traffic: -1 });
    res.json(trends);
  } catch (error) {
    console.error("❌ Error fetching trends from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
});

// ✅ API Route to Fetch Trend History
app.get("/trend-history/:title", async (req, res) => {
  try {
    const trend = await Trend.findOne({ title: req.params.title });

    if (!trend) {
      return res.status(404).json({ error: "Trend not found" });
    }

    res.json({
      title: trend.title,
      traffic: trend.traffic,
      history: trend.history,
    });
  } catch (error) {
    console.error("❌ Error fetching trend history:", error);
    res.status(500).json({ error: "Failed to fetch trend history" });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  fetchAndStoreTrends(); // Fetch trends at startup
  setInterval(fetchAndStoreTrends, 60 * 60 * 1000); // Fetch trends every hour
});
