// weather-proxy.js
import express from "express";
import https from "https";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

// Load API key securely
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
if (!WEATHER_API_KEY) {
  console.error("❌ WEATHER_API_KEY is missing in environment!");
  process.exit(1);
}

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🌦️ OpenWx Weather Proxy is running",
    endpoints: ["/weather?q=City", "/forecast?q=City"],
  });
});

// --- Current Weather Endpoint ---
app.get("/weather", (req, res) => {
  const query = req.query.q || "auto:ip";
  const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
    query
  )}&aqi=no`;

  https
    .get(url, (apiRes) => {
      let raw = "";
      apiRes.on("data", (chunk) => (raw += chunk));
      apiRes.on("end", () => {
        try {
          const data = JSON.parse(raw);
          res.json(data);
        } catch (err) {
          res.status(500).json({ error: "Invalid JSON from WeatherAPI" });
        }
      });
    })
    .on("error", (err) => {
      console.error("Weather API Error:", err.message);
      res.status(500).json({ error: "Failed to reach WeatherAPI" });
    });
});

// --- 3-Day Forecast Endpoint ---
app.get("/forecast", (req, res) => {
  const query = req.query.q || "auto:ip";
  const days = req.query.days || 3;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
    query
  )}&days=${days}&aqi=no&alerts=no`;

  https
    .get(url, (apiRes) => {
      let raw = "";
      apiRes.on("data", (chunk) => (raw += chunk));
      apiRes.on("end", () => {
        try {
          const data = JSON.parse(raw);
          res.json(data);
        } catch (err) {
          res.status(500).json({ error: "Invalid JSON from WeatherAPI" });
        }
      });
    })
    .on("error", (err) => {
      console.error("Forecast API Error:", err.message);
      res.status(500).json({ error: "Failed to reach WeatherAPI" });
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ OpenWx Proxy running on port ${PORT}`);
});
