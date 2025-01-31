const axios = require("axios");
const xml2js = require("xml2js");
const Trend = require("../models/Trend");

const RSS_FEED_URL = "https://trends.google.co.th/trending/rss?geo=TH";

async function fetchTrends() {
  try {
    const response = await axios.get(RSS_FEED_URL);
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    const trends = result.rss.channel.item.map((item) => ({
      word: item.title,
      volume: parseVolume(item["ht:approx_traffic"] || "100+"),
      date: new Date(),
    }));

    trends.forEach(async (trend) => {
      await Trend.findOneAndUpdate(
        {
          word: trend.word,
          date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        trend,
        { upsert: true }
      );
    });

    console.log("✅ Trends updated.");
  } catch (error) {
    console.error("❌ Error fetching RSS feed:", error);
  }
}

function parseVolume(text) {
  const match = text.match(/(\d+)([KkM]*)/);
  if (!match) return 100;
  let value = parseInt(match[1], 10);
  if (text.includes("M")) value *= 1000000;
  if (text.includes("K")) value *= 1000;
  return value;
}

module.exports = fetchTrends;
